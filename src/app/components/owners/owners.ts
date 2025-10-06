import {
  CommonModule,
  isPlatformBrowser,
  NgOptimizedImage,
} from '@angular/common';
import {
  Component,
  ElementRef,
  HostListener,
  PLATFORM_ID,
  QueryList,
  ViewChild,
  ViewChildren,
  afterNextRender,
  inject,
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Images } from '@fumes/constants';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSliderModule } from '@angular/material/slider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { RouterModule } from '@angular/router';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { HttpClient } from '@angular/common/http';
import { finalize, takeUntil } from 'rxjs/operators';
// Dialog - conditionally imported to avoid SSR issues
// Onmedia stuff
import { NgxBorderBeamComponent } from '@omnedia/ngx-border-beam';
import { NgxRetroGridComponent } from '@omnedia/ngx-retro-grid';
import { NgxMarqueeComponent } from '@omnedia/ngx-marquee';
import { NgxTypewriterComponent } from '@omnedia/ngx-typewriter';
import { NgxGradientTextComponent } from '@omnedia/ngx-gradient-text';
import { NgxNeonUnderlineComponent } from '@omnedia/ngx-neon-underline';
import { NgxConnectionBeamComponent } from '@omnedia/ngx-connection-beam';
import { BaseComponent } from '../base/base.component';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgOptimizedImage,
    FormsModule,
    RouterModule,
    MatSliderModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    NgxBorderBeamComponent,
    NgxRetroGridComponent,
    NgxMarqueeComponent,
    NgxTypewriterComponent,
    NgxGradientTextComponent,
    NgxNeonUnderlineComponent,
    NgxConnectionBeamComponent,
  ],
  selector: 'landing-owners',
  templateUrl: './owners.component.html',
  styleUrls: ['./owners.component.scss'],
  providers: [
    // { provide: LIB_ENV, useValue: environment }
  ],
})
export class OwnersComponent extends BaseComponent {
  private title = inject(Title);
  private http = inject(HttpClient);
  private elementRef = inject(ElementRef);
  private platformId = inject(PLATFORM_ID);
  isBrowser = isPlatformBrowser(this.platformId);
  _Images: any = Images;
  @ViewChildren('.hidden', { read: ElementRef })
  hiddenElements: QueryList<ElementRef> | unknown;
  transactionAmount = 0;
  tier = 1;
  amount = 0;
  percentage = 0;
  fee = 0;

  contactForm: FormGroup = new FormGroup({
    name: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.email]),
    fleetSize: new FormControl('lt5', [Validators.required]),
    message: new FormControl('', [Validators.required]),
  });
  phoneCtrl: FormControl = new FormControl('', [
    Validators.required,
    Validators.pattern('^((\\+91-?)|0)?[0-9]{10}$'),
  ]);
  inquirySending = false;
  inquirySent = false;
  inquirySuccess = false;

  closing = false;
  dialogDismissedAlready = false;
  promoElem!: HTMLDialogElement;
  @ViewChild('promo', { read: ElementRef }) promoRef!: ElementRef;
  
  @HostListener('window:scroll', ['$event'])
  onScroll(event: any) {
    if (this.isBrowser) {
      if (window) {
        const top = window?.pageYOffset;
        if (top > 3300 && !this.dialogDismissedAlready) {
          this.openPromo();
        }
      }
    }
  }
  
  constructor() {
    super();
    this.title.setTitle('Fumes - Owners');
    console.log('_Images.integrations:', this._Images?.integrations);
    afterNextRender(() => {
      this.observeHiddenElements();
      if (this.isBrowser) {
        this.promoElem = this.promoRef.nativeElement;
        if (localStorage.getItem('promo-dismissed') !== 'true') {
          setTimeout(() => {
            this.openPromo();
          }, 3000);
        }
      }
    });
  }

  // @HostListener('window:scroll', ['$event'])

  highlights: any[] = [
    {
      icon: 'market',
      title: 'Marketplace',
      coming_soon: true,
      description: 'A robust marketplace to get bookings.',
    },
    {
      icon: 'page',
      title: 'SEO Page',
      coming_soon: true,
      description: 'Your own SEO friendly page to get bookings directly.',
    },
    {
      icon: 'vetting',
      title: 'Insurance Vetting',
      coming_soon: true,
      description: "Integration will alow you to check your renter's policy",
    },
    {
      icon: 'bookings',
      title: 'Booking System',
      description:
        'Take a rental from start to finish with our fully featured booking system.',
    },
    {
      icon: 'staff',
      title: 'Staff',
      description: 'Invite staff or managers to work on your fleet.',
    },
    {
      icon: 'pnl',
      title: 'P&L Tracking',
      description:
        'Keep track of expenses and revenue to determine profitability.',
    },
    {
      icon: 'maintenance',
      title: 'Maintenance',
      description: 'Keep track of the health and state of cars in your fleet.',
    },

    {
      icon: 'builder',
      title: 'Contract Builder',
      description: 'Powerful contract builder with e-sign capabilities',
    },

    {
      icon: 'tasks',
      title: 'Task Management',
      description: 'Create and assign tasks relevant to the business',
    },
    {
      icon: 'payments',
      title: 'Payment Processor',
      description:
        "Setting up a payment processor shouldn't be hard. Thats why we include Stripe for you.",
    },
  ];
  tierList = [
    { tier: 1, fee: 2.1, requirements: 'Under $35k', value: 34999 },
    { tier: 2, fee: 1.5, requirements: '$35k to $49k', value: 49999 },
    { tier: 3, fee: 1.3, requirements: '$50k to $99k', value: 99999 },
    { tier: 4, fee: 1.1, requirements: '$100k to $249k', value: 249999 },
    { tier: 5, fee: 0.9, requirements: '$250k to $499k', value: 350000 },
    { tier: 6, fee: 0.7, requirements: '$500k and up', value: 500000 },
  ];

  paragraph: string = `Streamline your car rental business with our powerful, user-friendly software. Manage bookings, track
          vehicles, and grow your revenue - all in one place.`;

  setSlider(value: number) {
    this.transactionAmount = value;
    this.calculateFees(value);
  }

  observeHiddenElements() {

    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1,
    };

    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('show');
        } else {
          entry.target.classList.remove('show');
        }
      });
    }, options);

    const hiddenElements =
      this.elementRef.nativeElement.querySelectorAll('.hidden');
    hiddenElements.forEach((element: Element) => {
      observer.observe(element);
    });
  }

  calculateFees(amount: number) {
    let tier: number = 1,
      percentage: any,
      fee: any;

    if (amount < 35000) {
      tier = 1;
      percentage = 2.1;
    } else if (amount >= 35000 && amount <= 49999) {
      tier = 2;
      percentage = 1.5;
    } else if (amount >= 50000 && amount <= 99999) {
      tier = 3;
      percentage = 1.3;
    } else if (amount >= 100000 && amount <= 249999) {
      tier = 4;
      percentage = 1.1;
    } else if (amount >= 250000 && amount <= 499999) {
      tier = 5;
      percentage = 0.9;
    } else if (amount >= 500000) {
      tier = 6;
      percentage = 0.7;
    }

    // Calculate the fee
    fee = (amount * percentage) / 100;

    // Format the fee to two decimal places
    fee = fee.toFixed(2);

    this.tier = tier;
    this.amount = amount;
    this.fee = fee;
    this.percentage = percentage;
  }
  onSubmit() {
    if (this.contactForm.valid) {
      const { name, email, fleetSize, message } = this.contactForm.value;
      this.inquirySending = true;

      // Replace Firebase function with HTTP call
      const inquiryData = { name, email, fleetSize, message };

      this.http
        .post(`${window.location.origin}/api/v1/inquire`, inquiryData)
        .pipe(finalize(() => (this.inquirySending = false)))
        .subscribe({
          next: (res: any) => {
            this.inquirySending = false;
            this.inquirySent = true;
            this.inquirySuccess = true;
            this.contactForm.reset();
          },
          error: (err: any) => {
            this.inquirySending = false;
            this.inquirySuccess = false;
            this.contactForm.reset();
            console.error('Inquiry submission failed:', err);
          },
        });
    }
  }

  onPromoSubmit() {

    this.inquirySending = true;
    this.contactForm.patchValue({
      name: 'Promo Submission',
      email: this.phoneCtrl.value,
      fleetSize: 'lt5',
      message:
        'This person entered their phone number only. They want to take advantage of the tier 2 promotion. Call them at this number:' +
        this.phoneCtrl.value,
    });

    // Replace Firebase function with HTTP call
    this.http
      .post(
        `${window.location.origin}/api/v1/inquire`,
        this.contactForm.value
      )
      .pipe(finalize(() => (this.inquirySending = false)))
      .subscribe({
        next: (res: any) => {
          this.inquirySending = false;
          this.contactForm.reset();
          this.closePromo();
        },
        error: (err: any) => {
          this.inquirySending = false;
          this.contactForm.reset();
          console.error('Promo submission failed:', err);
        },
      });
  }

  openPromo() {
    if (this.promoElem) {
      this.promoElem.showModal();
    }
  }

  closePromo() {
    if (!this.promoElem) {
      return;
    }

    this.closing = true;
    this.dialogDismissedAlready = true;
    setTimeout(() => {
      this.promoElem.close();
      this.closing = false;
    }, 300);
  }

  goToRegister(){
    const ownerUrl = `${import.meta.env['VITE_OWNER'] || ''}/#/auth/register`;
    window.location.href = ownerUrl;
  }

  switchApp(app: string) {
    //TODO: not used?
    // this.commonService.getUrlForApp(app);
  }
}
