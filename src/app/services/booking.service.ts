import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Booking, BookingCreate } from '../models/booking.model';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private apiUrl = 'http://localhost:8080/api/bookings';

  constructor(private http: HttpClient) {}

  /**
   * GET /api/bookings - Alle Buchungen abrufen
   */
  getAllBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(this.apiUrl);
  }

  /**
   * GET /api/bookings/{id} - Einzelne Buchung per ID abrufen
   */
  getBookingById(id: number): Observable<Booking> {
    return this.http.get<Booking>(`${this.apiUrl}/${id}`);
  }

  /**
   * GET /api/bookings/user/{userId} - Buchungen eines Users abrufen
   */
  getBookingsByUserId(userId: number): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.apiUrl}/user/${userId}`);
  }

  /**
   * GET /api/bookings/pending - Offene Buchungen abrufen
   */
  getPendingBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.apiUrl}/pending`);
  }

  /**
   * GET /api/bookings/overdue - Überfällige Buchungen abrufen
   */
  getOverdueBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.apiUrl}/overdue`);
  }

  /**
   * POST /api/bookings - Neue Buchung erstellen
   */
  createBooking(booking: BookingCreate): Observable<Booking> {
    return this.http.post<Booking>(this.apiUrl, booking);
  }

  /**
   * PUT /api/bookings/{id}/confirm - Buchung bestätigen
   */
  confirmBooking(id: number): Observable<Booking> {
    return this.http.put<Booking>(`${this.apiUrl}/${id}/confirm`, {});
  }

  /**
   * PUT /api/bookings/{id}/reject - Buchung ablehnen
   */
  rejectBooking(id: number): Observable<Booking> {
    return this.http.put<Booking>(`${this.apiUrl}/${id}/reject`, {});
  }

  /**
   * PUT /api/bookings/{id}/pickup - Abholung registrieren
   */
  recordPickup(id: number): Observable<Booking> {
    return this.http.put<Booking>(`${this.apiUrl}/${id}/pickup`, {});
  }

  /**
   * PUT /api/bookings/{id}/return - Rückgabe registrieren
   */
  recordReturn(id: number): Observable<Booking> {
    return this.http.put<Booking>(`${this.apiUrl}/${id}/return`, {});
  }

  /**
   * PUT /api/bookings/{id}/propose - Neuen Abholtermin vorschlagen
   */
  proposePickupDate(id: number, proposalPickup: string): Observable<Booking> {
    return this.http.put<Booking>(`${this.apiUrl}/${id}/propose`, { proposalPickup });
  }

  /**
   * DELETE /api/bookings/{id} - Buchung stornieren
   */
  cancelBooking(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

