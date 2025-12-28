import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Booking, BookingCreate } from '../models/booking.model';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private readonly apiUrl = 'http://localhost:8080/api/bookings';

  constructor(private readonly http: HttpClient) {}

  // GET /api/bookings (Alle Buchungen abrufen mit optionalen Filtern)
  getBookings(status?: 'overdue' | 'pending' | 'confirmed' | 'picked_up' | 'returned' | 'cancelled' | 'expired' | 'rejected'): Observable<Booking[]> {
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }
    return this.http.get<Booking[]>(this.apiUrl, { params });
  }

  // POST /api/bookings (Neue Buchung erstellen)
  createBooking(booking: BookingCreate): Observable<Booking> {
    return this.http.post<Booking>(this.apiUrl, booking);
  }

  // GET /api/bookings/{id} (Einzelne Buchung abrufen)
  getBookingById(id: number): Observable<Booking> {
    return this.http.get<Booking>(`${this.apiUrl}/${id}`);
  }

  // DELETE /api/bookings/{id} (Buchung ablehnen oder stornieren)
  deleteBooking(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // PATCH /api/bookings/{id} (Booking-Status aktualisieren)
  updateBookingStatus(id: number, status: string): Observable<Booking> {
    return this.http.patch<Booking>(`${this.apiUrl}/${id}`, { status });
  }
}

