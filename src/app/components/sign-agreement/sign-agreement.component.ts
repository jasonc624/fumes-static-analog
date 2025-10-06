import { BreakpointObserver } from "@angular/cdk/layout";
import {
  ChangeDetectorRef,
  Component,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
  inject,
  PLATFORM_ID,
} from "@angular/core";
// import { Timestamp } from "@angular/fire/firestore";
// import { Functions, httpsCallableData } from "@angular/fire/functions";
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatStepper, StepperOrientation, MatStepperModule } from "@angular/material/stepper";
import { ActivatedRoute } from "@angular/router";
import { isPlatformBrowser } from "@angular/common";


import {
  BehaviorSubject,
  Observable,
  finalize,
  map,
  takeUntil,
  timer,
} from "rxjs";
import { CommonModule } from "@angular/common";
// import { DirectivesModule } from "@fumes/directives";
// import { GeneratedAgreementComponent } from "@fumes/generated-agreement";
import { Images } from "@fumes/constants";
import { BaseComponent, Booking } from "@fumes/types";

// Temporary Timestamp interface
interface Timestamp {
  seconds: number;
  nanoseconds: number;
}

interface Agreement {
  fleetRef: string;
  wet_sign: boolean;
  appliedTo: any[];
  created: Timestamp;
  name: string;
  id: string;
  text: Section[];
  type: string;
  updated: Timestamp;
}
interface Section {
  date: boolean;
  sectionTitle: string;
  digitalSignature: boolean;
  initials: boolean;
  fullName: boolean;
  sectionBody: string;
}
@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatProgressSpinnerModule,
    MatStepperModule,
    MatButtonModule,
    // DirectivesModule,
    // GeneratedAgreementComponent,
  ],
  selector: "app-sign-agreement",
  templateUrl: "./sign-agreement.component.html",
  styleUrl: "./sign-agreement.component.scss",
})
export class SignAgreementComponent extends BaseComponent implements OnInit {
  _Images = Images;
  authenticated = false;
  agreementId: string = '';
  bookingId: string = '';
  password = "";
  agreementDocument: any;
  isLoading = false;
  booking: Booking = {} as Booking;
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  // @ViewChildren(GeneratedAgreementComponent)
  // agreementComponents: QueryList<GeneratedAgreementComponent>;
  @ViewChild("stepper") stepper!: MatStepper;

  // form
  agreementsForm: FormGroup = new FormGroup({});
  documentsForm: FormGroup = new FormGroup({});

  stepperOrientation: Observable<StepperOrientation>;
  // These are used to render the html in the generated agreement
  vehicle$ = new BehaviorSubject(null);
  customer$ = new BehaviorSubject(null);
  reservation$ = new BehaviorSubject(null);
  constructor(
    private route: ActivatedRoute,
    // private fns: Functions,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder,
    breakpointObserver: BreakpointObserver
  ) {
    super();
    this.agreementId = decodeURIComponent(
      this.route.snapshot.params?.['agreementId'] || ''
    );
    this.bookingId = decodeURIComponent(
      this.route.snapshot.queryParams?.['booking'] || ''
    );
    this.stepperOrientation = breakpointObserver
      .observe("(min-width: 1100px)")
      .pipe(map(({ matches }) => (matches ? "horizontal" : "vertical")));
  }

  override ngOnInit(): void {
    this.documentsForm = this.fb.group({
      documents: this.fb.array([]),
    });
    this.agreementsForm = this.fb.group({
      agreements: this.fb.array([]),
    });
  }

  authenticate() {
    this.isLoading = true;
    // Temporarily disabled Firebase function call
    // return httpsCallableData(this.fns, "authenticate_agreement")({
    //   bookingId: this.bookingId,
    //   password: this.password,
    //   requestedAgreementId: this.agreementId,
    // })
    //   .pipe(
    //     takeUntil(this.destroyed),
    //     finalize(() => {
    //       timer(314).subscribe(() => {
    //         this.isLoading = false;
    //         this.cdr.detectChanges();
    //       });
    //     })
    //   )
    //   .subscribe({
    //     next: (envelope: any) => {

    //       if (envelope?.id) {
    //         this.authenticated = true;
    //         const booking = envelope?.booking;
    //         this.vehicle$.next(booking?.vehicle);
    //         this.reservation$.next(booking?.reservation);
    //         this.customer$.next(booking?.customer);
    //         this.agreementDocument = envelope;
    //         console.log("agreementDocument", this.agreementDocument);
    //         envelope.agreements_to_sign.forEach((agreement: any) => {
    //           this.agreementsArray.push(this.addAgreement(agreement));
    //         });
    //       }
    //     },
    //     error: (err: any) => {
    //       console.error("Failed", err);
    //       this.authenticated = false;
    //     },
    //   });
    
    // Mock authentication for now
    timer(314).subscribe(() => {
      this.isLoading = false;
      this.authenticated = true;
      this.cdr.detectChanges();
    });
  }

  get agreementsArray(): FormArray {
    return this.agreementsForm.get("agreements") as FormArray;
  }

  addAgreement(agreement: Agreement): FormGroup {
    const agreementFormGroup: FormGroup = this.fb.group({
      id: [agreement.id],
      name: [agreement.name],
      text: this.fb.array([]),
      acknowledge: new FormControl(false, [Validators.requiredTrue]),
    });

    const sectionsArray = agreementFormGroup.get("text") as FormArray;
    agreement.text.forEach((section) => {
      sectionsArray.push(this.createSection(section));
    });
    return agreementFormGroup;
  }

  returnFormGroup(group: any): FormGroup {
    return group as FormGroup;
  }
  createSection(section: Section): FormGroup {
    const sectionGroup = this.fb.group({});

    if (section?.initials) {
      sectionGroup.addControl(
        "initials",
        this.fb.control("", [Validators.required, Validators.minLength(2)])
      );
    }
    if (section?.date) {
      sectionGroup.addControl("date", this.fb.control("", Validators.required));
    }
    if (section?.fullName) {
      sectionGroup.addControl(
        "fullName",
        this.fb.control("", Validators.required)
      );
    }
    if (section?.digitalSignature) {
      sectionGroup.addControl(
        "digitalSignature",
        this.fb.control(null, Validators.required)
      );
    }
    return sectionGroup;
  }

  createAgreementFormGroup(doc: any): FormGroup {
    return this.fb.group({
      bookingRef: [doc.bookingRef],
      created: [doc.created],
      customerViewed: [doc.customerViewed],
      dateViewed: [doc.dateViewed],
      id: [doc.id],
      isSigned: [doc.isSigned],
      ttl: [doc.ttl],
    });
  }

  get documents(): FormArray {
    return this.documentsForm.get("documents") as FormArray;
  }
  textArray(index: number): FormArray {
    return this.agreementsArray.at(index).get("text") as FormArray;
  }

  scrollToFirstInvalidControl(): void {
    const controlNames = ["digitalSignature", "initials", "date", "fullName"];
    let allValid = true; // Flag to track if all required controls are valid in the current step

    // Loop over all the agreements
    for (let i = 0; i < this.agreementsArray.length; i++) {
      // Set the stepper to the current agreement step
      this.stepper.selectedIndex = i;

      // Get the text group for this one
      const textGroups = this.textArray(i);
      // Loop over all the text groups to see what signatures they require
      for (let j = 0; j < textGroups.length; j++) {
        // Loop over all available controls
        for (let controlName of controlNames) {
          // Does this text group need this control name?
          const control = textGroups.at(j).get(controlName);
          if (control && !control.valid) {
            allValid = false; // Set allValid to false if any control is invalid
            // Check if it does and if its not valid so we can scroll to it
            const elementId = `${controlName}-${i}-${j}`;

            if (this.isBrowser) {
              const element = document.getElementById(elementId);
              if (element) {
                element.scrollIntoView({ behavior: "smooth", block: "center" });
                return; // Stop after the first invalid control
              }
            }
          }
        }
      }

      // If all controls in this step are valid, move to the next step
      if (allValid) {
        if (i < this.agreementsArray.length - 1) {
          this.stepper.next();
        }
      } else {
        break; // Break the loop if we find an invalid control
      }
    }

    // Optionally, handle the case where all steps are complete
    if (
      allValid &&
      this.stepper.selectedIndex === this.agreementsArray.length - 1
    ) {
      console.log("All agreements are signed and valid.");
      // You might want to navigate to a confirmation page or show a completion message
    }
  }

  getCurrentStep() {
    if (this.stepper) {
      console.log("Current step index:", this.stepper.selectedIndex);
      return this.stepper.selectedIndex; // Returns the current step index (0-based)
    }
    return 0;
  }
  escapeHtml(str: string) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
  // Submit
  generateCombinedHtml(agreement: any, idx: number) {
    let combinedHtml = "<html>";
    combinedHtml +=
      "<style> * {font-family:sans-serif;} body {max-width: 8.5in;}</style>";
    combinedHtml += "<body style='padding:24px 12px;'>";
    if (agreement?.text) {
      agreement.text.forEach((section: any, textIdx: number) => {
        const agreement_signatures: any[] =
          this.agreementsForm.getRawValue().agreements;
        const single_agreement = agreement_signatures[idx];
        const currentSection = single_agreement?.text?.[textIdx];

        combinedHtml += `<h2>${this.escapeHtml(section.sectionTitle)}</h2>`;
        combinedHtml += `<p>${section.sectionBody}</p>`;
        // Check what type of signature and append appropriately
        if (currentSection?.digitalSignature) {
          combinedHtml += `<img src="${currentSection?.digitalSignature.signature}" alt="Digital Signature" />`;
        } else if (currentSection?.initials) {
          combinedHtml += `<div>Initials: ${currentSection.initials}<br>Full Name: ${currentSection.fullName}</div>`;
        } else if (currentSection?.date) {
          combinedHtml += `<div>Date: ${currentSection.date}</div>`;
        }
      });
    }
    combinedHtml += "</body></html>";
    return combinedHtml;
  }

  submitEnvelope() {
    this.isLoading = true;
    // const rendered_agreements: any[] = [];
    // this.agreementComponents.forEach((cmp, idx) => {
    //   const agreement = cmp.tamperProof;
    //   rendered_agreements.push(this.generateCombinedHtml(agreement, idx));
    // });

    // this.agreementDocument.signed_agreements = rendered_agreements;

    // return httpsCallableData(this.fns, "handle_envelope_submission")(this.agreementDocument)
    //   .pipe(
    //     takeUntil(this.destroyed),
    //     finalize(() => {
    //       timer(314).subscribe(() => {
    //         this.isLoading = false;
    //         this.cdr.detectChanges();
    //       });
    //     })
    //   )
    //   .subscribe({
    //     next: () => {
    //       this.agreementDocument.isSigned = true;
    //     },
    //     error: (err: any) => {
    //       this.agreementDocument.isSigned = false;
    //       console.log("failed to submit", err);
    //     },
    //   });
    
    // Mock submission for now
    timer(314).subscribe(() => {
      this.isLoading = false;
      if (this.agreementDocument) {
        this.agreementDocument.isSigned = true;
      }
      this.cdr.detectChanges();
    });
  }
}
