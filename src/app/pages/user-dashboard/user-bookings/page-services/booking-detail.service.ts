import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';

import { Booking, BookingStatus } from '../../../../models/booking.model';
import { BookingService } from '../../../../services/booking.service';
import { UserBookingExportService } from './user-booking-export.service';
import { TimelineEvent } from '../../../../components/booking-components/booking-timeline/booking-timeline.component';
import { InfoItem } from '../../../../components/info-card/info-card.component';

@Injectable()
export class BookingDetailService {
  private readonly router = inject(Router);
  private readonly bookingService = inject(BookingService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly exportService = inject(UserBookingExportService);

  // Booking state
  booking = signal<Booking | null>(null);
  isLoading = signal(true);
  timelineEvents = signal<TimelineEvent[]>([]);
  showQrDialog = signal(false);

  // Pickup dialog state
  showPickupDialog = signal(false);
  selectedPickupDate = signal<string | null>(null);
  newProposedPickups = signal<string[]>([]);

  // Prüfe ob User die Termine selbst vorgeschlagen hat (darf sie dann nicht bestätigen)
  canSelectProposedPickups = computed<boolean>(() => {
    const booking = this.booking();
    if (!booking) return false;

    // User kann nur Termine auswählen, die vom Verleiher (lenderId) vorgeschlagen wurden
    // NICHT die, die er selbst vorgeschlagen hat (proposalById === userId)
    return booking.proposalById !== booking.userId;
  });

  // Prüfe ob die Buchung storniert werden kann
  canCancelBooking = computed<boolean>(() => {
    const booking = this.booking();
    if (!booking) return false;

    return booking.status === 'PENDING' || booking.status === 'CONFIRMED';
  });

  // Computed InfoItems for cards
  rentalPeriodItems = computed<InfoItem[]>(() => {
    const booking = this.booking();
    if (!booking) return [];
    return [
      { icon: 'pi-calendar-plus', label: 'Geplante Abholung', value: this.formatDateOnly(booking.startDate) },
      { icon: 'pi-calendar-minus', label: 'Geplante Rückgabe', value: this.formatDateOnly(booking.endDate) }
    ];
  });

  lenderItems = computed<InfoItem[]>(() => {
    const booking = this.booking();
    if (!booking) return [];
    return [
      { icon: 'pi-user', label: 'Name', value: booking.lenderName },
      { icon: 'pi-id-card', label: 'Verleiher-ID', value: `#${booking.lenderId}` }
    ];
  });

  itemItems = computed<InfoItem[]>(() => {
    const booking = this.booking();
    if (!booking) return [];
    return [
      { icon: 'pi-box', label: 'Produkt', value: booking.productName },
      { icon: 'pi-hashtag', label: 'Inventarnummer', value: booking.itemInvNumber },
      { icon: 'pi-tag', label: 'Produkt-ID', value: `#${booking.productId}` }
    ];
  });

  datesItems = computed<InfoItem[]>(() => {
    const booking = this.booking();
    if (!booking) return [];
    const items: InfoItem[] = [];

    if (booking.proposedPickups) {
      const pickups = this.parseProposedPickups(booking.proposedPickups);
      const formattedPickups = pickups.map(p => this.formatDate(p)).join(', ');
      items.push({ icon: 'pi-calendar', label: 'Vorgeschlagene Abholtermine', value: formattedPickups });
    }
    if (booking.confirmedPickup) {
      items.push({ icon: 'pi-check-circle', label: 'Bestätigter Abholtermin', value: this.formatDate(booking.confirmedPickup) });
    }
    if (booking.distributionDate) {
      items.push({ icon: 'pi-sign-out', label: 'Tatsächliche Ausgabe', value: this.formatDate(booking.distributionDate) });
    }
    if (booking.returnDate) {
      items.push({ icon: 'pi-sign-in', label: 'Tatsächliche Rückgabe', value: this.formatDate(booking.returnDate) });
    }

    items.push({ icon: 'pi-clock', label: 'Erstellt am', value: this.formatDate(booking.createdAt) });
    items.push({ icon: 'pi-history', label: 'Zuletzt aktualisiert', value: this.formatDate(booking.updatedAt) });

    return items;
  });

  // Helper: Parse proposedPickups (kann JSON-Array oder komma-separiert sein)
  parseProposedPickups(proposedPickups: string): string[] {
    if (!proposedPickups) return [];

    try {
      // Versuche als JSON zu parsen
      const parsed = JSON.parse(proposedPickups);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      // Falls kein JSON, als komma-separiert behandeln
      return proposedPickups.split(',').map(p => p.trim()).filter(p => p);
    }
  }

  loadBookingDetails(id: number): void {
    this.isLoading.set(true);

    this.bookingService.getBookingById(id).subscribe({
      next: (booking) => {
        this.booking.set(booking);
        this.generateTimeline(booking);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Fehler beim Laden der Buchung:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Fehler',
          detail: 'Buchung konnte nicht geladen werden.'
        });
        this.isLoading.set(false);
        this.goBack();
      }
    });
  }

  openQrDialog(): void {
    this.showQrDialog.set(true);
  }

  closeQrDialog(): void {
    this.showQrDialog.set(false);
  }

  openPickupDialog(): void {
    this.showPickupDialog.set(true);
    this.selectedPickupDate.set(null);
    this.newProposedPickups.set([]);
  }

  closePickupDialog(): void {
    this.showPickupDialog.set(false);
    this.selectedPickupDate.set(null);
    this.newProposedPickups.set([]);
  }

  // User wählt einen der vorgeschlagenen Termine
  selectPickupDate(selectedPickup: string, newMessage: string = ''): void {
    const booking = this.booking();
    if (!booking) return;

    // Erstelle erweiterte Nachricht mit Präfix basierend auf proposalById
    const extendedMessage = this.buildExtendedMessage(booking, newMessage);

    this.isLoading.set(true);
    this.bookingService.selectPickup(booking.id, selectedPickup, extendedMessage).subscribe({
      next: (updatedBooking) => {
        this.booking.set(updatedBooking);
        this.generateTimeline(updatedBooking);
        this.messageService.add({
          severity: 'success',
          summary: 'Erfolg',
          detail: 'Abholtermin wurde ausgewählt'
        });
        this.closePickupDialog();
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Fehler beim Auswählen des Termins:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Fehler',
          detail: err.error?.message || 'Termin konnte nicht ausgewählt werden'
        });
        this.isLoading.set(false);
      }
    });
  }

  // User schlägt neue Termine vor (Gegenvorschlag)
  proposeNewPickups(newPickups: string[], newMessage: string = ''): void {
    const booking = this.booking();
    if (!booking || newPickups.length === 0) return;

    // Erstelle erweiterte Nachricht mit Präfix basierend auf proposalById
    const extendedMessage = this.buildExtendedMessage(booking, newMessage);

    this.isLoading.set(true);
    this.bookingService.proposePickups(booking.id, newPickups, extendedMessage).subscribe({
      next: (updatedBooking) => {
        this.booking.set(updatedBooking);
        this.generateTimeline(updatedBooking);
        this.messageService.add({
          severity: 'success',
          summary: 'Erfolg',
          detail: 'Neue Abholtermine wurden vorgeschlagen'
        });
        this.closePickupDialog();
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Fehler beim Vorschlagen neuer Termine:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Fehler',
          detail: err.error?.message || 'Termine konnten nicht vorgeschlagen werden'
        });
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Baut eine erweiterte Nachricht mit Präfixen für alte Nachrichten.
   * - Alte Nachrichten werden mit einem zusätzlichen Präfix versehen:
   *   "+" wenn proposalById === userId (User hat vorgeschlagen)
   *   "-" wenn proposalById === lenderId (Lender hat vorgeschlagen)
   * - Präfixe addieren sich bei jeder Bearbeitung (z.B. +, ++, +++, usw.)
   * - Neue Nachricht wird ohne Präfix am Ende hinzugefügt
   */
  private buildExtendedMessage(booking: Booking, newMessage: string): string {
    const oldMessage = booking.message || '';
    const trimmedNewMessage = newMessage?.trim() || '';
    const currentUserId = booking.userId;
    const currentLenderId = booking.lenderId;
    const lastProposalById = booking.proposalById;

    // Wenn weder alte noch neue Nachricht vorhanden
    if (!oldMessage && !trimmedNewMessage) {
      return '';
    }

    // Wenn keine alte Nachricht vorhanden ist, nur neue Nachricht zurückgeben
    if (!oldMessage) {
      return trimmedNewMessage;
    }

    // Bestimme das neue Präfix basierend auf dem letzten proposalById
    // Wenn proposalById === userId -> "+"
    // Wenn proposalById === lenderId -> "-"
    const newPrefix = lastProposalById === currentUserId ? '+' : '-';

    // Füge zusätzliches Präfix zu jeder Zeile der alten Nachricht hinzu
    const prefixedOldMessage = oldMessage
      .split('\n')
      .map(line => {
        const trimmedLine = line.trim();
        if (!trimmedLine) return '';
        // Füge das neue Präfix vor die bestehende Zeile (mit oder ohne altem Präfix)
        return `${newPrefix} ${line}`;
      })
      .filter(line => line)
      .join('\n');

    // Wenn neue Nachricht vorhanden ist, füge sie ohne Präfix hinzu
    if (trimmedNewMessage) {
      return `${prefixedOldMessage}\n${trimmedNewMessage}`;
    }

    return prefixedOldMessage;
  }

  generateTimeline(booking: Booking): void {
    const events: TimelineEvent[] = [];

    if (booking.createdAt) {
      events.push({
        status: 'Buchung erstellt',
        date: booking.createdAt,
        icon: 'pi pi-plus-circle',
        color: '#3b82f6',
        description: `Buchungsanfrage von ${booking.userName}`
      });
    }

    if (booking.status === 'CONFIRMED' || booking.status === 'PICKED_UP' || booking.status === 'RETURNED') {
      events.push({
        status: 'Bestätigt',
        date: booking.updatedAt,
        icon: 'pi pi-check-circle',
        color: '#10b981',
        description: `Von ${booking.lenderName} bestätigt`
      });
    }

    if (booking.status === 'PICKED_UP' || booking.status === 'RETURNED') {
      if (booking.distributionDate) {
        events.push({
          status: 'Ausgegeben',
          date: booking.distributionDate,
          icon: 'pi pi-sign-out',
          color: '#f59e0b',
          description: 'Gegenstand abgeholt'
        });
      }
    }

    if (booking.status === 'RETURNED') {
      if (booking.returnDate) {
        events.push({
          status: 'Zurückgegeben',
          date: booking.returnDate,
          icon: 'pi pi-sign-in',
          color: '#10b981',
          description: 'Gegenstand zurückgegeben'
        });
      }
    }

    if (booking.status === 'REJECTED') {
      events.push({
        status: 'Storniert',
        date: booking.updatedAt,
        icon: 'pi pi-times-circle',
        color: '#ef4444',
        description: `Von ${booking.lenderName} abgelehnt`
      });
    }

    if (booking.status === 'CANCELLED') {
      events.push({
        status: 'Abgelehnt',
        date: booking.updatedAt,
        icon: 'pi pi-ban',
        color: '#6b7280',
        description: 'Buchung storniert'
      });
    }

    if (booking.status === 'EXPIRED') {
      events.push({
        status: 'Abgelaufen',
        date: booking.updatedAt,
        icon: 'pi pi-exclamation-triangle',
        color: '#f59e0b',
        description: 'Nicht rechtzeitig abgeholt'
      });
    }

    this.timelineEvents.set(events);
  }

  getStatusSeverity(status: BookingStatus): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    const severityMap: Record<BookingStatus, 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast'> = {
      'PENDING': 'info',
      'CONFIRMED': 'success',
      'PICKED_UP': 'warn',
      'RETURNED': 'success',
      'REJECTED': 'danger',
      'EXPIRED': 'warn',
      'CANCELLED': 'secondary'
    };
    return severityMap[status] || 'info';
  }

  getStatusLabel(status: BookingStatus): string {
    const labelMap: Record<BookingStatus, string> = {
      'PENDING': 'Ausstehend',
      'CONFIRMED': 'Bestätigt',
      'PICKED_UP': 'Ausgeliehen',
      'RETURNED': 'Zurückgegeben',
      'REJECTED': 'Abgelehnt',
      'EXPIRED': 'Abgelaufen',
      'CANCELLED': 'Storniert'
    };
    return labelMap[status] || status;
  }

  formatDate(date: Date | string | null): string {
    if (!date) return '-';

    try {
      const d = typeof date === 'string' ? new Date(date) : date;
      if (Number.isNaN(d.getTime())) return '-';

      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');

      return `${day}.${month}.${year} ${hours}:${minutes}`;
    } catch {
      return '-';
    }
  }

  formatDateOnly(date: string | null): string {
    if (!date) return '-';

    try {
      const d = new Date(date);
      if (Number.isNaN(d.getTime())) return '-';

      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();

      return `${day}.${month}.${year}`;
    } catch {
      return '-';
    }
  }

  goBack(): void {
    this.router.navigate(['/user-dashboard/bookings']);
  }

  exportToPdf(): void {
    const booking = this.booking();
    if (!booking) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warnung',
        detail: 'Keine Buchungsdaten verfügbar zum Exportieren.'
      });
      return;
    }

    try {
      this.exportService.exportBookingAsPdf(booking);
      this.messageService.add({
        severity: 'success',
        summary: 'Erfolg',
        detail: 'PDF wurde erfolgreich heruntergeladen.'
      });
    } catch (error) {
      console.error('Fehler beim PDF-Export:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Fehler',
        detail: 'PDF konnte nicht erstellt werden.'
      });
    }
  }

  cancelBooking(): void {
    const booking = this.booking();
    if (!booking) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warnung',
        detail: 'Keine Buchung verfügbar zum Stornieren.'
      });
      return;
    }

    // ConfirmationService mit benutzerdefinierten Buttons
    this.confirmationService.confirm({
      message: `Möchten Sie die Buchung #${booking.id} wirklich stornieren? Diese Aktion kann nicht rückgängig gemacht werden.`,
      header: 'Buchung stornieren',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Stornieren',
      rejectLabel: 'Abbrechen',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary',
      accept: () => {
        this.isLoading.set(true);
        this.bookingService.deleteBooking(booking.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Erfolg',
              detail: 'Buchung wurde erfolgreich storniert.'
            });
            // Zurück zur Übersicht nach kurzer Verzögerung
            setTimeout(() => {
              this.goBack();
            }, 1500);
          },
          error: (err) => {
            console.error('Fehler beim Stornieren der Buchung:', err);
            this.messageService.add({
              severity: 'error',
              summary: 'Fehler',
              detail: err.error?.message || 'Buchung konnte nicht storniert werden.'
            });
            this.isLoading.set(false);
          }
        });
      }
    });
  }
}

