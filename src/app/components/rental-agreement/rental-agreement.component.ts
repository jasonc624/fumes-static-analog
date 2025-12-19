import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Inject,
  Input,
  OnInit,
  Output,
  PLATFORM_ID,
  signal,
  CUSTOM_ELEMENTS_SCHEMA,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { BaseComponent } from '@fumes/types';
import { AngularSignaturePadModule } from 'angular-17-signature-pad';
import { MatIconModule } from '@angular/material/icon';

interface AgreementSection {
  id?: string;
  sectionTitle: string;
  sectionBody: string;
  requiredSignatures: ('signature' | 'initials' | 'fullName' | 'date')[];
}

interface AgreementData {
  id: string;
  name: string;
  sections: AgreementSection[];
  actualValues?: {
    customer?: Record<string, any>;
    vehicle?: Record<string, any>;
    reservation?: Record<string, any>;
  };
}

interface SignedData {
  agreementId: string;
  signedAt: string;
  sections: {
    sectionId: string;
    signatureData: {
      signature?: string;
      initials?: string;
      fullName?: string;
      date?: string;
    };
  }[];
  metadata: {
    ipAddress?: string;
    userAgent: string;
    signatureMethod: 'digital';
    completedAt: string;
  };
}

@Component({
  selector: 'app-rental-agreement',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    AngularSignaturePadModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './rental-agreement.component.html',
  styleUrls: ['./rental-agreement.component.scss'],
  // OnPush change detection for performance
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RentalAgreementComponent extends BaseComponent implements OnInit {
  // Input signal with required agreement data
  @Input() agreementData: AgreementData | null = null;
  // Explicit preview mode override from parent; null means auto-detect
  @Input() previewMode: boolean | null = null;

  // Output event emitter for signed data
  @Output() agreementSigned = new EventEmitter<SignedData>();

  // Form state
  sectionsForm: FormGroup;
  isBrowser = signal(false);
  private submissionState = false;
  signatureImg: string = '';
  signaturePad: any;

  // Derived state helpers
  isPreviewMode(): boolean {
    const override = this.previewMode;
    if (override !== null && override !== undefined) {
      return override;
    }
    const data = this.agreementData;
    if (!data) return true; // treat as preview until data arrives
    return !!data.actualValues && Object.keys(data.actualValues).length > 0;
  }

  isFormValid(): boolean {
    return this.sectionsForm?.valid ?? false;
  }

  processedSections(): any[] {
    const data = this.agreementData;
    const isPreview = this.isPreviewMode();

    if (!data) return [];
    return data.sections.map((section, index) => ({
      ...section,
      id: section.id || `section-${index}`,
      processedBody: this.processHtmlContent(
        section.sectionBody,
        isPreview,
        data.actualValues
      ),
    }));
  }

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private fb: FormBuilder,
    private sanitizer: DomSanitizer
  ) {
    super();

    // Initialize form
    this.sectionsForm = this.fb.group({
      sections: this.fb.array([]),
    });

    // Check if running in browser
    this.isBrowser.set(isPlatformBrowser(this.platformId));

    // Inputs are set before ngOnInit; build form in ngOnInit
  }

  override ngOnInit(): void {
    // Always build form to prevent value accessor errors
    const data = this.agreementData;
    if (data) {
      this.buildForm(data);
    }
  }

  /**
   * Build reactive form based on section requirements
   */
  private buildForm(data: AgreementData): void {
    const sectionsArray = this.sectionsForm.get('sections') as FormArray;
    sectionsArray.clear();

    data.sections.forEach((section, index) => {
      const sectionGroup: Record<string, any> = {
        sectionId: [section.id || `section-${index}`],
      };

      // Add form controls based on required signatures
      if (section.requiredSignatures.includes('signature')) {
        sectionGroup['signature'] = ['', Validators.required];
      }

      if (section.requiredSignatures.includes('initials')) {
        sectionGroup['initials'] = [
          '',
          [Validators.required, Validators.minLength(2)],
        ];
      }

      if (section.requiredSignatures.includes('fullName')) {
        sectionGroup['fullName'] = ['', Validators.required];
      }

      if (section.requiredSignatures.includes('date')) {
        sectionGroup['date'] = ['', Validators.required];
      }

      sectionsArray.push(this.fb.group(sectionGroup));
    });
  }

  /**
   * Process HTML content: replace placeholders or show tags
   */
  private processHtmlContent(
    html: string,
    isPreview: boolean,
    actualValues?: Record<string, any>
  ): SafeHtml {
    let processedHtml = html;

    if (isPreview && actualValues) {
      // Replace placeholders with actual values
      processedHtml = this.replacePlaceholders(html, actualValues);
    } else {
      // Replace placeholders with readable tags for signing mode
      processedHtml = this.replaceWithTags(html);
    }

    return this.sanitizer.bypassSecurityTrustHtml(processedHtml);
  }

  /**
   * Replace {{placeholder}} with actual values
   */
  private replacePlaceholders(
    html: string,
    values: Record<string, any>
  ): string {
    return html.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
      const keys = path.trim().split('.');
      let value: any = values;

      for (const key of keys) {
        value = value?.[key];
        if (value === undefined || value === null) {
          return match; // Keep original if value not found
        }
      }

      // Format dates if they're Firestore timestamps
      if (
        value &&
        typeof value === 'object' &&
        ('_seconds' in value || 'seconds' in value)
      ) {
        const seconds = value._seconds || value.seconds;
        const date = new Date(seconds * 1000);
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      }

      return String(value);
    });
  }

  /**
   * Replace {{placeholder}} with readable tags
   */
  private replaceWithTags(html: string): string {
    return html.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
      const readable = path
        .trim()
        .split('.')
        .map((part: string) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
      return `<span class="placeholder-tag">[${readable}]</span>`;
    });
  }

  /**
   * Get sections FormArray
   */
  get sectionsArray(): FormArray {
    return this.sectionsForm.get('sections') as FormArray;
  }

  /**
   * Get FormGroup for specific section
   */
  getSectionFormGroup(index: number): FormGroup {
    return this.sectionsArray.at(index) as FormGroup;
  }

  /**
   * Check if a specific signature type is required for a section
   */
  isSectionFieldRequired(
    sectionIndex: number,
    fieldType: 'signature' | 'initials' | 'fullName' | 'date'
  ): boolean {
    const data = this.agreementData;
    if (!data) return false;
    const section = data.sections[sectionIndex];
    return section.requiredSignatures.includes(fieldType);
  }

  /**
   * Get control ID for accessibility and validation
   */
  getControlId(sectionIndex: number, controlName: string): string {
    const agreementId = this.agreementData?.id || 'default';
    // Prefix with 'ag-' to ensure valid CSS selector (cannot start with digit)
    return `ag-${this.escapeCssSelector(agreementId)}-${controlName}-${sectionIndex}`;
  }

  /**
   * Escapes special characters in CSS selectors to prevent syntax errors
   */
  private escapeCssSelector(id: string): string {
    return id.replace(/[!"#$%&'()*+,./:;<=>?@[\\\]^`{|}~]/g, '\\$&');
  }

  /**
   * Scroll to first invalid control
   */
  scrollToFirstInvalidControl(): void {
    if (!this.isBrowser()) return;

    const sectionsArray = this.sectionsArray;

    for (let i = 0; i < sectionsArray.length; i++) {
      const sectionGroup = sectionsArray.at(i) as FormGroup;

      for (const controlName of Object.keys(sectionGroup.controls)) {
        const control = sectionGroup.get(controlName);

        if (control && control.invalid) {
          const elementId = this.getControlId(i, controlName);
          const element = isPlatformBrowser(this.platformId) ? document.getElementById(elementId) : null;

          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.focus();
            return;
          }
        }
      }
    }
  }

  /**
   * Handle signature pad changes manually (since it doesn't implement ControlValueAccessor)
   */
  onSignatureChange(signaturePad: any, sectionIndex: number): void {
    const signatureData = signaturePad.toDataURL();
    const sectionFormGroup = this.getSectionFormGroup(sectionIndex);
    const signatureControl = sectionFormGroup.get('signature');
    if (signatureControl) {
      signatureControl.setValue(signatureData);
      signatureControl.markAsTouched();
    }
  }

  /**
   * Save signature pad data
   */
  savePad(): void {
    const base64Data = this.signaturePad.toDataURL();
    this.signatureImg = base64Data;
  }

  /**
   * Clears the signature pad
   */
  clearSignature(sectionIndex: number): void {
    if (!isPlatformBrowser(this.platformId)) return;
    
    const signaturePadContainer = document.querySelector(
      `#${this.getControlId(sectionIndex, 'signature')}`
    );
    // Find the signature pad element
    const signaturePadElement = document.querySelector(
      `#${this.getControlId(sectionIndex, 'signature')} canvas`
    ) as HTMLCanvasElement;

    if (signaturePadElement) {
      // Clear the canvas
      const ctx = signaturePadElement.getContext('2d');
      if (ctx) {
        ctx.clearRect(
          0,
          0,
          signaturePadElement.width,
          signaturePadElement.height
        );
        // Set white background
        ctx.fillStyle = 'white';
        ctx.fillRect(
          0,
          0,
          signaturePadElement.width,
          signaturePadElement.height
        );
      }
    }

    // Clear the form control value
    const control = this.getSectionFormGroup(sectionIndex).get('signature');
    if (control) {
      control.setValue('');
      control.markAsTouched();
    }
    this.signatureImg = '';

    // Add cleared styling

    if (signaturePadContainer) {
      signaturePadContainer.classList.add('signature-cleared');
      signaturePadContainer.classList.remove('signature-saved');
    }
  }

  /**
   * Saves the current signature for a section
   */
  saveSignature(sectionIndex: number): void {
    if (!isPlatformBrowser(this.platformId)) return;
    
    const canvas = document.querySelector(
      `#${this.getControlId(sectionIndex, 'signature')} canvas`
    ) as HTMLCanvasElement;
    if (canvas) {
      const signatureData = canvas.toDataURL();
      this.signatureImg = signatureData;

      // Update the form control
      const control = this.getSectionFormGroup(sectionIndex).get('signature');
      if (control) {
        control.setValue(signatureData);
        control.markAsTouched();
      }

      // Add saved styling
      const signaturePadContainer = isPlatformBrowser(this.platformId) ? document.querySelector(
        `#${this.getControlId(sectionIndex, 'signature')}`
      ) : null;
      if (signaturePadContainer) {
        signaturePadContainer.classList.add('signature-saved');
        signaturePadContainer.classList.remove('signature-cleared');
      }
    }
  }

  /**
   * Checks if signature exists for a section
   */
  hasSignature(sectionIndex: number): boolean {
    const control = this.getSectionFormGroup(sectionIndex).get('signature');
    return control ? !!control.value : false;
  }

  /**
   * Checks if signature is empty (just background)
   */
  isSignatureEmpty(sectionIndex: number): boolean {
    if(!isPlatformBrowser(this.platformId)) return true;
    const sigContainer = document?.querySelector(
      `#${this.getControlId(sectionIndex, 'signature')}`
    ) as any;
    const canvas = document.querySelector(
      `#${this.getControlId(sectionIndex, 'signature')} canvas`
    ) as HTMLCanvasElement;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Check if canvas is empty (all pixels are white or transparent)
        for (let i = 0; i < data.length; i += 4) {
          // Check alpha channel (transparency) and RGB values
          if (
            data[i + 3] > 0 &&
            (data[i] !== 255 || data[i + 1] !== 255 || data[i + 2] !== 255)
          ) {
            return false; // Found non-white, non-transparent pixel
          }
        }
      }
    }
    return true;
  }

  /**
   * Check if form is currently being submitted
   */
  isSubmitting(): boolean {
    return this.submissionState;
  }

  /**
   * Handle form submission
   */
  onSubmit(): void {
    // Mark all as touched to show validation errors
    this.sectionsForm.markAllAsTouched();

    // Validate signatures before submission
    const data = this.agreementData;
    if (!data) {
      console.error('Agreement data is missing.');
      return;
    }

    // Check for empty signatures and set validation errors
    for (let i = 0; i < data.sections.length; i++) {
      const section = data.sections[i];
      if (section.requiredSignatures.includes('signature')) {
        if (this.isSignatureEmpty(i)) {
          const sectionGroup = this.getSectionFormGroup(i);
          const signatureControl = sectionGroup.get('signature');
          if (signatureControl) {
            signatureControl.setErrors({ required: true });
            signatureControl.markAsTouched();
          }
        } else {
          // Save signature to form control if it exists
          this.saveSignature(i);
        }
      }
    }

    if (!this.sectionsForm.valid) {
      this.scrollToFirstInvalidControl();
      return;
    }

    // Set submission state
    this.submissionState = true;

    // Prepare signed data
    const formValue = this.sectionsForm.value;

    const signedData: SignedData = {
      agreementId: data.id,
      signedAt: new Date().toISOString(),
      sections: formValue.sections.map((sectionData: any) => ({
        sectionId: sectionData.sectionId,
        signatureData: {
          signature: sectionData.signature || undefined,
          initials: sectionData.initials || undefined,
          fullName: sectionData.fullName || undefined,
          date: sectionData.date || undefined,
        },
      })),
      metadata: {
        userAgent: this.isBrowser() ? navigator.userAgent : '',
        signatureMethod: 'digital',
        completedAt: new Date().toISOString(),
      },
    };

    // Emit the signed data
    this.agreementSigned.emit(signedData);

    // Reset submission state after a brief delay
    setTimeout(() => {
      this.submissionState = false;
    }, 1000);
  }

  /**
   * Set today's date in date control
   */
  setTodayDate(sectionIndex: number): void {
    const sectionGroup = this.getSectionFormGroup(sectionIndex);
    const dateControl = sectionGroup.get('date');

    if (dateControl) {
      const today = new Date().toISOString().split('T')[0];
      dateControl.setValue(today);
    }
  }
}
