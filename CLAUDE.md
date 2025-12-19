# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a full-stack **Analog/Angular 20** application for managing vehicle rental bookings with digital signatures, payment processing, and Firebase backend integration. It uses Analog's file-based routing (similar to Next.js) and integrates multiple specialized packages from the @fumes ecosystem.

**Tech Stack**: Angular 20 + Analog (SSR framework) + Vite + Firebase + Firestore + Stripe + Vitest

## Common Commands

### Development
```bash
npm install                    # Install dependencies
npm start                      # Start dev server (alias for npm run dev)
npm run dev                    # Start Vite dev server with SSR at http://localhost:5173
```

### Building
```bash
npm run build                  # Production build (client + server)
npm run watch                  # Build in watch mode
npm run preview                # Run production server from dist/analog/server/index.mjs
```

### Testing
```bash
npm test                       # Run all tests with Vitest
npm test -- --watch            # Run tests in watch mode
npm test -- path/to/file.spec.ts  # Run specific test file
```

### Other
```bash
npm run ng                     # Run Angular CLI commands
```

## Architecture Overview

### File-Based Routing (Analog)

Routes are automatically generated from the `/src/app/pages` directory structure:

- `pages/index.page.ts` → `/`
- `pages/solutions.page.ts` → `/solutions`
- `pages/sign-agreement/[agreementId].page.ts` → `/sign-agreement/:agreementId`
- `pages/manage-booking/[bookingId].page.ts` → `/manage-booking/:bookingId`
- `pages/v/[id].page.ts` + `[id].server.ts` → `/v/:id` (with SSR data loading)

**Dynamic Routes with SSR**: Use `[paramName].server.ts` for server-side data fetching before client render. The page component accesses this data via `injectLoad()`:

```typescript
// [id].server.ts
export const load = async ({ params }: PageServerLoad) => {
  const id = params?.['id'];
  const data = await fetchData(id);
  return data;
};

// [id].page.ts
document = toSignal(injectLoad());
```

### Backend API Routes

API routes follow the same file-based pattern in `/src/server/routes/api/v1/`:

- Each route file exports a `defineEventHandler()` function using h3 (Nitro's HTTP framework)
- Controllers in `/src/server/controllers/` contain business logic
- Firebase Admin SDK is used for server-side Firestore operations

Example:
```typescript
// src/server/routes/api/v1/authenticate-booking.post.ts
export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const result = await verifyAndRetrieveBooking(body.bookingId, body.password);
  return { success: true, data: result };
});
```

### Component Architecture

All components are **standalone** (no NgModules) and extend `BaseComponent` for automatic cleanup:

```typescript
@Component({
  standalone: true,
  imports: [CommonModule, ...],
  template: `...`,
  styleUrl: './component.scss'
})
export class MyComponent extends BaseComponent {
  protected destroyed = new Subject<void>(); // Inherited from BaseComponent

  ngOnInit() {
    this.service.data$
      .pipe(takeUntil(this.destroyed))
      .subscribe(...);
  }
}
```

**Signals** (Angular 16+) are heavily used for reactivity:
```typescript
private readonly data = toSignal(this.service.fetchData$, { initialValue: null });
computed = computed(() => this.data()?.someField);
```

### E-Sign Compliance Architecture

**Critical Pattern**: The application implements an e-sign compliant document signing workflow:

#### Generated Agreement Component (Page Model)

The `GeneratedAgreementComponent` represents a **single page** in a document:
- Contains validation inputs (signature fields, date fields, initials, checkboxes)
- Used for **two purposes**:
  1. **Preview mode**: Host side can preview with values populated from booking data
  2. **Signing mode**: Customer fills/signs validation inputs for compliance
- All validation inputs must be completed for the page to be valid

#### Envelope Model

An **envelope** is a collection of pages (multiple `GeneratedAgreementComponent` instances):
```typescript
interface Envelope {
  pages: GeneratedAgreementPage[];
  status: 'draft' | 'sent' | 'completed';
  signers: Signer[];
  // ... other envelope metadata
}
```

#### E-Sign Workflow

1. **Creation**: Host creates envelope with multiple agreement pages
2. **Preview**: Host previews pages with booking data pre-filled
3. **Send**: Envelope sent to customer for signing
4. **Validation**: Each page validates all required inputs are filled
5. **Submit**: On envelope submit, backend creates Firestore collections that don't exist yet
6. **Storage**: Signed envelope stored with audit trail for e-sign compliance

**Important**: When working with the generated agreement component:
- Validate all required inputs before allowing submission
- Maintain audit trail (who signed, when, IP address, etc.) for e-sign compliance
- Collections for envelopes/signatures will be created dynamically on backend during submit
- Preview mode should populate fields but not validate, signing mode must validate

### @fumes Packages Integration

The application integrates multiple internal packages:

- **@fumes/types**: Shared TypeScript types and base classes
- **@fumes/services**: Shared services with `LIB_ENV` injection token
- **@fumes/constants**: Shared constants (Images, etc.)
- **@fumes/directives**: Reusable directives
- **@fumes/booking-breakdown**, **@fumes/conversation**, **@fumes/fumes-map**: UI components
- **@fumes/digital-signature**: Digital signature custom element (web component)
- **@fumes/generated-agreement**: Agreement rendering logic
- **@fumes/memoize**: Performance utilities with `@memoizer()` decorator

When using @fumes packages, provide `LIB_ENV` token in `app.config.ts`:
```typescript
import { LIB_ENV } from '@fumes/services';
import { environment } from './config/environment';

providers: [
  { provide: LIB_ENV, useValue: environment }
]
```

### Firebase Setup (Dual Configuration)

**Client-side** (`src/lib/firebase.ts`):
```typescript
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
const app = initializeApp(environment.firebase);
export const db = getFirestore(app);
export const functions = getFunctions(app);
```

**Server-side** (`src/lib/firebase-admin.ts`):
```typescript
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
const adminApp = initializeApp({ credential: cert(serviceAccount) });
export const adminDb = getFirestore(adminApp);
```

Use `adminDb` for server routes/controllers, `db` for client-side components.

### Firestore Collections

```
firestore
├── bookings/{bookingId}
│   ├── fleetRef: string
│   ├── password: string (encrypted with AES-256-CTR)
│   ├── vehicle: VehicleDetails
│   ├── customer: CustomerInfo
│   ├── reservation: ReservationInfo
│   └── /agreements/{agreementId} (subcollection)
├── fleets/{fleetRef}
├── vanity-pages/{pageId}
├── vehicles/{vehicleId}
└── envelopes/{envelopeId}           # Created dynamically on submit
    ├── pages: GeneratedAgreementPage[]
    ├── status: 'draft' | 'sent' | 'completed'
    ├── bookingRef: string
    ├── signers: Signer[]
    ├── createdAt: Timestamp
    ├── completedAt: Timestamp | null
    └── auditTrail: AuditEvent[]     # E-sign compliance tracking
```

**Note**: Envelope-related collections are created dynamically by the backend during the submission process. When implementing envelope submission endpoints, ensure you create all necessary collections and maintain the audit trail for e-sign compliance.

### Environment Configuration

Environment variables are accessed via Vite's `import.meta.env`:

```typescript
// src/app/config/environment.ts
export const environment = {
  production: import.meta.env['PROD'] || false,
  stripe: {
    publishableKey: import.meta.env['VITE_STRIPE'] || ''
  },
  firebase: { ... },
  apiUrl: import.meta.env['VITE_API_URL'] || '/api/v1'
};
```

Required environment variables (create `.env` file):
```
VITE_STRIPE=pk_test_...
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_API_URL=/api/v1
```

Server-side environment variables:
```
CIPHER_CRYPTO_KEY=<32-byte-hex-key>  # For password encryption
GOOGLE_APPLICATION_CREDENTIALS=<path-to-service-account.json>
```

### SSR Considerations

When working with browser-only APIs (DOM, window, Stripe, etc.), always check platform:

```typescript
import { isPlatformBrowser, PLATFORM_ID } from '@angular/common';

@Inject(PLATFORM_ID) platformId: Object

ngOnInit() {
  if (isPlatformBrowser(this.platformId)) {
    // Browser-only code (Stripe, DOM manipulation, etc.)
    const { loadStripe } = await import('@stripe/stripe-js');
  }
}
```

Use the `WINDOW` injection token for safe window access:
```typescript
import { WINDOW } from '@app/tokens/window.token';

constructor(@Inject(WINDOW) private window: Window | null) {}
```

### State Management

No centralized state library (NgRx/Akita). State is managed through:

1. **Angular Signals** for reactive data
2. **RxJS BehaviorSubjects** for complex streams
3. **Local component state** for UI-only state

### Security Patterns

- **Password Encryption**: Server-side AES-256-CTR encryption/decryption in `/src/server/utils/crypto.ts`
- **Query Parameter Auth**: Encrypted passwords passed via URL query params (`?pw=xxx`)
- **Data Sanitization**: Always delete sensitive fields before returning from controllers:
  ```typescript
  delete bookingData.password;
  delete bookingData.internalNotes;
  ```

### Testing

Tests use Vitest with Angular testing utilities:

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';

describe('MyComponent', () => {
  let component: MyComponent;
  let fixture: ComponentFixture<MyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyComponent]  // Standalone components
    }).compileComponents();

    fixture = TestBed.createComponent(MyComponent);
    component = fixture.componentInstance;
  });
});
```

Test setup is in `src/test-setup.ts` and automatically imported by Vitest.

## Important Conventions

1. **Standalone Components Only**: No NgModules. Import dependencies directly in component metadata.

2. **Extend BaseComponent**: All components should extend `BaseComponent` from `@fumes/types` for automatic cleanup via `this.destroyed`.

3. **File Naming**:
   - Pages: `*.page.ts`
   - Server loaders: `*.server.ts`
   - API routes: `*.post.ts`, `*.get.ts`, etc. in `/src/server/routes/`
   - Components: `*.component.ts`
   - Services: `*.service.ts`
   - Tests: `*.spec.ts`

4. **Imports**: Use absolute imports from `@app/`, `@server/`, etc. (configured in tsconfig paths).

5. **TypeScript**: Strict mode enabled. All new code must satisfy:
   - `strict: true`
   - `noImplicitReturns: true`
   - `noFallthroughCasesInSwitch: true`
   - `strictTemplates: true`

6. **SCSS**: Component styles use SCSS with `inlineStylesExtension: 'scss'` in Vite config. Each component has its own `.scss` file.

7. **Error Handling**: Server routes should use h3's `createError()` for consistent HTTP errors:
   ```typescript
   throw createError({
     statusCode: 404,
     message: 'Booking not found'
   });
   ```

8. **Forms**: Use Reactive Forms with FormBuilder. For dynamic sections, use FormArray:
   ```typescript
   form = this.fb.group({
     items: this.fb.array([])
   });
   ```

## Project Structure

```
/
├── src/
│   ├── app/                      # Angular application
│   │   ├── components/           # Reusable UI components
│   │   ├── pages/                # File-based routes
│   │   ├── services/             # Application services
│   │   ├── models/               # TypeScript interfaces/types
│   │   ├── tokens/               # DI tokens
│   │   ├── config/               # Environment config
│   │   ├── app.ts                # Root component
│   │   ├── app.config.ts         # Application providers
│   │   └── app.config.server.ts  # Server-specific config
│   ├── server/                   # Backend (Nitro)
│   │   ├── routes/               # API endpoints (file-based)
│   │   │   └── api/v1/           # Versioned API routes
│   │   ├── controllers/          # Business logic
│   │   ├── utils/                # Server utilities
│   │   └── scripts/              # Server-side scripts
│   ├── lib/                      # Shared utilities
│   │   ├── firebase.ts           # Client Firebase config
│   │   └── firebase-admin.ts     # Server Firebase Admin SDK
│   ├── main.ts                   # Client entry point
│   ├── main.server.ts            # Server entry point
│   └── test-setup.ts             # Vitest setup
├── vite.config.ts                # Vite configuration
├── angular.json                  # Angular CLI config
├── tsconfig.json                 # TypeScript config
└── package.json                  # Dependencies and scripts
```

## Common Patterns

### Creating a New Page

1. Create `src/app/pages/my-page.page.ts`:
```typescript
import { Component } from '@angular/core';

@Component({
  standalone: true,
  template: `<h1>My Page</h1>`,
})
export default class MyPageComponent {}
```

2. For SSR data loading, create `my-page.server.ts`:
```typescript
import { PageServerLoad } from '@analogjs/router';

export const load = async ({ params }: PageServerLoad) => {
  const data = await fetchData();
  return data;
};
```

Route is automatically available at `/my-page`.

### Creating a New API Endpoint

1. Create `src/server/routes/api/v1/my-endpoint.post.ts`:
```typescript
import { defineEventHandler, readBody, createError } from 'h3';

export default defineEventHandler(async (event) => {
  if (event.method !== 'POST') {
    throw createError({ statusCode: 405 });
  }

  const body = await readBody(event);

  try {
    const result = await processData(body);
    return { success: true, data: result };
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: error.message
    });
  }
});
```

2. Call from client:
```typescript
this.http.post('/api/v1/my-endpoint', body).subscribe(response => {
  console.log(response.data);
});
```

### Working with Firestore

**Client-side**:
```typescript
import { Firestore } from '@angular/fire/firestore';
import { doc, getDoc } from 'firebase/firestore';

constructor(private firestore: Firestore) {}

async loadData(id: string) {
  const docRef = doc(this.firestore, 'collection', id);
  const docSnap = await getDoc(docRef);
  return docSnap.data();
}
```

**Server-side**:
```typescript
import { adminDb } from '@lib/firebase-admin';

async function loadData(id: string) {
  const docRef = adminDb.collection('collection').doc(id);
  const docSnap = await docRef.get();
  return docSnap.data();
}
```

### Adding a New Component

```typescript
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '@fumes/types';

@Component({
  selector: 'app-my-component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-component.component.html',
  styleUrl: './my-component.component.scss'
})
export class MyComponent extends BaseComponent {
  ngOnInit() {
    // Component logic
  }
}
```

## Node Version

Requires Node.js >= 20.19.1 (specified in `package.json` engines field).
