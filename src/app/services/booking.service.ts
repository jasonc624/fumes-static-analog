import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../config/environment';
import { Booking } from '@fumes/types';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  authenticateToManageBooking(bookingId: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/authenticate-booking`, {
      bookingId,
      password
    });
  }

  createVerificationSession(booking: Booking): Observable<any> {
    return this.http.post(`${this.apiUrl}/verification-session`, {
      booking
    });
  }
}