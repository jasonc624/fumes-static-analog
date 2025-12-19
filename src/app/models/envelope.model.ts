// Envelope and Agreement Models for Digital Signature System

export interface Timestamp {
  seconds: number;
  nanoseconds: number;
}

export interface SignatureField {
  type: 'signature' | 'initials' | 'date' | 'fullName' | 'text' | 'checkbox';
  required: boolean;
  position?: {
    x: number;
    y: number;
    width?: number;
    height?: number;
  };
  value?: string;
  placeholder?: string;
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
}

export interface AgreementSection {
  id: string;
  sectionTitle: string;
  sectionBody: string;
  order: number;

  // Signature requirements
  digitalSignature: boolean;
  initials: boolean;
  fullName: boolean;
  date: boolean;
  acknowledge?: boolean;

  // Additional fields for dynamic content
  signatureFields?: SignatureField[];
  isRequired?: boolean;

  // Form control values (populated during signing)
  values?: {
    digitalSignature?: string;
    initials?: string;
    fullName?: string;
    date?: string;
    acknowledge?: boolean;
    [key: string]: any;
  };

  // E-sign compliance: Captured signature data with metadata
  signatureData?: {
    signature?: string; // Base64 image or signature data
    initials?: string;
    fullName?: string;
    date?: string; // ISO string
    acknowledge?: boolean;
    capturedAt?: string; // ISO timestamp when this section was signed
  };
}

export interface Agreement {
  id: string;
  name: string;
  type: string;
  fleetRef?: string;
  wet_sign: boolean;
  appliedTo: any[];
  created: Timestamp;
  updated: Timestamp;

  // Agreement content
  text: AgreementSection[];

  // Signing status
  isSigned?: boolean;
  signedAt?: Timestamp;
  signedBy?: string;

  // Metadata
  version?: string;
  templateId?: string;
  customFields?: { [key: string]: any };

  // E-sign compliance: Agreement-level signature metadata
  signatureMetadata?: {
    signedAt?: string; // ISO timestamp
    signerIp?: string; // IP address of signer
    signerUserAgent?: string; // Browser user agent
    signatureMethod?: 'digital' | 'wet_sign' | 'electronic'; // Method used
    auditTrail?: AuditEvent[]; // Full audit trail for this agreement
  };
}

// E-sign compliance: Audit trail event
export interface AuditEvent {
  event: 'viewed' | 'started' | 'section_completed' | 'completed' | 'declined' | 'authenticated' | 'sent';
  timestamp: string; // ISO timestamp
  actor?: string; // Email or ID of person who triggered event
  ipAddress?: string;
  userAgent?: string;
  metadata?: {
    sectionId?: string;
    fieldType?: string;
    [key: string]: any;
  };
}

export interface Signer {
  id: string;
  name: string;
  email: string;
  role?: string;
  order: number;
  status: 'pending' | 'signed' | 'declined' | 'expired';
  signedAt?: Timestamp;
  ipAddress?: string;
  userAgent?: string;
}

export interface Envelope {
  id: string;
  name: string;
  status: 'draft' | 'sent' | 'in_progress' | 'completed' | 'declined' | 'expired';
  created: Timestamp;
  updated: Timestamp;

  // Agreements in this envelope
  agreements: Agreement[];
  agreements_to_sign?: Agreement[]; // Legacy support

  // Signers
  signers: Signer[];
  currentSigner?: string;

  // Envelope settings
  settings: {
    sequential_signing: boolean;
    reminder_enabled: boolean;
    reminder_interval_days?: number;
    expiration_days?: number;
    require_authentication?: boolean;
    allow_decline?: boolean;
  };

  // Completion status
  isSigned?: boolean;
  completedAt?: Timestamp;

  // Associated data for template rendering
  customer?: any;
  vehicle?: any;
  reservation?: any;

  // Metadata
  fleetRef?: string;
  templateIds?: string[];
  customData?: { [key: string]: any };

  // E-sign compliance: Envelope-level metadata
  envelopeMetadata?: {
    sentAt?: string; // ISO timestamp when envelope was sent
    viewedAt?: string; // ISO timestamp when first viewed by signer
    completedAt?: string; // ISO timestamp when fully completed
    declinedAt?: string; // ISO timestamp if declined
    expiredAt?: string; // ISO timestamp if expired
    remindersSent?: number; // Count of reminders sent
    lastReminderAt?: string; // ISO timestamp of last reminder
    auditTrail?: AuditEvent[]; // Full envelope-level audit trail
  };

  // Booking reference for rental agreements
  bookingRef?: string;
  signer_email?: string;
  customerViewed?: boolean;
  dateViewed?: Timestamp;
  ttl?: Timestamp; // Time-to-live / expiration
}

export interface EnvelopeFormData {
  agreements: {
    [agreementId: string]: {
      sections: {
        [sectionId: string]: {
          digitalSignature?: string;
          initials?: string;
          fullName?: string;
          date?: string;
          acknowledge?: boolean;
          [key: string]: any;
        };
      };
    };
  };
}

// Form structure for reactive forms
export interface AgreementFormGroup {
  sections: {
    [sectionId: string]: {
      digitalSignature?: string;
      initials?: string;
      fullName?: string;
      date?: string;
      acknowledge?: boolean;
      [key: string]: any;
    };
  };
}

export interface EnvelopeFormGroup {
  agreements: {
    [agreementId: string]: AgreementFormGroup;
  };
}

// Response types for API
export interface EnvelopeResponse {
  envelope: Envelope;
  success: boolean;
  message?: string;
}

export interface SigningResponse {
  success: boolean;
  envelope: Envelope;
  message?: string;
  redirectUrl?: string;
}