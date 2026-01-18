import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
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
  //Holt Buchungen eines Verleihers
  getBookingsByLenderId(lenderId: number, includeDeleted: boolean = false): Observable<any[]> {
    //let params = new HttpParams().set('includeDeleted', includeDeleted.toString());
    return this.http.get<any[]>(`http://localhost:8080/api/lenders/${lenderId}/bookings`);
  }
  returnBooking(id: number): Observable<Booking> {
    return this.recordReturn(id);
  }
  // Verleiher lehnt Buchung ab (mit Begründung)
  rejectBooking(id: number, reason?: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
  // GET /api/bookings (Alle Buchungen abrufen mit optionalen Filtern)
  getBookings(status?: 'overdue' | 'pending' | 'confirmed' | 'picked_up' | 'returned' | 'cancelled' | 'expired' | 'rejected'): Observable<Booking[]> {
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }
    return this.http.get<Booking[]>(this.apiUrl, { params });
  }
  // GET /api/bookings?status=pending
  getPendingBookings(): Observable<Booking[]> {
    const params = new HttpParams().set('status', 'PENDING');
    return this.http.get<Booking[]>(this.apiUrl, { params });
  }

  // GET /api/bookings (Alle Buchungen inkl. cancelled und rejected abrufen)
  getAllBookings(): Observable<Booking[]> {
    // Rufe alle Status parallel ab und kombiniere die Ergebnisse
    return forkJoin({
      pending: this.getBookings('pending'),
      confirmed: this.getBookings('confirmed'),
      pickedUp: this.getBookings('picked_up'),
      returned: this.getBookings('returned'),
      cancelled: this.getBookings('cancelled'),
      expired: this.getBookings('expired'),
      rejected: this.getBookings('rejected')
    }).pipe(
      map(results => {
        // Kombiniere alle Arrays zu einem einzigen Array
        const allBookings = [
          ...results.pending,
          ...results.confirmed,
          ...results.pickedUp,
          ...results.returned,
          ...results.cancelled,
          ...results.expired,
          ...results.rejected
        ];

        // Entferne Duplikate basierend auf ID und gib direkt zurück
        return Array.from(
          new Map(allBookings.map(booking => [booking.id, booking])).values()
        );
      })
    );
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
  confirmBooking(id: number, proposedPickups: string[] = [], message?: string): Observable<Booking> {
    const body: any = {
      action: 'confirm',
      proposedPickups : proposedPickups
    };

    if (message?.trim()) {
      body.message = message.trim();
    }

    return this.http.patch<Booking>(`${this.apiUrl}/${id}`, body);
  }

  // Student wählt einen der vorgeschlagenen Abholtermine
  selectPickup(id: number, selectedPickup: string, message?: string): Observable<Booking> {
    const body: any = {
      action: 'select_pickup',
      selectedPickup : selectedPickup
    };

    if (message?.trim()) {
      body.message = message.trim();
    }

    return this.http.patch<Booking>(`${this.apiUrl}/${id}`, body);
  }

  // Gegenvorschlag machen (Ping-Pong)
  proposePickups(id: number, proposedPickups: string[], message?: string): Observable<Booking> {
    const body: any = {
      action: 'propose',
      proposedPickups : proposedPickups
    };

    if (message?.trim()) {
      body.message = message.trim();
    }

    return this.http.patch<Booking>(`${this.apiUrl}/${id}`, body);
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
  updateStatus(id: number, data: any): Observable<Booking> {
    return this.http.patch<Booking>(`${this.apiUrl}/${id}`, data);
  }
  // Generische Methode für alle Status-Updates (falls benötigt)
  updateBookingStatus(id: number, action: string, data?: {
    proposedPickups?: string[],
    selectedPickup?: string
  }): Observable<Booking> {
    return this.http.patch<Booking>(`${this.apiUrl}/${id}`, { action, ...data });
  }
}
