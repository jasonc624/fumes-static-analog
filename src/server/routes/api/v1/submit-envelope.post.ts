import { defineEventHandler, readBody, createError } from 'h3';
import { submitSignedEnvelope } from '../../../controllers/envelope.controller';

/**
 * API Endpoint: POST /api/v1/submit-envelope
 *
 * Handles submission of signed rental agreement envelopes.
 * Updates Firestore with signature data, audit trail, and e-sign compliance metadata.
 *
 * Request Body:
 * - envelopeId: string - The envelope ID
 * - bookingRef: string - The booking reference
 * - signedData: object - Contains agreement signatures and metadata
 * - auditTrail: AuditEvent[] - Full audit trail from the signing session
 *
 * Response on Success:
 * - success: true
 * - message: string
 * - data: { envelopeId, status, completedAt, message }
 *
 * Response on Error:
 * - success: false
 * - code: string - Error code for client-side handling
 * - message: string - User-friendly error message
 * - details: object - Additional error details (optional)
 */
export default defineEventHandler(async (event) => {
  try {
    // Only allow POST requests
    if (event.method !== 'POST') {
      throw createError({
        statusCode: 405,
        data: {
          success: false,
          code: 'METHOD_NOT_ALLOWED',
          message: 'Only POST requests are allowed for this endpoint.'
        }
      });
    }

    // Read request body
    const body = await readBody(event);

    // Validate required fields - request body validation
    if (!body.envelopeId) {
      throw createError({
        statusCode: 400,
        data: {
          success: false,
          code: 'MISSING_ENVELOPE_ID',
          message: 'Envelope ID is required to submit an agreement.'
        }
      });
    }

    if (!body.bookingRef) {
      throw createError({
        statusCode: 400,
        data: {
          success: false,
          code: 'MISSING_BOOKING_REF',
          message: 'Booking reference is required to submit an agreement.'
        }
      });
    }

    if (!body.signedData) {
      throw createError({
        statusCode: 400,
        data: {
          success: false,
          code: 'MISSING_SIGNED_DATA',
          message: 'Signed agreement data is required.'
        }
      });
    }

    // Extract client IP address for e-sign compliance
    const ipAddress = event.node.req.headers['x-forwarded-for'] ||
                      event.node.req.headers['x-real-ip'] ||
                      event.node.req.socket?.remoteAddress ||
                      'unknown';

    // Add IP address to signed data metadata
    if (body.signedData.metadata) {
      body.signedData.metadata.ipAddress = Array.isArray(ipAddress)
        ? ipAddress[0]
        : ipAddress;
    }
    console.log("body.signedData.metadata", body.signedData);
    // Submit the envelope via controller
    const result = await submitSignedEnvelope({
      envelopeId: body.envelopeId,
      bookingRef: body.bookingRef,
      signedData: body.signedData,
      auditTrail: body.auditTrail || [],
      ipAddress: Array.isArray(ipAddress) ? ipAddress[0] : ipAddress
    });

    return {
      success: true,
      message: 'Your agreement has been successfully submitted and signed.',
      data: result
    };

  } catch (error: any) {
    console.error('Error submitting envelope:', error);

    // If it's a controller error with statusCode, format as response
    if (error.statusCode && error.code) {
      throw createError({
        statusCode: error.statusCode,
        data: {
          success: false,
          code: error.code,
          message: error.message
        }
      });
    }

    // If it's already an H3 error, rethrow it
    if (error.statusCode) {
      throw error;
    }

    // Fallback: generic server error
    throw createError({
      statusCode: 500,
      data: {
        success: false,
        code: 'SERVER_ERROR',
        message: 'An unexpected error occurred while processing your request. Please try again later.'
      }
    });
  }
});
