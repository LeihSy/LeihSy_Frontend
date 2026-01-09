import { Injectable, inject } from '@angular/core';
import jsPDF from 'jspdf';
import { Booking } from '../../../../models/booking.model';
import { AuthService } from '../../../../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserBookingExportService {
  private readonly authService = inject(AuthService);

  /**
   * Exportiert die Buchungsdetails als PDF
   * @param booking Die zu exportierende Buchung
   */
  exportBookingAsPdf(booking: Booking): void {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    let yPosition = margin;

    // Hole aktuellen User
    const currentUser = this.authService.currentUser();
    const userRoles = this.authService.getRoles();

    // Header
    pdf.setFillColor(59, 130, 246); // Blue-500
    pdf.rect(0, 0, pageWidth, 45, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Buchungsdetails', pageWidth / 2, 20, { align: 'center' });

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Buchungsnummer: #${booking.id}`, pageWidth / 2, 30, { align: 'center' });
    pdf.text(`Exportiert am: ${this.formatDateTime(new Date())}`, pageWidth / 2, 38, { align: 'center' });

    yPosition = 55;
    pdf.setTextColor(0, 0, 0);

    // Entleiher-Informationen
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Entleiher-Informationen', margin, yPosition);
    yPosition += 10;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');

    this.drawInfoRow(pdf, margin, yPosition, 'Name:', currentUser?.name || booking.userName || 'Unbekannt');
    yPosition += 7;

    this.drawInfoRow(pdf, margin, yPosition, 'User-ID:', currentUser?.id?.toString() || 'N/A');
    yPosition += 7;

    this.drawInfoRow(pdf, margin, yPosition, 'Rolle(n):', userRoles.join(', ') || 'Keine Rollen');
    yPosition += 7;

    this.drawInfoRow(pdf, margin, yPosition, 'Budget:', currentUser?.budget ? `${currentUser.budget.toFixed(2)} €` : 'N/A');
    yPosition += 12;

    // Trennlinie
    pdf.setDrawColor(220, 220, 220);
    pdf.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

    // Buchungsinformationen
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Buchungsinformationen', margin, yPosition);
    yPosition += 10;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');

    this.drawInfoRow(pdf, margin, yPosition, 'Status:', this.getStatusLabel(booking.status));
    yPosition += 7;

    this.drawInfoRow(pdf, margin, yPosition, 'Erstellt am:', this.formatDateTime(new Date(booking.createdAt)));
    yPosition += 7;

    if (booking.distributionDate) {
      this.drawInfoRow(pdf, margin, yPosition, 'Ausleihdatum:', this.formatDate(new Date(booking.distributionDate)));
      yPosition += 7;
    }

    if (booking.returnDate) {
      this.drawInfoRow(pdf, margin, yPosition, 'Rückgabedatum:', this.formatDate(new Date(booking.returnDate)));
      yPosition += 7;
    }

    this.drawInfoRow(pdf, margin, yPosition, 'Letztes Update:', this.formatDateTime(new Date(booking.updatedAt)));
    yPosition += 12;

    // Trennlinie
    pdf.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

    // Produkt-/Gegenstandsinformationen
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Gegenstand', margin, yPosition);
    yPosition += 10;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');

    this.drawInfoRow(pdf, margin, yPosition, 'Produktname:', booking.productName || 'N/A');
    yPosition += 7;

    this.drawInfoRow(pdf, margin, yPosition, 'Inventarnummer:', booking.itemInvNumber || 'N/A');
    yPosition += 7;

    this.drawInfoRow(pdf, margin, yPosition, 'Verleiher:', booking.lenderName || 'N/A');
    yPosition += 12;

    // Trennlinie
    pdf.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

    // Status-Historie / Timeline
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Status-Verlauf', margin, yPosition);
    yPosition += 10;

    const timelineEvents = this.generateTimelineEvents(booking);

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');

    timelineEvents.forEach((event, index) => {
      if (yPosition > pageHeight - margin - 30) {
        pdf.addPage();
        yPosition = margin;
      }

      // Icon/Punkt
      const color = this.hexToRgb(event.color);
      pdf.setFillColor(color.r, color.g, color.b);
      pdf.circle(margin + 3, yPosition - 1, 2, 'F');

      // Status
      pdf.setFont('helvetica', 'bold');
      pdf.text(event.status, margin + 8, yPosition);

      // Datum
      pdf.setFont('helvetica', 'normal');
      pdf.text(this.formatDateTime(new Date(event.date)), margin + 60, yPosition);

      yPosition += 5;

      // Beschreibung
      pdf.setTextColor(100, 100, 100);
      pdf.text(event.description, margin + 8, yPosition);
      pdf.setTextColor(0, 0, 0);

      yPosition += 8;

      // Verbindungslinie (außer beim letzten Element)
      if (index < timelineEvents.length - 1) {
        pdf.setDrawColor(220, 220, 220);
        pdf.line(margin + 3, yPosition - 5, margin + 3, yPosition);
      }
    });

    // Footer
    const footerY = pageHeight - 10;
    pdf.setFontSize(8);
    pdf.setTextColor(128, 128, 128);
    pdf.text('Generiert von LeihSy - Ausleihsystem', pageWidth / 2, footerY, { align: 'center' });
    pdf.text(`Buchung #${booking.id}`, pageWidth - margin, footerY, { align: 'right' });

    // Download
    const filename = `buchung_${booking.id}_${this.formatDateForFilename(new Date())}.pdf`;
    pdf.save(filename);
  }

  /**
   * Zeichnet eine Info-Zeile (Label: Wert)
   */
  private drawInfoRow(pdf: jsPDF, x: number, y: number, label: string, value: string): void {
    pdf.setFont('helvetica', 'bold');
    pdf.text(label, x, y);

    pdf.setFont('helvetica', 'normal');
    const labelWidth = pdf.getTextWidth(label);
    pdf.text(value, x + labelWidth + 3, y);
  }

  /**
   * Generiert Timeline-Events aus einer Buchung
   */
  private generateTimelineEvents(booking: Booking): Array<{status: string, date: string, color: string, description: string}> {
    const events: Array<{status: string, date: string, color: string, description: string}> = [];

    if (booking.createdAt) {
      events.push({
        status: 'Buchung erstellt',
        date: booking.createdAt,
        color: '#3b82f6',
        description: `Buchungsanfrage von ${booking.userName}`
      });
    }

    if (booking.status === 'CONFIRMED' || booking.status === 'PICKED_UP' || booking.status === 'RETURNED') {
      events.push({
        status: 'Bestätigt',
        date: booking.updatedAt,
        color: '#10b981',
        description: `Von ${booking.lenderName} bestätigt`
      });
    }

    if (booking.status === 'PICKED_UP' || booking.status === 'RETURNED') {
      if (booking.distributionDate) {
        events.push({
          status: 'Ausgegeben',
          date: booking.distributionDate,
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
          color: '#10b981',
          description: 'Gegenstand zurückgegeben'
        });
      }
    }

    if (booking.status === 'REJECTED') {
      events.push({
        status: 'Storniert',
        date: booking.updatedAt,
        color: '#ef4444',
        description: `Von ${booking.lenderName} abgelehnt`
      });
    }

    if (booking.status === 'CANCELLED') {
      events.push({
        status: 'Abgelehnt',
        date: booking.updatedAt,
        color: '#6b7280',
        description: 'Buchung storniert'
      });
    }

    if (booking.status === 'EXPIRED') {
      events.push({
        status: 'Abgelaufen',
        date: booking.updatedAt,
        color: '#f59e0b',
        description: 'Nicht rechtzeitig abgeholt'
      });
    }

    return events;
  }

  /**
   * Gibt das Label für einen Status zurück
   */
  private getStatusLabel(status: string): string {
    const labelMap: Record<string, string> = {
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

  /**
   * Konvertiert Hex-Farbe zu RGB
   */
  private hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  }

  /**
   * Formatiert Datum und Zeit (DD.MM.YYYY HH:MM)
   */
  private formatDateTime(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${day}.${month}.${year} ${hours}:${minutes}`;
  }

  /**
   * Formatiert nur das Datum (DD.MM.YYYY)
   */
  private formatDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}.${month}.${year}`;
  }

  /**
   * Formatiert Datum für Dateinamen (YYYYMMDD_HHMMSS)
   */
  private formatDateForFilename(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}${month}${day}_${hours}${minutes}${seconds}`;
  }
}

