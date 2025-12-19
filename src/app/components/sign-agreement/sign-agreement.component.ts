import { HttpClient } from "@angular/common/http";
import {
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  inject,
  PLATFORM_ID,
} from "@angular/core";
import {
  FormsModule,
} from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatStepperModule } from "@angular/material/stepper";
import { MatIconModule } from "@angular/material/icon";
import { MatDialog } from "@angular/material/dialog";
import { ActivatedRoute } from "@angular/router";
import { isPlatformBrowser } from "@angular/common";


import {
  finalize,
  takeUntil,
  timer,
} from "rxjs";
import { CommonModule } from "@angular/common";
import { Images } from "@fumes/constants";
import { BaseComponent, Booking } from "@fumes/types";
import { RentalAgreementComponent } from "../rental-agreement/rental-agreement.component";
import { EnvelopeSubmissionDialogComponent } from "../envelope-submission-dialog/envelope-submission-dialog.component";
import { Envelope, Agreement, AuditEvent } from "../../models/envelope.model";

interface AgreementData {
  id: string;
  name: string;
  sections: {
    id?: string;
    sectionTitle: string;
    sectionBody: string;
    requiredSignatures: ('signature' | 'initials' | 'fullName' | 'date')[];
  }[];
  actualValues?: {
    customer?: Record<string, any>;
    vehicle?: Record<string, any>;
    reservation?: Record<string, any>;
  };
}
@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatStepperModule,
    MatIconModule,
    RentalAgreementComponent,
  ],
  selector: "app-sign-agreement",
  templateUrl: "./sign-agreement.component.html",
  styleUrls: ["./sign-agreement.component.scss"],
})
export class SignAgreementComponent extends BaseComponent implements OnInit {
  @Input() agreementId!: string;
  _Images = Images;
  authenticated = false;
  bookingId: string = '';
  password = "";
  agreementDocument: Envelope | null = null;
  // Multiple agreements to sign
  currentAgreementData: AgreementData | null = null;
  agreementsToSign: AgreementData[] = [];
  // Track which agreements have been signed locally to drive UI
  private signedAgreementIds = new Set<string>();
  isLoading = false;
  booking: Booking = {} as Booking;
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  // Store signed agreement data for complete envelope submission
  private signedAgreementsData!: Map<string, any>;

  // E-sign compliance: Audit trail
  private auditTrail: AuditEvent[] = [];

  // Expose isBrowser to template
  get isClientSide(): boolean {
    return this.isBrowser;
  }

  // Expose signing progress to template
  get signedCount(): number {
    return this.signedAgreementIds.size;
  }

  get allSigned(): boolean {
    return this.agreementsToSign.length > 0 && this.signedAgreementIds.size >= this.agreementsToSign.length;
  }

  // Public helper for template to check if an agreement is signed
  isSigned(agreementId: string): boolean {
    return this.signedAgreementIds.has(agreementId);
  }

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
  ) {
    super();
    this.bookingId = decodeURIComponent(
      this.route.snapshot.queryParams?.['booking'] || ''
    );
  }

  override ngOnInit(): void {
    // Add "viewed" audit event when component initializes
    this.addAuditEvent('viewed', { agreementId: this.agreementId });

  }

  authenticate() {
    this.isLoading = true;

    // Add authentication audit event
    this.addAuditEvent('authenticated', {
      bookingId: this.bookingId,
      agreementId: this.agreementId
    });

    // Call the authentication API endpoint
    return this.http.post('/api/v1/authenticate-agreement', {
      bookingId: this.bookingId,
      password: this.password,
      agreementId: this.agreementId,
    })
      .pipe(
        takeUntil(this.destroyed),
        finalize(() => {
          timer(314).subscribe(() => {
            this.isLoading = false;
            this.cdr.detectChanges();
          });
        })
      )
      .subscribe({
        next: (response: any) => {
          if (response?.success && response?.data?.id) {
            this.authenticated = true;
            const envelope: Envelope = response.data;

            // Store the envelope
            this.agreementDocument = envelope;

            console.log("Authenticated envelope:", this.agreementDocument);

            // Map envelope data to our simplified AgreementData structure
            const agreements = envelope.agreements_to_sign || envelope.agreements || [];
            this.agreementsToSign = agreements.map((ag) => this.mapAgreementToData(ag, envelope));
            this.currentAgreementData = this.agreementsToSign[0] || null;

            // Add "started" audit event
            this.addAuditEvent('started', {
              agreementId: this.currentAgreementData?.id,
              totalAgreements: this.agreementsToSign.length
            });

            // Trigger change detection
            this.cdr.detectChanges();
          }
        },
        error: (err: any) => {
          console.error("Authentication failed", err);
          this.authenticated = false;
          this.cdr.detectChanges();
        },
      });
  }

  /**
   * Map Agreement from envelope to simplified AgreementData structure
   */
  private mapAgreementToData(agreement: Agreement, envelope: Envelope): AgreementData {
    return {
      id: agreement.id,
      name: agreement.name,
      sections: agreement.text.map((section, index) => {
        const requiredSignatures: ('signature' | 'initials' | 'fullName' | 'date')[] = [];

        if (section.digitalSignature) requiredSignatures.push('signature');
        if (section.initials) requiredSignatures.push('initials');
        if (section.fullName) requiredSignatures.push('fullName');
        if (section.date) requiredSignatures.push('date');

        return {
          id: section.id || `section-${index}`,
          sectionTitle: section.sectionTitle,
          sectionBody: section.sectionBody,
          requiredSignatures,
        };
      }),
      actualValues: {
        // Customer, vehicle, and reservation are at the root level of the envelope
        customer: envelope?.customer,
        vehicle: envelope?.vehicle,
        reservation: envelope?.reservation,
      },
    };
  }

  /**
   * Handle agreement signed event from RentalAgreementComponent
   */
  onAgreementSigned(signedData: any): void {
    console.log('Agreement signed:', signedData);

    // Track locally that this agreement was signed IMMEDIATELY
    // This enables stepper navigation without waiting for backend
    this.signedAgreementIds.add(signedData.agreementId);
    
    // Add completed audit event
    this.addAuditEvent('completed', {
      agreementId: signedData.agreementId,
      sectionsCount: signedData.sections.length
    });

    // Store the signed data for later submission when envelope is complete
    if (!this.signedAgreementsData) {
      this.signedAgreementsData = new Map();
    }
    this.signedAgreementsData.set(signedData.agreementId, signedData);

    // Check if all agreements are signed, then submit the entire envelope
    if (this.allSigned) {
      this.submitCompleteEnvelope();
    }

    // Trigger change detection to update UI state
    this.cdr.detectChanges();
  }

  /**
   * Submit the complete envelope when all agreements are signed
   */
  private submitCompleteEnvelope(): void {
    this.isLoading = true;

    // Collect all signed agreement data
    const allSignedData = Array.from(this.signedAgreementsData.values());

    // Submit complete envelope to backend
    this.http.post('/api/v1/submit-envelope', {
      envelopeId: this.agreementDocument?.id,
      bookingRef: this.agreementDocument?.bookingRef || this.bookingId,
      signedData: allSignedData.length === 1 ? allSignedData[0] : allSignedData,
      auditTrail: this.auditTrail,
    })
      .pipe(
        takeUntil(this.destroyed),
        finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (response: any) => {
          console.log('Complete envelope submitted successfully:', response);

          // Show success dialog
          this.dialog.open(EnvelopeSubmissionDialogComponent, {
            width: '450px',
            disableClose: true,
            data: {
              type: 'success',
              title: 'Agreement Successfully Signed',
              message: response.message || 'Your agreement has been successfully submitted and signed.',
              primaryButtonText: 'Done'
            }
          }).afterClosed().subscribe(() => {
            // Redirect or perform next action after dialog closes
            console.log('Success dialog closed');
            // You can add navigation here if needed
          });

          this.cdr.detectChanges();
        },
        error: (err: any) => {
          console.error('Failed to submit complete envelope:', err);

          // Extract error information from response
          let errorMessage = 'Failed to submit your signed agreement. Please try again.';
          let errorCode = 'SUBMISSION_FAILED';
          let errorDetails: string | undefined;

          // Handle HTTP error response
          if (err.error && typeof err.error === 'object') {
            errorMessage = err.error.message || errorMessage;
            errorCode = err.error.code || errorCode;
            errorDetails = err.error.details;
          } else if (err.message) {
            errorMessage = err.message;
          }

          // Show error dialog with retry option
          this.dialog.open(EnvelopeSubmissionDialogComponent, {
            width: '450px',
            disableClose: false,
            data: {
              type: 'error',
              title: 'Submission Failed',
              message: errorMessage,
              details: errorDetails || `Error code: ${errorCode}`,
              primaryButtonText: 'Close',
              secondaryButtonText: 'Try Again'
            }
          }).afterClosed().subscribe((result) => {
            if (result === 'retry') {
              // Retry submission
              this.submitCompleteEnvelope();
            }
          });

          this.isLoading = false;
          this.cdr.detectChanges();
        },
      });
  }

  /**
   * Add audit event with timestamp and metadata
   */
  private addAuditEvent(
    event: 'viewed' | 'started' | 'section_completed' | 'completed' | 'declined' | 'authenticated' | 'sent',
    metadata?: any
  ): void {
    const auditEvent: AuditEvent = {
      event,
      timestamp: new Date().toISOString(),
      actor: this.agreementDocument?.signer_email,
      userAgent: this.isBrowser ? navigator.userAgent : undefined,
      metadata,
    };

    this.auditTrail.push(auditEvent);
    console.log('Audit event added:', auditEvent);
  }
}
