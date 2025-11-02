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
  computed,
} from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { of, switchMap, takeUntil, map } from 'rxjs';

// Fumes libs
import { BaseComponent, Booking } from '@fumes/types';
import { ConversationComponent } from '@fumes/conversation';
import { memoizer } from '@fumes/memoize';
import { FumesMapComponent } from '@fumes/fumes-map';
import { PricingBreakdownComponent } from '@fumes/booking-breakdown';
// Local imports
import { environment } from '../../config/environment';
import { BookingService } from '../../services/booking.service';
import { StripePaymentService } from '../../services/stripe-payment.service';
import { WINDOW } from '../../tokens/window.token';
import { VehicleGuideDialogComponent } from './vehicle-guide-dialog.component';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ConversationComponent,
    PricingBreakdownComponent,
    FumesMapComponent,
    MatIconModule,
    MatDialogModule,
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
    private stripePaymentService: StripePaymentService,
    private dialog: MatDialog
  ) {
    super();
    this.isBrowser = isPlatformBrowser(this.platformId);
  }
  isBrowser: boolean = false;
  // Tabs
  selectedTabIndex = 0;
  activeTab = 'trip-details';
  tabs = [
    { id: 'trip-details', label: 'Trip Details' },
    { id: 'messages', label: 'Messages' },
    { id: 'payment', label: 'Payment' }
  ];
  env = environment;

  // Vehicle guide data
  vehicleGuide = {
    about: null,
    questions: "<p><strong>What is the meaning of life?</strong><br>to live it to the fullest</p>",
    greeting: "<p>Thank you for booking with me. I hope to make this as smooth as possible</p>",
    directions: "<p>Please be careful, this car is open to the elements so check the weather before departure. This is a quick release steering wheel and it's meant to take with you but I advise you to put it in the compartment behind the seat with lock to avoid theft. If we are unable to meet for key hand off, please leave the key in the lockbox and lock it on one of the seatbelts. Please don't be a child and ruin the tires by burning out. Ruins it for every other responsible driver. When exiting, hold on to the steering wheel and e brake and exit butt first. This helps not put unnecessary strain on the plastic.</p>"
  };

  // Signals for booking data
  private readonly bookingResponse = toSignal(
    this.activeRoute.queryParamMap.pipe(
      switchMap((queryParams: any) => {
        const pw = queryParams.get('pw');
        
        if (!pw) {
          return of(null);
        }
        
        // Try to get bookingId from query params first, then from route params
        let bookingId = queryParams.get('bookingId');
        
        if (!bookingId) {
          // Get from route params via parent route
          const routeBookingId = this.activeRoute.parent?.snapshot.paramMap.get('bookingId') || 
                                this.activeRoute.snapshot.paramMap.get('bookingId');
          bookingId = routeBookingId || this.bookingId;
        }
        
        if (!bookingId) {
          return of(null);
        }
        
        return this.bookingService.authenticateToManageBooking(bookingId, pw);
      }),
      map((response: any) => {
        // Handle the API response structure {success: true, data: Booking}
        if (response && response.success && response.data) {
          return response.data;
        }
        return response?.data || null;
      })
    ),
    { initialValue: null }
  );

  // Computed signals for easy access
  booking = computed(() => this.bookingResponse());
  fleet = computed(() => this.booking()?.fleet);
  booking_obj = computed(() => this.booking());
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
    // Initialize modal when booking data is available
    this.initModalWhenReady();
  }

  private async initModalWhenReady(): Promise<void> {
    // Wait for booking data to be available
    const checkBooking = () => {
      const booking = this.booking();
      if (booking) {
        this.initModal();
      } else {
        // Check again after a short delay
        setTimeout(checkBooking, 100);
      }
    };
    checkBooking();
  }

  goToTab(index: number): void {
    this.selectedTabIndex = index;
    this.activeTab = this.tabs[index].id;
    
    // When switching to Messages tab, adjust chat container
    if (index === 1) {
      setTimeout(() => {
        this.setConvoContainerHeight();
        this.scrollToBottom();
      }, 100);
    }
  }

  setConvoContainerHeight(): void {
    if (this.conversation) {
      this.conversation.setConvoContainerHeight();
    }
  }

  scrollToBottom(): void {
    if (this.conversation) {
      this.conversation.scrollToBottom();
    }
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
      const booking = this.booking();
      if (booking?.customer) {
        this.intentHandler(booking.customer)
          .pipe(takeUntil(this.destroyed))
          .subscribe((intent) => {
            this.mountCard(intent);
          });
      }
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

  // Custom tab methods
  setActiveTab(tabId: string): void {
    this.activeTab = tabId;
  }

  isTabActive(tabId: string): boolean {
    return this.activeTab === tabId;
  }

  // Contact action methods
  callHost(): void {
    const fleet = this.fleet();
    if (fleet?.owner?.phone) {
      window.location.href = `tel:+1${fleet.owner.phone}`;
    }
  }

  emailHost(): void {
    const fleet = this.fleet();
    if (fleet?.owner?.email) {
      window.location.href = `mailto:${fleet.owner.email}`;
    }
  }

  chatWithHost(): void {
    // Switch to Messages tab (index 1)
    this.goToTab(1);
  }

  // Payment dialog methods
  openPaymentDialog(): void {
    if (isPlatformBrowser(this.platformId) && this.paymentDialogElement) {
      this.paymentDialogElement.showModal();
    }
  }

  closePaymentDialog(): void {
    if (isPlatformBrowser(this.platformId) && this.paymentDialogElement) {
      this.paymentDialogElement.close();
    }
  }

  // Map link method
  openMapLocation(location: string): void {
    if (location) {
      const encodedLocation = encodeURIComponent(location);
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`;
      window.open(mapsUrl, '_blank');
    }
  }

  // Vehicle Guide Dialog Methods
  openGreetingDialog(): void {
    this.dialog.open(VehicleGuideDialogComponent, {
      data: {
        title: 'Welcome Message',
        icon: 'waving_hand',
        content: this.vehicleGuide.greeting
      },
      panelClass: 'vehicle-guide-dialog',
      autoFocus: false,
      restoreFocus: false
    });
  }

  openDirectionsDialog(): void {
    this.dialog.open(VehicleGuideDialogComponent, {
      data: {
        title: 'Vehicle Instructions',
        icon: 'directions_car',
        content: this.vehicleGuide.directions
      },
      panelClass: 'vehicle-guide-dialog',
      autoFocus: false,
      restoreFocus: false
    });
  }

  openQuestionsDialog(): void {
    this.dialog.open(VehicleGuideDialogComponent, {
      data: {
        title: 'Frequently Asked Questions',
        icon: 'help_outline',
        content: this.vehicleGuide.questions
      },
      panelClass: 'vehicle-guide-dialog',
      autoFocus: false,
      restoreFocus: false
    });
   }
 }
