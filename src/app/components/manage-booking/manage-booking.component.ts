import { CommonModule, DOCUMENT, isPlatformBrowser } from "@angular/common";
import {
  Component,
  ElementRef,
  Inject,
  OnInit,
  ViewChild,
  PLATFORM_ID,
  inject,
} from "@angular/core";
import { Functions, httpsCallableData } from "@angular/fire/functions";
import { ActivatedRoute, RouterModule } from "@angular/router";
// Material
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatTabsModule } from "@angular/material/tabs";

import { Observable, of, switchMap, takeUntil, tap } from "rxjs";

import { environment } from "../../environments/environment";
import {
  CommonService,
  StripePaymentService,
} from "@fumes/services";
// Fumes libs
import { BaseComponent, Booking, Fleet } from "@fumes/types";
import { ConversationComponent } from "@fumes/conversation";
import { memoizer } from "@fumes/memoize";
import { FumesMapComponent } from "@fumes/fumes-map";
import { PricingBreakdownComponent } from "@fumes/booking-breakdown";
import { VehicleStatsComponent } from "@fumes/vehicle-list";


import { WINDOW } from "../../providers/window";
@Component({
  standalone: true,
  imports: [CommonModule,
    MatTabsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    RouterModule,
    ConversationComponent,
    PricingBreakdownComponent,
    FumesMapComponent,
    MatProgressSpinnerModule,
    VehicleStatsComponent],
  selector: "app-manage-booking",
  templateUrl: "./manage-booking.component.html",
  styleUrl: "./manage-booking.component.scss",
})
export class ManageBookingComponent extends BaseComponent implements OnInit {
  @Inject(PLATFORM_ID) private platformId: Object;
  @Inject(DOCUMENT) private document: Document;
  readonly window = inject(WINDOW);
  constructor(
    private activeRoute: ActivatedRoute,
    private fns: Functions,
    private common: CommonService,
    private stripePaymentService: StripePaymentService
  ) {
    super();
    this.isBrowser = isPlatformBrowser(this.platformId);
  }
  isBrowser: boolean;
  // Tabs
  selectedTabIndex = 0;
  env = environment;
  booking$: Observable<any>;
  booking_obj: Booking;
  fleet: Fleet; //shallow version of fleet that conversation component needs
  // Payment Dialog
  paymentDialogElement: HTMLDialogElement;
  @ViewChild("paymentDialog", { read: ElementRef }) paymentDialog: any;
  // Message Cmp
  // Verification
  isLoadingVerification = false;
  @ViewChild(ConversationComponent) conversation: ConversationComponent;
  // Stripe Element
  card: any;
  cardErrors: any;
  stripe: any;
  elements: any;
  // scroll

  override ngOnInit(): void {
    console.log('ngOnInit')
    this.booking$ = this.activeRoute.paramMap.pipe(
      takeUntil(this.destroyed),
      switchMap((map: any) => {
        const bookingId = map.params.bookingId;
        const pw = this.activeRoute.snapshot.queryParams['pw'];
        if (!bookingId || !pw) {
          return of(null);
        }
        return this.authenticate(bookingId, pw);
      }),
      tap(async (booking) => {
        if (!booking) return;
        this.fleet = booking.fleet;
        this.booking_obj = booking;
        await this.initModal();
      })
    );
  }

  goToTab(index: number): void {
    this.selectedTabIndex = index;
  }
  onTabChange() {
    this.conversation.setConvoContainerHeight();
    this.conversation.scrollToBottom();
  }
  authenticate(bookingId: string, pw: string) {
    return httpsCallableData(this.fns, "authenticate_to_manage_booking")({
      bookingId,
      password: pw,
    });
  }
  createVerificationSession(booking: Booking) {
    this.isLoadingVerification = true;
    return httpsCallableData(this.fns, "create_verification_session")({
      booking,
    }).pipe(takeUntil(this.destroyed)).subscribe({
      next: (session: any) => {
        this.isLoadingVerification = false;
        console.log('verification session created', session)
        if (this.stripe) {
          this.stripe.verifyIdentity(session.client_secret);
        }
      }, error: (err: any) => {
        this.isLoadingVerification = false;
        console.error('Failed to create verification session', err);
      }
    })
  }


  @memoizer()
  formatDate(date: any) {
    const formatted = this.common.convertFirestoreTimestampToDate(date);

    return formatted;
  }
  async loadStripeConditionally() {
    if (this.window) {
      // @ts-ignore
      const { loadStripe } = await import("@stripe/stripe-js");
      this.stripe = await loadStripe(environment.stripe);
    } else {
      console.error('window is not defined')
    }
  }

  intentHandler(customer: any) {
    return this.stripePaymentService
      .setupIntent(customer)
      .pipe(takeUntil(this.destroyed));
  }

  mountCard(intent: any) {
    this.elements = this.stripe.elements({
      clientSecret: intent.client_secret,
    });
    const options = {
      payment_method_types: "card",
      layout: {
        type: "tabs",
        defaultCollapsed: false,
      },
    };
    this.card = this.elements.create("payment", options);
    this.card.mount("#payment-element");
    this.card.addEventListener(
      "change",
      (data: any) => {
        this.cardErrors = data.error && data.error.message;
      },
      (err: any) => {
        console.error("Failed to Mount Card", err);
      }
    );
    return this.card;
  }

  async submitHandler() {
    if (isPlatformBrowser(this.platformId)) {
      try {
        await this.stripe
          .confirmSetup({
            elements: this.elements,
            confirmParams: {
              return_url: this.document.location.href,
            },
          })
          .then((response: any) => {
            let { error } = response;
            if (error) {
              // Handle error
            }
          })
          .catch((error: any) => {
            throw error;
          });
      } catch (error) {
        console.error("submitHandler", error);
      }
    }
  }
  // Dialog Logic
  async initModal() {
    console.log('initModal');
    if (isPlatformBrowser(this.platformId)) {
      this.paymentDialogElement = this.paymentDialog?.nativeElement;
      // Dynamically import dialog-polyfill to avoid SSR issues
      const dialogPolyfill = await import('dialog-polyfill');
      dialogPolyfill.default.registerDialog(this.paymentDialogElement);
      await this.loadStripeConditionally();
      this.intentHandler(this.booking_obj.customer)
        .pipe(takeUntil(this.destroyed))
        .subscribe((intent) => {
          this.mountCard(intent);
        });
    }
  }
  openDateChangeDialog(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.paymentDialogElement.show();
    }
  }
  closeDialog() {
    if (isPlatformBrowser(this.platformId)) {
      this.paymentDialogElement.close();
    }
  }
}
