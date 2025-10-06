import { Component, OnInit, inject, PLATFORM_ID } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule, Validators, FormBuilder, AbstractControl, ValidationErrors } from "@angular/forms";
import { map, takeUntil } from "rxjs/operators";
import { ActivatedRoute, RouterModule } from "@angular/router";
import { BreakpointObserver } from "@angular/cdk/layout";
import { MatStepperModule, StepperOrientation } from "@angular/material/stepper";
import { MatButtonModule } from "@angular/material/button";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSelectModule } from "@angular/material/select";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatCardModule } from "@angular/material/card";
import { MatDividerModule } from "@angular/material/divider";
import { MatNativeDateModule } from "@angular/material/core";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { CommonModule, NgOptimizedImage, isPlatformBrowser } from "@angular/common";
import { Title } from "@angular/platform-browser";
import { BaseComponent } from "@fumes/types";
import { Images } from "@fumes/constants";
import { atLeast18, phoneNumberValidator } from "@fumes/validators";
import { DirectivesModule } from "@fumes/directives";
import { CountryStateTzComponent, CustomerFormComponent, EmailPasswordComponent } from "@fumes/forms";
import { PhoneMaskModule } from "@fumes/phone-mask";
import { BehaviorSubject, Observable, timer } from "rxjs";
@Component({
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatInputModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCheckboxModule,
    MatCardModule,
    MatDividerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    RouterModule,
    NgOptimizedImage,
    PhoneMaskModule,
    DirectivesModule,
    CustomerFormComponent,
    EmailPasswordComponent,
    CountryStateTzComponent
  ],
  selector: "app-register",
  templateUrl: "./register.component.html",
  styleUrl: "./register.component.scss",
})
export class RegisterComponent extends BaseComponent implements OnInit {
  // Temporary validator functions - defined first
  phoneNumberValidator = (control: AbstractControl): ValidationErrors | null => {
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
    return phoneRegex.test(control.value) ? null : { invalidPhone: true };
  };

  atLeast18 = (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    const birthDate = new Date(control.value);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    return age >= 18 ? null : { underAge: true };
  };

  // Component properties
  isLoading = false;
  isLoadingLocation = false;
  isLoadingDocuments = false;
  isLoadingBasics = false;
  isLoadingAddress = false;

  override ngOnInit(): void {
    this.route.queryParams
      .pipe(takeUntil(this.destroyed))
      .subscribe((query) => {
        this.inviteId = query?.["redirect_invite"] || "";
        this.bookingId = query?.["bookingId"] || "";
        this.fleetId = query?.["fleetId"] || "";
      });

    this.stepperOrientation = this.breakpointObserver
      .observe("(min-width: 800px)")
      .pipe(map(({ matches }) => (matches ? "horizontal" : "vertical")));
  }

  //     dob: new FormControl(null, [Validators.required, atLeast18]),
  basics = new FormGroup({
    firstName: new FormControl("", [Validators.required]),
    lastName: new FormControl("", [Validators.required]),
    email: new FormControl("", [Validators.required, Validators.email]),
    password: new FormControl("", [Validators.required, Validators.minLength(8)]),
    phone: new FormControl("", [Validators.required]),
    dateOfBirth: new FormControl("", [Validators.required]),
  });

  address = new FormGroup({
    street: new FormControl("", [Validators.required]),
    city: new FormControl("", [Validators.required]),
    state: new FormControl("", [Validators.required]),
    zip: new FormControl("", [Validators.required]),
    country: new FormControl("", [Validators.required]),
  });

  documents = new FormGroup({
    driversLicense: new FormGroup({
      front: new FormControl("", [Validators.required]),
      back: new FormControl("", [Validators.required]),
    }),
    creditCard: new FormGroup({
      front: new FormControl("", [Validators.required]),
      back: new FormControl(""),
    }),
  });

  location = new FormGroup({
    country_state_timezone: new FormControl(null),
  });
  finish = new FormGroup({
    email_password: new FormControl(null, [Validators.required]),
    fleetName: new FormControl("", [Validators.required]),
    insurerName: new FormControl("", [Validators.required]),
    tos: new FormControl(false, [Validators.requiredTrue]),
  });
  public errMsg!: string;
  customer = this.basics;
  locations: any = this.location.controls.country_state_timezone;
  account = this.finish;
  isSubmitting = false;
  passwordType = "password";
  confirmPasswordType = "password";
  successfullyRegistered = false;
  stepperOrientation!: Observable<StepperOrientation>;
  inviteId!: string;
  bookingId = "";
  fleetId = "";
  registrationType: string = "owner"; // Host or Renter
  touchedForm = false;
  errorMessage = new BehaviorSubject("");
  readonly platformId: Object = inject(PLATFORM_ID);
  _isBrowser: boolean = isPlatformBrowser(this.platformId);
  backgroundStyle = { 'background': `url('${Images.register.heroImage}') no-repeat center center / cover` }
  // readonly window = inject(WINDOW);
  // Fumes libs
  _Images = Images;
  constructor(
    private title: Title,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private breakpointObserver: BreakpointObserver
  ) {
    super();
    this.title.setTitle(
      "Fumes Rental Software - Owner Sign Up - No Payment Required"
    );
  }

  formatData(obj: any) {
    obj = {
      ...obj,
      ...this.customer.getRawValue(),
      ...this.locations.value,
      accountType: this.registrationType,
    };

    return obj;
  }

  viewTerms(): void {
    // this.router.navigate([{ outlets: { modal: `show/view-tos` } }]);
  }

  submitRegister(): void {
    const emailPass: any = this.account.controls["email_password"].getRawValue();
    const fleetName = this.account.controls["fleetName"].getRawValue();
    const accountData = this.formatData({ email: emailPass.email, fleetName });
    this.isSubmitting = true;
    console.info("Browser:", isPlatformBrowser(this.platformId));
    this.register(emailPass.email, emailPass.password, accountData)
      .pipe(takeUntil(this.destroyed))
      .subscribe({
        next: (res) => {
          this.isSubmitting = false;
          if (res.errorInfo) {
            alert(res.codePrefix + " : " + res.errorInfo.message);
            return;
          }
          this.successfullyRegistered = true;
          const baseUrl = import.meta.env['VITE_OWNER'] || '';

          if (isPlatformBrowser(this.platformId)) {
            if (this.inviteId) {
              // this.router.navigate(["/auth/login"], {
              //   queryParams: { redirect_invite: this.inviteId },
              // });
              location.href = `${baseUrl}/auth/login?redirect_invite=${this.inviteId}`;
            } else {
              location.href = `${baseUrl}/auth/login`;
              // this.router.navigate(["/auth/login"]);
            }
          }
          this.errorMessage.next("");
        },
        error: (err) => {
          this.errorMessage.next(
            "Failed to register your account, reason: " +
            this.extractFirebaseError(String(err))
          );
          this.isSubmitting = false;
        },
      });
  }
  private extractFirebaseError(errorMessage: any) {
    // Regular expression to match 'FirebaseError' and any characters until the next colon, including the colon
    const firebaseErrorPattern = /FirebaseError:.*?:/;
    return errorMessage.replace(firebaseErrorPattern, ""); // Replace the FirebaseError message with an empty string
  }

  register(email: string, password: string, accountData?: any): Observable<any> {
    if (accountData) {
      accountData.password = password;
      accountData.type = "host";
    }

    // Use current origin for API base URL
    const apiUrl = `${window.location.origin}/api/v1/register`;

    // Call the API endpoint instead of Firebase function directly
    return new Observable(observer => {
      fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(accountData)
      })
      .then(response => {
        if (!response.ok) {
          return response.json().then(errorData => {
            throw new Error(errorData.statusMessage || 'Registration failed');
          });
        }
        return response.json();
      })
      .then(data => {
        observer.next(data);
        observer.complete();
      })
      .catch(error => {
        observer.error(error);
      });
    });
  }

  ctrl(name: string) {
    return this.finish.get(name);
  }
  customerCtrl(name: string): any {
    return this.customer.get(name);
  }
  getError(ctrlName: string): string {
    const errorObj = this.customerCtrl(ctrlName).errors;
    if (!errorObj) return "";
    const errors: any[] = [];
    Object.keys(errorObj).forEach((key) => errors.push(key));
    return errors.join(", ");
  }

  create_account_with_details() {
    this.isLoading = true;
    timer(1000).subscribe(() => {
      this.isLoading = false;
      this.successfullyRegistered = true;
    });
  }

  togglePasswordVisibility() {
    this.passwordType = this.passwordType === "password" ? "text" : "password";
  }

  toggleConfirmPasswordVisibility() {
    this.confirmPasswordType = this.confirmPasswordType === "password" ? "text" : "password";
  }
  goToLogin() {
    return `${import.meta.env['VITE_OWNER'] || ''}/#/auth/login`;
  }
  switchRegisterType(type: string) {
    this.registrationType = type;
  }

  changeUserType(type: string) {
    this.registrationType = type;
  }
}
