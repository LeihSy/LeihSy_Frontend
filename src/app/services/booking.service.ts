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

  // ========================================
  // GET ENDPOINTS
  // ========================================

  // GET /api/bookings (Alle Buchungen abrufen mit optionalen Filtern)
  getBookings(status?: 'overdue' | 'pending' | 'confirmed' | 'picked_up' | 'returned' | 'cancelled' | 'expired' | 'rejected'): Observable<Booking[]> {
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }
    return this.http.get<Booking[]>(this.apiUrl, { params });
  }

  // GET /api/bookings/{id} (Einzelne Buchung abrufen)
  getBookingById(id: number): Observable<Booking> {
    return this.http.get<Booking>(`${this.apiUrl}/${id}`);
  }

  // ========================================
  // POST ENDPOINT
  // ========================================

  // POST /api/bookings (Neue Buchung erstellen)
  createBooking(booking: BookingCreate): Observable<Booking> {
    return this.http.post<Booking>(this.apiUrl, booking);
  }

  // ========================================
  // DELETE ENDPOINT
  // ========================================

  // DELETE /api/bookings/{id} (Buchung ablehnen oder stornieren)
  deleteBooking(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // ========================================
  // PATCH ENDPOINTS (Status-Updates)
  // ========================================

  // Verleiher bestätigt Buchung und schlägt Abholtermine vor
  confirmBooking(id: number, proposedPickups: string[]): Observable<Booking> {
    return this.http.patch<Booking>(`${this.apiUrl}/${id}`, {
      action: 'confirm',
      proposedPickups
    });
  }

  // Student wählt einen der vorgeschlagenen Abholtermine
  selectPickup(id: number, selectedPickup: string): Observable<Booking> {
    return this.http.patch<Booking>(`${this.apiUrl}/${id}`, {
      action: 'select_pickup',
      selectedPickup
    });
  }

  // Gegenvorschlag machen (Ping-Pong)
  proposePickups(id: number, proposedPickups: string[]): Observable<Booking> {
    return this.http.patch<Booking>(`${this.apiUrl}/${id}`, {
      action: 'propose',
      proposedPickups
    });
  }

  // Verleiher dokumentiert Ausgabe
  recordPickup(id: number): Observable<Booking> {
    return this.http.patch<Booking>(`${this.apiUrl}/${id}`, {
      action: 'pickup'
    });
  }

  // Verleiher dokumentiert Rückgabe
  recordReturn(id: number): Observable<Booking> {
    return this.http.patch<Booking>(`${this.apiUrl}/${id}`, {
      action: 'return'
    });
  }

  // Generische Methode für alle Status-Updates (falls benötigt)
  updateBookingStatus(id: number, action: string, data?: {
    proposedPickups?: string[],
    selectedPickup?: string
  }): Observable<Booking> {
    return this.http.patch<Booking>(`${this.apiUrl}/${id}`, { action, ...data });
  }
}
