import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Booking, BookingCreate } from '../models/booking.model';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private readonly apiUrl = 'http://localhost:8080/api/bookings';

  constructor(private readonly http: HttpClient) {}

  // ==================== GET Endpunkte ====================

  /**
   * GET /api/bookings/{id} - Einzelne Buchung abrufen
   */
  getBookingById(id: number): Observable<Booking> {
    return this.http.get<Booking>(`${this.apiUrl}/${id}`);
  }

  /**
   * GET /api/bookings/users/{userId} - Buchungen eines bestimmten Users abrufen
   */
  getBookingsByUserId(userId: number): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.apiUrl}/users/${userId}`);
  }

  /**
   * GET /api/bookings/users/me - Eigene Buchungen als Student abrufen
   */
  getMyBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.apiUrl}/users/me`);
  }

  /**
   * GET /api/bookings/overdue - Überfällige Buchungen abrufen
   */
  getOverdueBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.apiUrl}/overdue`);
  }

  /**
   * GET /api/bookings/lenders/{lenderId} - Buchungen eines bestimmten Verleihers abrufen
   */
  getBookingsByLenderId(lenderId: number): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.apiUrl}/lenders/${lenderId}`);
  }

  /**
   * GET /api/bookings/lenders/{lenderId}/pending - PENDING Buchungen eines bestimmten Verleihers abrufen
   */
  getPendingBookingsByLenderId(lenderId: number): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.apiUrl}/lenders/${lenderId}/pending`);
  }

  /**
   * GET /api/bookings/lenders/me - Alle eigenen Buchungen als Verleiher abrufen
   */
  getMyLenderBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.apiUrl}/lenders/me`);
  }

  /**
   * GET /api/bookings/lenders/me/pending - Eigene PENDING Anfragen als Verleiher abrufen
   */
  getMyPendingLenderBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.apiUrl}/lenders/me/pending`);
  }

  // ==================== POST Endpunkte ====================

  /**
   * POST /api/bookings - Neue Buchung erstellen
   */
  createBooking(booking: BookingCreate): Observable<Booking> {
    return this.http.post<Booking>(this.apiUrl, booking);
  }

  // ==================== PUT Endpunkte ====================

  /**
   * PUT /api/bookings/{id}/confirm - Buchung bestätigen und Termine vorschlagen
   */
  confirmBooking(id: number, proposedPickups: string): Observable<Booking> {
    return this.http.put<Booking>(`${this.apiUrl}/${id}/confirm`, { proposedPickups });
  }

  /**
   * PUT /api/bookings/{id}/reject - Buchung ablehnen
   */
  rejectBooking(id: number): Observable<Booking> {
    return this.http.put<Booking>(`${this.apiUrl}/${id}/reject`, {});
  }

  /**
   * PUT /api/bookings/{id}/propose - Gegenvorschlag machen (Ping-Pong)
   */
  proposePickupDate(id: number, proposedPickups: string): Observable<Booking> {
    return this.http.put<Booking>(`${this.apiUrl}/${id}/propose`, { proposedPickups });
  }

  /**
   * PUT /api/bookings/{id}/select-pickup - Abholtermin auswählen
   */
  selectPickupDate(id: number, confirmedPickup: string): Observable<Booking> {
    return this.http.put<Booking>(`${this.apiUrl}/${id}/select-pickup`, { confirmedPickup });
  }

  /**
   * PUT /api/bookings/{id}/pickup - Ausgabe dokumentieren
   */
  recordPickup(id: number): Observable<Booking> {
    return this.http.put<Booking>(`${this.apiUrl}/${id}/pickup`, {});
  }

  /**
   * PUT /api/bookings/{id}/return - Rückgabe dokumentieren
   */
  recordReturn(id: number): Observable<Booking> {
    return this.http.put<Booking>(`${this.apiUrl}/${id}/return`, {});
  }

  // ==================== DELETE Endpunkte ====================

  /**
   * DELETE /api/bookings/{id} - Buchung stornieren
   */
  cancelBooking(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

