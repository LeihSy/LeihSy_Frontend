import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Booking } from '../models/booking.model';

export type TransactionType = 'PICKUP' | 'RETURN';

export interface TransactionResponse {
  id: number;
  bookingId: number;
  token: string;
  transactionType: TransactionType;
  expiresAt: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class BookingTransactionService {
  private http = inject(HttpClient);
  // Proxy leitet /api Requests an :8080 weiter
  private readonly apiUrl = '/api';

  /**
   * Generiert einen Token (Student).
   */
  generateToken(bookingId: number): Observable<TransactionResponse> {
    return this.http.post<TransactionResponse>(`${this.apiUrl}/bookings/${bookingId}/transactions`, {});
  }

  /**
   * Löst einen Token ein (Für Student/Abholer).
   * Nutzt PATCH /api/transactions/{token} (Update-Semantik)
   */
  executeTransaction(token: string): Observable<Booking> {
    return this.http.patch<Booking>(`${this.apiUrl}/transactions/${token}`, {});
  }
}
