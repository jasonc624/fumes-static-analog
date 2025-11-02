import { CommonModule, DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  Component,
  ElementRef,
  Inject,
  Input,
  OnInit,
  ViewChild,
  PLATFORM_ID,
  inject,
} from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
// Material
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';

import { Observable, of, switchMap, takeUntil, tap } from "rxjs";

// Fumes libs
import { BaseComponent, Booking, Fleet } from "@fumes/types";
import { ConversationComponent } from '@fumes/conversation';
import { memoizer } from '@fumes/memoize';
import { FumesMapComponent } from '@fumes/fumes-map';
import { PricingBreakdownComponent } from '@fumes/booking-breakdown';
// Local imports
import { environment } from '../../config/environment';
import { BookingService } from '../../services/booking.service';
import { StripePaymentService } from '../../services/stripe-payment.service';
import { WINDOW } from '../../tokens/window.token';

@Component({
  standalone: true,
  imports: [
    CommonModule,
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
  ],
  selector: 'app-manage-booking',
  templateUrl: './manage-booking.component.html',
  styleUrl: './manage-booking.component.scss',
})
export class ManageBookingComponent extends BaseComponent implements OnInit {
  @Input() bookingId!: string;
  readonly window = inject(WINDOW);

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(DOCUMENT) private document: Document,
    private activeRoute: ActivatedRoute,
    private bookingService: BookingService,
    private stripePaymentService: StripePaymentService
  ) {
    super();
    this.isBrowser = isPlatformBrowser(this.platformId);
  }
  isBrowser: boolean = false;
  // Tabs
  selectedTabIndex = 0;
  env = environment;
  booking$!: Observable<Partial<Booking> | any>;
  booking_obj!: Booking;
  fleet!: Fleet; //shallow version of fleet that conversation component needs
  // Payment Dialog
  paymentDialogElement!: HTMLDialogElement;
  @ViewChild('paymentDialog', { read: ElementRef }) paymentDialog: any;
  // Message Cmp
  // Verification
  isLoadingVerification = false;
  @ViewChild(ConversationComponent, { static: false })
  conversation!: ConversationComponent;
  // Stripe Element
  card: any;
  cardErrors: any;
  stripe: any;
  elements: any;
  // scroll

  override ngOnInit(): void {
    console.log('manage booking');
    this.booking$ = this.activeRoute.queryParamMap.pipe(
      takeUntil(this.destroyed),
      switchMap((queryParams: any) => {
        const pw = queryParams.get('pw');
        if (!this.bookingId || !pw) {
          return of(null);
        }
        return this.bookingService.authenticateToManageBooking(
          this.bookingId,
          pw
        );
      }),
      tap(async (response: any) => {
        if (!response) return;
        // Extract booking data from the API response
        const booking = response.data;
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
  @memoizer()
  get stripePublishableKey(): string {
    return environment.stripe.publishableKey;
  }

  @memoizer()
  get isProduction(): boolean {
    return environment.production;
  }

  @memoizer()
  get apiUrl(): string {
    return environment.apiUrl;
  }
  createVerificationSession(booking: Booking) {
    this.isLoadingVerification = true;
    return this.bookingService
      .createVerificationSession(booking)
      .pipe(takeUntil(this.destroyed))
      .subscribe({
        next: (response: any) => {
          this.isLoadingVerification = false;
          console.log('verification session created', response);
          const session = response.data;
          if (this.stripe) {
            this.stripe.verifyIdentity(session.client_secret);
          }
        },
        error: (err: any) => {
          this.isLoadingVerification = false;
          console.error('Failed to create verification session', err);
        },
      });
  }

  async createPaymentSession(booking: Booking): Promise<any> {
    return this.bookingService.createVerificationSession(booking);
  }

  @memoizer()
  formatDate(date: any) {
    return date;
  }
  async loadStripeConditionally() {
    if (this.window) {
      // @ts-ignore
      const { loadStripe } = await import('@stripe/stripe-js');
      this.stripe = await loadStripe(environment.stripe.publishableKey);
    } else {
      console.error('window is not defined');
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
      payment_method_types: 'card',
      layout: {
        type: 'tabs',
        defaultCollapsed: false,
      },
    };
    this.card = this.elements.create('payment', options);
    this.card.mount('#payment-element');
    this.card.addEventListener(
      'change',
      (data: any) => {
        this.cardErrors = data.error && data.error.message;
      },
      (err: any) => {
        console.error('Failed to Mount Card', err);
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
        console.error('submitHandler', error);
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
