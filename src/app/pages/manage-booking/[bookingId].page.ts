import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RouteMeta } from '@analogjs/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { ManageBookingComponent } from '../../components/manage-booking/manage-booking.component';

// Route metadata for SEO
export const routeMeta: RouteMeta = {
  title: 'Manage Booking',
  meta: [
    {
      name: 'description',
      content: 'Manage your booking details and make changes to your reservation'
    }
  ]
};

@Component({
  selector: 'app-manage-booking-page',
  standalone: true,
  imports: [ManageBookingComponent],
  template: `
    @if (bookingId(); as id) {
      <app-manage-booking [bookingId]="id" />
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
    
    .spinner {
      font-size: 1.2rem;
      color: #666;
    }
  `]
})
export default class ManageBookingPage {
  private readonly route = inject(ActivatedRoute);
  
  // Extract bookingId from route parameters
  readonly bookingId = toSignal(
    this.route.paramMap.pipe(
      map((params) => params.get('bookingId'))
    )
  );
}