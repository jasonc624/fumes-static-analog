import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { injectLoad, RouteMeta } from '@analogjs/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { VanityPageComponent as VanityPageDisplayComponent } from '../../components/vanity-page/vanity-page.component';

// Define the Document interface based on vanity page structure
export interface Document {
  id?: string;
  name: string;
  description: string;
  bannerUrl?: Array<{ url: string }>;
  logo?: Array<{ url: string }>;
  vehicles?: any[];
  fleetRef?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Route metadata for SEO
export const routeMeta: RouteMeta = {
  title: 'Vanity Page Details',
  meta: [
    {
      name: 'description',
      content: 'View detailed information about this vanity page'
    }
  ]
};

@Component({
  selector: 'app-vanity-page',
  standalone: true,
  imports: [CommonModule, VanityPageDisplayComponent],
  template: `
    @if (document(); as page) {
      <vanity-page 
        [vanityPrm]="page" 
        [availability]="availability">
      </vanity-page>
    } @else {
      <div class="loading-screen">
        <div class="spinner">Loading...</div>
      </div>
    }
  `,
  styles: [`
    .loading-screen {
      position: fixed;
      top: 0;
      left: 0;
      display: grid;
      place-items: center;
      background: rgba(255, 255, 255, 0.75);
      width: 100dvw;
      height: 100dvh;
    }
  `]
})
export default class VanityPageComponent {
  private readonly route = inject(ActivatedRoute);
  
  // Load document data from server
  document = toSignal(injectLoad());
  
  // Extract route ID for debugging
  readonly routeId = toSignal(
    this.route.paramMap.pipe(
      map((params) => params.get('id'))
    )
  );

  // Availability data to pass to the display component
  availability = {
    Monday: "9AM-6pm",
    Tuesday: "9AM-6pm",
    Wednesday: "9AM-6pm",
    Thursday: "9AM-6pm",
    Friday: "9AM-6pm",
    Saturday: "9AM-9pm",
    Sunday: "9AM-9pm",
  };
}