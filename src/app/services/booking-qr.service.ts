import { Injectable, inject } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BookingQrService {
  // Nutzt window.location.origin für dynamische URLs (Dev vs Prod)
  buildActionUrl(bookingId: number): string {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:4200';
    return `${origin}/qr-action/${bookingId}`;
  }
}
