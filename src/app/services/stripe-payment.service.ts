import { Inject, Injectable, PLATFORM_ID } from "@angular/core";
import { LIB_ENV, LibEnvironment } from "@fumes/services";
import { isPlatformBrowser } from "@angular/common";
import { Functions, httpsCallableData } from "@angular/fire/functions";

@Injectable({
  providedIn: "root",
})
export class StripePaymentService {
  isBrowser: boolean;
  stripe: any;

  constructor(
    @Inject(LIB_ENV) private env: any,
    @Inject(PLATFORM_ID) private platformId: Object,
    private fns: Functions
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  async initStripe() {
    this.loadStripeConditionally();
  }

  async loadStripeConditionally() {
    if (isPlatformBrowser(this.platformId) && typeof window !== 'undefined') {
      const { loadStripe } = await import("@stripe/stripe-js");
      // Use the publishableKey from the structured environment
      this.stripe = await loadStripe(this.env.stripe.publishableKey);
    }
  }

  getStripeInstance() {
    return this.stripe;
  }

  // Callable Functions
  getOrCreateStripeCustomer(user: any) {
    const call = httpsCallableData(this.fns, "gets_or_create_stripe_customer");
    return call(user);
  }

  createSession(product: any) {
    const call = httpsCallableData(this.fns, "create_payment_session");
    return call(product);
  }

  listPaymentMethods(stripeCustomerId: string) {
    const call = httpsCallableData(this.fns, "get_stripe_customer_payment_methods");
    return call({ stripeCustomerId });
  }

  removePaymentMethod(paymentMethodId: string) {
    const call = httpsCallableData(this.fns, "detatch_customer_payment_method");
    return call({ paymentMethodId });
  }

  setupIntent(user: any) {
    const call = httpsCallableData(this.fns, "setup_customer_payment_intent");
    return call(user);
  }

  cancelIntent(intentId: string) {
    const call = httpsCallableData(this.fns, "cancel_setup_intent");
    return call({ intentId });
  }

  getAllPrices() {
    // This actually only gets the prices
    return httpsCallableData(this.fns, "get_all_prices")({});
  }

  getAllProducts() {
    return httpsCallableData(this.fns, "get_all_stripe_products")({});
  }

  // Stripe Connect
  createConnectedAccount(fleet: any) {
    const call = httpsCallableData(this.fns, "create_connect_account");
    return call(fleet);
  }

  getConnectedStripeAccount(connectedStripeAccountId: string) {
    const call = httpsCallableData(this.fns, "get_stripe_connect_account");
    return call({ connectedStripeAccountId });
  }

  // TODO: remove this or refactor
  getExpressDashboardLink(accountId: string) {
    const call = httpsCallableData(this.fns, "get_stripe_express_dashboard_link");
    return call(accountId);
  }

  getAccountSession(
    connectedStripeAccountId: string,
    embedded_component: string
  ) {
    // gets the client secret to show their embedded component
    let cmp: any;
    switch (embedded_component) {
      case "payments":
        cmp = {
          payments: {
            enabled: true,
            features: {
              refund_management: true,
              dispute_management: true,
              capture_payments: true,
            },
          },
        };
        break;
      case "account_management":
        cmp = {
          account_management: {
            enabled: true,
            features: {
              external_account_collection: true,
            },
          },
        };
        break;
      case "payouts":
        cmp = {
          payouts: {
            enabled: true,
            features: {
              instant_payouts: true,
              standard_payouts: true,
              edit_payout_schedule: true,
            },
          },
        };
        break;
      case "account_onboarding":
        cmp = {
          account_onboarding: {
            enabled: true,
            features: {
              external_account_collection: true,
            },
          },
        };
        break;
      default:
        break;
    }
    const call = httpsCallableData(this.fns, "get_embedded_component");
    return call({ accountId: connectedStripeAccountId, component: cmp });
  }

  // Customers
  deleteStripeCustomer(customerId: string) {
    if (!customerId) {
      return;
    }
    const call = httpsCallableData(this.fns, "delete_stripe_customer");
    return call({ customerId: customerId });
  }
}