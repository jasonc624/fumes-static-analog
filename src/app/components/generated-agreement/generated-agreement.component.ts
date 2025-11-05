import {
  CommonModule,
  CurrencyPipe,
  DOCUMENT,
  DatePipe,
} from "@angular/common";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  Input,
  OnChanges,
  OnInit,
  QueryList,
  Renderer2,
  SimpleChanges,
  ViewChild,
  ViewChildren
} from "@angular/core";
import {
  FormArray,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { DomSanitizer } from "@angular/platform-browser";
import { RouterModule } from "@angular/router";
import { QuillModule } from "ngx-quill";
import { get } from "lodash";
import { DigitalSignatureModule } from "@fumes/digital-signature";
import { DigitalSignatureWrapperComponent } from "../digital-signature-wrapper/digital-signature-wrapper.component";
import { DirectivesModule } from "@fumes/directives";
import { BaseComponent } from "@fumes/types";
import { dynamic_values } from "@fumes/constants";
import { Timestamp } from "firebase/firestore";
import { Envelope, Agreement, AgreementSection } from "../../models/envelope.model";

@Component({
    selector: "app-generated-agreement",
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        ReactiveFormsModule,
        MatButtonModule,
        DirectivesModule,
        QuillModule,
        DigitalSignatureModule,
        DigitalSignatureWrapperComponent,
    ],
    templateUrl: "./generated-agreement.component.html",
    styles: [
        `
      .signatures {
        display: flex;
        justify-content: flex-start;
        flex-wrap: wrap;
        flex-direction: row;
        gap: 15px;
        > div {
          flex-basis: 340px;
        }
      }
      .signable {
        scroll-margin-top: 100px;
      }
      .envelope-container {
        margin-bottom: 20px;
      }
      .envelope-header {
        margin-bottom: 15px;
      }
      .envelope-header h2 {
        margin: 0 0 10px 0;
        color: #333;
        font-size: 1.5rem;
      }
      .agreement-tabs {
        display: flex;
        gap: 8px;
        margin-bottom: 20px;
        border-bottom: 2px solid #e0e0e0;
        padding-bottom: 8px;
      }
      .tab-button {
        padding: 8px 16px;
        border: 1px solid #ddd;
        background: #f5f5f5;
        color: #666;
        cursor: pointer;
        border-radius: 4px 4px 0 0;
        transition: all 0.2s ease;
        font-size: 0.9rem;
      }
      .tab-button:hover {
        background: #e9e9e9;
        color: #333;
      }
      .tab-button.active {
        background: #007bff;
        color: white;
        border-color: #007bff;
        font-weight: 500;
      }
    `,
    ],
    providers: [DatePipe, CurrencyPipe],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GeneratedAgreementComponent
  extends BaseComponent
  implements OnChanges, OnInit {
  constructor(
    @Inject(DOCUMENT) private document: Document,
    private sanitizer: DomSanitizer,
    private datePipe: DatePipe,
    private currencyPipe: CurrencyPipe,
    private cdr: ChangeDetectorRef,
    private renderer: Renderer2
  ) {
    super();
  }
  
  // New envelope-based inputs
  @Input() envelope: Envelope | null = null;
  @Input() agreement: Agreement | null = null;
  
  // Legacy inputs for backward compatibility
  @Input() isSigning = false;
  @Input() preview = false;
  @Input() isLoading = true;
  @Input() template: any;
  @Input() reservation: any;
  @Input() vehicle: any;
  @Input() customer: any;
  @Input() envelopeIdx = 0;
  
  @ViewChildren("sectionBody") sectionBodies!: QueryList<ElementRef>;
  @Input() parentForm: FormGroup | null = null;

  get textFormArray(): FormArray | null {
    return this.parentForm?.get('text') as FormArray || null;
  }

  @ViewChild("agreement", { static: true }) agreementRef!: ElementRef;

  // Form
  agreementForm!: FormGroup;
  sectionsForm!: FormArray;

  // Template management
  originalTemplate: any;
  _template: any;
  _rendered_template: any;
  _tamper_proof_copy: any;
  
  // Current agreement data
  currentAgreement: Agreement | null = null;
  currentSections: AgreementSection[] = [];
  
  override ngOnInit(): void {
    console.log('Envelope:', this.envelope);
    console.log('Agreement:', this.agreement);
    console.log('Parent Form:', this.parentForm);
    
    this.initializeAgreementData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Handle envelope changes
    if (changes?.['envelope']?.currentValue) {
      this.envelope = changes['envelope'].currentValue;
      this.initializeAgreementData();
    }
    
    // Handle agreement changes
    if (changes?.['agreement']?.currentValue) {
      this.agreement = changes['agreement'].currentValue;
      this.initializeAgreementData();
    }
    
    // Legacy template handling for backward compatibility
    const currentTpl = changes?.['template']?.currentValue;
    const isPreview = changes?.['preview']?.currentValue;
    const isSigning = changes?.['isSigning']?.currentValue;
    
    if (currentTpl) {
      this._template = structuredClone(currentTpl);
      this._rendered_template = structuredClone(currentTpl);
      this.freezeOriginalTemplate(currentTpl);
    }
    
    if (isPreview) {
      this.previewWith();
    }
    
    if (isSigning) {
      this.renderForSign();
    }
  }

  public initializeAgreementData(): void {
    // Determine current agreement from envelope or direct input
    if (this.agreement) {
      this.currentAgreement = this.agreement;
    } else if (this.envelope?.agreements?.length) {
      // Use the first agreement or the one at envelopeIdx
      this.currentAgreement = this.envelope.agreements[this.envelopeIdx] || this.envelope.agreements[0];
    } else if (this.template) {
      // Legacy mode - convert template to agreement format
      this.currentAgreement = this.convertTemplateToAgreement(this.template);
    }

    if (this.currentAgreement) {
      this.currentSections = this.currentAgreement.text || [];
      this._template = this.currentAgreement;
      this._rendered_template = structuredClone(this.currentAgreement);
      this.freezeOriginalTemplate(this.currentAgreement);
    }
  }

  private convertTemplateToAgreement(template: any): Agreement {
    // Convert legacy template format to new Agreement format
    return {
      id: template.id || 'legacy-' + Date.now(),
      name: template.name || 'Agreement',
      type: template.type || 'rental',
      fleetRef: template.fleetRef || '',
      wet_sign: template.wet_sign || false,
      appliedTo: template.appliedTo || [],
      created: template.created || { seconds: Date.now() / 1000, nanoseconds: 0 },
      updated: template.updated || { seconds: Date.now() / 1000, nanoseconds: 0 },
      text: template.text || []
    };
  }

  // Getter for current envelope data (for template compatibility)
  get currentEnvelopeData() {
    return {
      customer: this.envelope?.customer || this.customer,
      vehicle: this.envelope?.vehicle || this.vehicle,
      reservation: this.envelope?.reservation || this.reservation
    };
  }

  freezeOriginalTemplate(tpl: any) {
    if (!!tpl) {
      this.originalTemplate =
        structuredClone(tpl) ?? JSON.parse(JSON.stringify(tpl));
    }
  }

  resetTemplate() {
    // this._template = this.originalTemplate;
    this._rendered_template = structuredClone(this._template);
    // this.agreementForm.reset();
  }

  byPassHTML(html: string) {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  print() {
    const prtContent = this.agreementRef.nativeElement;
    const buttons = prtContent.querySelectorAll("button");
    buttons.forEach((el: Element) =>
      this.renderer.setStyle(el, "visibility", "hidden")
    );

    let printWindow: any = this.document.defaultView?.open(
      "",
      "_blank",
      "left=0,top=0,width=800,height=900,toolbar=0,scrollbars=0,status=0"
    );
    printWindow.document.open();
    printWindow.document.write(prtContent.innerHTML);
    printWindow.print();
    // printWindow.close();

    buttons.forEach((el: Element) =>
      this.renderer.setStyle(el, "visibility", "visible")
    );
  }
  replaceMentionSpansWithDivs(htmlString: string): string {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, "text/html");
    const mentionSpans = doc.querySelectorAll("span.mention");

    mentionSpans.forEach((span) => {
      const dataId = span.getAttribute("data-id");
      if (dataId) {
        const newTextContent = this.getValueForId(parseInt(dataId, 10));
        if (newTextContent) {
          // Check if newTextContent is truthy
          span.textContent = newTextContent; // Update text content
          span.classList.add("filled"); // Add class to indicate update
        }
      }
    });

    // Return the modified HTML as a string
    return doc.body.innerHTML;
  }

  public previewWith() {
    this.preview = false;
    this.resetTemplate();
    
    // Handle envelope mode
    if (this.currentAgreement?.text) {
      this._rendered_template = {
        ...this.currentAgreement,
        text: this.currentAgreement.text.map((section: AgreementSection, index: number) => {
          let parsedSection = { ...section };
          parsedSection.sectionBody = this.replaceMentionSpansWithDivs(
            section.sectionBody
          );
          return parsedSection;
        })
      };
    }
    // Handle legacy template mode
    else if (this._template?.text) {
      this._rendered_template.text = this._template.text.map(
        (section: any, index: number) => {
          let parsedSection = { ...section };
          parsedSection.sectionBody = this.replaceMentionSpansWithDivs(
            section.sectionBody
          );
          return parsedSection;
        }
      );
    }
    
    this.preview = true;
    this.cdr.detectChanges();
  }

  public renderForSign() {
    this.isSigning = false;
    this.resetTemplate();
    
    // Handle envelope mode
    if (this.currentAgreement?.text) {
      this._rendered_template = {
        ...this.currentAgreement,
        text: this.currentAgreement.text.map((section: AgreementSection) => {
          let parsedSection = { ...section };
          parsedSection.sectionBody = this.replaceMentionSpansWithDivs(
            section.sectionBody
          );
          return parsedSection;
        })
      };
    }
    // Handle legacy template mode
    else if (this._template?.text) {
      this._rendered_template.text = this._template.text.map((section: any) => {
        let parsedSection = { ...section };
        parsedSection.sectionBody = this.replaceMentionSpansWithDivs(
          section.sectionBody
        );
        return parsedSection;
      });
    }
    
    this._tamper_proof_copy = structuredClone(this._rendered_template);
    this.isSigning = true;
    this.cdr.detectChanges();
  }
  public get tamperProof() {
    return this._tamper_proof_copy;
  }

  getValueForId(id: number) {
    let value: any = dynamic_values.find((item) => item.id == id);
    const envelopeData = this.currentEnvelopeData;
    
    switch (value.type) {
      case "vehicle":
        const vehicleVal = get(envelopeData.vehicle, value.path);
        const isPricing = value.path.indexOf("pricing") > -1;
        if (isPricing) {
          return this.convertToCurrency(vehicleVal);
        }
        return vehicleVal;
      case "reservation":
        let reservationVal = get(envelopeData.reservation, value.path);
        if (value?.isDate || value?.isTime) {
          return this.convertTimestampToDate(reservationVal, value?.isTime);
        }
        return reservationVal;
      case "customer":
        if (value?.isEncrypted) {
          // Handle encrypted data if needed
        }
        return get(envelopeData.customer, value.path);
      default:
        break;
    }
  }

  private convertToCurrency(amount: number) {
    return this.currencyPipe.transform(amount, "$");
  }

  private convertTimestampToDate(value: any, isTime?: boolean): string | null {
    // Check if value is a Firestore Timestamp
    if (value instanceof Timestamp) {
      return this.formatDate(value.toDate(), isTime);
    }
    // Check if value might be an object resembling a Timestamp
    else if (value && value._seconds !== undefined) {
      const dateFromObject = new Date(value._seconds * 1000); // Convert seconds to milliseconds
      return this.formatDate(dateFromObject, isTime);
    }
    return null;
  }

  private formatDate(date: Date, isTime?: boolean): string | null {
    if (isTime) {
      return this.datePipe.transform(date, "h:mm a");
    } else {
      return this.datePipe.transform(date, "M/d/yyyy");
    }
  }

  createNestedObject(obj: {
    id: number;
    type: string;
    path: string;
    value: any;
  }): any {
    const result: any = {};
    const pathParts = obj.path.split(".");

    let currentObj = result;
    for (const part of pathParts) {
      currentObj = currentObj[part] = {};
    }

    currentObj = obj.value;

    return { [obj.type]: result };
  }
}
