import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { InfoItemComponent } from '../info-item/info-item.component';
import { Booking } from '../../../models/booking.model';

@Component({
  selector: 'app-appointments-and-data',
  standalone: true,
  imports: [CommonModule, CardModule, InfoItemComponent],
  template: `
    <p-card
      header="Termine & Daten"
      class="shadow-sm border border-gray-200 overflow-hidden"
      [pt]="{
        header: { class: 'bg-gradient-to-br from-gray-50 to-gray-100 border-b-2 border-gray-200 font-semibold text-[#253359] p-4' }
      }">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8 p-2">
        @if (booking.proposedPickups) {
          <app-info-item
            icon="pi pi-calendar"
            iconColor="text-blue-700"
            label="Vorgeschlagene Abholtermine"
            [value]="formatProposedPickups(booking.proposedPickups)">
          </app-info-item>
        }
        @if (booking.confirmedPickup) {
          <app-info-item
            icon="pi pi-check-circle"
            iconColor="text-emerald-600"
            label="Bestätigter Abholtermin"
            [value]="formatDateTime(booking.confirmedPickup)">
          </app-info-item>
        }
        @if (booking.distributionDate) {
          <app-info-item
            icon="pi pi-sign-out"
            iconColor="text-orange-600"
            label="Tatsächliche Ausgabe"
            [value]="formatDateTime(booking.distributionDate)">
          </app-info-item>
        }
        @if (booking.returnDate) {
          <app-info-item
            icon="pi pi-sign-in"
            iconColor="text-emerald-600"
            label="Tatsächliche Rückgabe"
            [value]="formatDateTime(booking.returnDate)">
          </app-info-item>
        }

        <div class="sm:col-span-2 border-t border-gray-100 my-2"></div>

        <app-info-item
          icon="pi pi-clock"
          iconColor="text-slate-400"
          label="Erstellt am"
          [value]="formatDateTime(booking.createdAt)">
        </app-info-item>
        <app-info-item
          icon="pi pi-history"
          iconColor="text-slate-400"
          label="Zuletzt aktualisiert"
          [value]="formatDateTime(booking.updatedAt)">
        </app-info-item>
      </div>
    </p-card>
  `
})
export class AppointmentsAndDataComponent {
  @Input({ required: true }) booking!: Booking;
  @Input({ required: true }) formatDateTime!: (date: Date | string | null) => string;

  formatProposedPickups(proposedPickups: string): string {
    if (!proposedPickups) return '-';

    let dates: string[] = [];

    // Versuche zuerst, als JSON-Array zu parsen
    try {
      const parsed = JSON.parse(proposedPickups);
      if (Array.isArray(parsed)) {
        dates = parsed.map(d => String(d).trim()).filter(Boolean);
      } else {
        dates = [String(parsed)];
      }
    } catch {
      // Falls JSON.parse fehlschlägt, splitte nach Komma oder Semikolon
      dates = proposedPickups.split(/[,;]/).map(d => d.trim()).filter(Boolean);
    }

    // Formatiere jedes Datum
    const formattedDates = dates.map(dateStr => {
      try {
        const date = new Date(dateStr);
        if (Number.isNaN(date.getTime())) {
          return dateStr; // Falls kein gültiges Datum, Original zurückgeben
        }
        return date.toLocaleString('de-DE', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch {
        return dateStr;
      }
    });

    return formattedDates.join(', ');
  }
}

