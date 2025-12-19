import { adminDb } from '../../lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

// Minimal server-side shape for envelope documents stored in Firestore
interface EnvelopeDocument {
  isSigned?: boolean;
  status?: string;
  agreements_to_sign?: any[];
  agreements?: any[];
  signer_email?: string;
  envelopeMetadata?: any;
  bookingRef?: string;
}

interface SignedSectionData {
  sectionId: string;
  signatureData: {
    signature?: string;
    initials?: string;
    fullName?: string;
    date?: string;
  };
}

interface SignedData {
  agreementId: string;
  signedAt: string;
  sections: SignedSectionData[];
  metadata: {
    ipAddress?: string;
    userAgent: string;
    signatureMethod: 'digital';
    completedAt: string;
  };
}

interface AuditEvent {
  event: 'viewed' | 'started' | 'section_completed' | 'completed' | 'declined' | 'authenticated' | 'sent';
  timestamp: string;
  actor?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: any;
}

interface SubmitEnvelopeParams {
  envelopeId: string;
  bookingRef: string;
  signedData: SignedData;
  auditTrail: AuditEvent[];
  ipAddress: string;
}

/**
 * Submit a signed envelope and update Firestore with signature data and e-sign compliance metadata
 */
export async function submitSignedEnvelope(params: SubmitEnvelopeParams) {
  const { envelopeId, bookingRef, signedData, auditTrail, ipAddress } = params;

  try {
    // Validate input parameters
    if (!envelopeId) {
      throw {
        code: 'INVALID_ENVELOPE_ID',
        message: 'Envelope ID is required',
        statusCode: 400
      };
    }

    if (!bookingRef) {
      throw {
        code: 'INVALID_BOOKING_REF',
        message: 'Booking reference is required',
        statusCode: 400
      };
    }

    if (!signedData) {
      throw {
        code: 'MISSING_SIGNED_DATA',
        message: 'Signed data is required',
        statusCode: 400
      };
    }

    // Reference to the envelope document
    // Note: Envelopes are stored as subcollections under bookings
    const envelopeRef = adminDb
      .collection('bookings')
      .doc(bookingRef)
      .collection('envelopes')
      .doc(envelopeId);

    // Check if envelope exists
    const envelopeDoc = await envelopeRef.get();

    if (!envelopeDoc.exists) {
      throw {
        code: 'ENVELOPE_NOT_FOUND',
        message: `Envelope not found: ${envelopeId}`,
        statusCode: 404
      };
    }

    const envelopeData = envelopeDoc.data() as EnvelopeDocument;

    // Check if already signed
    if (envelopeData?.isSigned) {
      throw {
        code: 'ENVELOPE_ALREADY_SIGNED',
        message: 'This envelope has already been signed. Duplicate submissions are not allowed.',
        statusCode: 409
      };
    }

    // Prepare the update data
    const now = Timestamp.now();
    const completedAt = signedData.signedAt || new Date().toISOString();

    // Update the agreement with signature data
    const agreements = envelopeData?.agreements_to_sign || envelopeData?.agreements || [];

    if (!Array.isArray(agreements) || agreements.length === 0) {
      throw {
        code: 'NO_AGREEMENTS_FOUND',
        message: 'No agreements found in the envelope',
        statusCode: 400
      };
    }

    const updatedAgreements = agreements.map((agreement: any) => {
      if (agreement.id === signedData.agreementId) {
        // Validate that text array exists
        if (!Array.isArray(agreement.text)) {
          throw {
            code: 'INVALID_AGREEMENT_FORMAT',
            message: `Agreement ${agreement.id} has invalid format (missing text sections)`,
            statusCode: 400
          };
        }

        // Update sections with signature data
        const updatedSections = agreement.text.map((section: any, index: number) => {
          const signedSection = signedData.sections.find(
            s => s.sectionId === section.id || s.sectionId === `section-${index}`
          );

          if (signedSection) {
            return {
              ...section,
              // Store signature data in the signatureData field for e-sign compliance
              signatureData: {
                ...signedSection.signatureData,
                capturedAt: signedData.signedAt,
              },
              // Also store in values for backward compatibility
              values: {
                ...section.values,
                ...signedSection.signatureData,
              },
            };
          }

          return section;
        });

        // Add e-sign compliance metadata to the agreement
        return {
          ...agreement,
          text: updatedSections,
          isSigned: true,
          signedAt: now,
          signedBy: envelopeData?.signer_email || 'unknown',
          signatureMetadata: {
            signedAt: completedAt,
            signerIp: ipAddress,
            signerUserAgent: signedData.metadata.userAgent,
            signatureMethod: signedData.metadata.signatureMethod,
            auditTrail: auditTrail,
          },
        };
      }

      return agreement;
    });

    // Prepare envelope update
    const envelopeUpdate: any = {
      agreements_to_sign: updatedAgreements,
      isSigned: true,
      status: 'completed',
      updated: now,
      completedAt: now,
      // Add envelope-level e-sign compliance metadata
      envelopeMetadata: {
        ...(envelopeData?.envelopeMetadata || {}),
        completedAt: completedAt,
        auditTrail: auditTrail,
      },
    };

    // Update the envelope document
    await envelopeRef.update(envelopeUpdate);

    // Also update the booking document to mark agreements as signed
    const bookingRef_doc = adminDb.collection('bookings').doc(bookingRef);
    await bookingRef_doc.update({
      'agreementsSigned': true,
      'agreementsSignedAt': now,
      'updated': now,
    });

    console.log(`Envelope ${envelopeId} successfully submitted and marked as signed`);

    return {
      envelopeId,
      status: 'completed',
      completedAt: completedAt,
      message: 'Envelope submitted successfully',
    };

  } catch (error: any) {
    console.error('Error in submitSignedEnvelope:', error);

    // If it's our custom error object with statusCode, re-throw as-is
    if (error.statusCode) {
      throw error;
    }

    // Otherwise, wrap in a generic server error
    throw {
      code: 'ENVELOPE_SUBMISSION_FAILED',
      message: `Failed to submit envelope: ${error.message}`,
      statusCode: 500
    };
  }
}

/**
 * Retrieve an envelope by ID (for viewing/downloading signed documents)
 */
export async function getEnvelope(bookingRef: string, envelopeId: string) {
  try {
    const envelopeRef = adminDb
      .collection('bookings')
      .doc(bookingRef)
      .collection('envelopes')
      .doc(envelopeId);

    const envelopeDoc = await envelopeRef.get();

    if (!envelopeDoc.exists) {
      throw new Error(`Envelope not found: ${envelopeId}`);
    }

    return {
      id: envelopeDoc.id,
      ...envelopeDoc.data(),
    };

  } catch (error: any) {
    console.error('Error in getEnvelope:', error);
    throw new Error(`Failed to retrieve envelope: ${error.message}`);
  }
}

/**
 * Create a new envelope for signing (typically called when host sends agreement to guest)
 */
export async function createEnvelope(bookingRef: string, envelopeData: any) {
  try {
    const now = Timestamp.now();

    const newEnvelope = {
      ...envelopeData,
      bookingRef,
      status: 'sent',
      isSigned: false,
      created: now,
      updated: now,
      envelopeMetadata: {
        sentAt: new Date().toISOString(),
        auditTrail: [
          {
            event: 'sent',
            timestamp: new Date().toISOString(),
            actor: 'system',
          },
        ],
      },
    };

    const envelopeRef = await adminDb
      .collection('bookings')
      .doc(bookingRef)
      .collection('envelopes')
      .add(newEnvelope);

    console.log(`Envelope created with ID: ${envelopeRef.id}`);

    return {
      id: envelopeRef.id,
      ...newEnvelope,
    };

  } catch (error: any) {
    console.error('Error in createEnvelope:', error);
    throw new Error(`Failed to create envelope: ${error.message}`);
  }
}
