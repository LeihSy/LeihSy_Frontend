import { Injectable } from '@angular/core';
import { StatusStat } from '../../../../components/stat-components/stats-table/stats-table.component';
import { ProductRanking } from '../../../../components/stat-components/ranking-list/ranking-list.component';
import jsPDF from 'jspdf';

export interface StatisticsExportData {
  totalBookings: number;
  statusStats: StatusStat[];
  topProducts: ProductRanking[];
  exportDate: Date;
  dateRange?: { start: Date; end: Date };
}

@Injectable({
  providedIn: 'root'
})
export class BookingStatisticsExportService {

  /**
   * Exportiert die Buchungsstatistiken als HTML-Datei
   * @param data Die zu exportierenden Statistikdaten
   */
  exportAsHtml(data: StatisticsExportData): void {
    const htmlContent = this.generateHtmlContent(data);
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });

    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.href = url;
    link.download = `buchungsstatistiken_${this.formatDateForFilename(data.exportDate)}.html`;

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Exportiert die Buchungsstatistiken als PDF-Datei
   * @param data Die zu exportierenden Statistikdaten
   */
  exportAsPdf(data: StatisticsExportData): void {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    let yPosition = margin;

    // Header
    pdf.setFillColor(0, 0, 128);
    pdf.rect(0, 0, pageWidth, 40, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Buchungsstatistiken', pageWidth / 2, 20, { align: 'center' });

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    const dateRangeText = data.dateRange
      ? `Zeitraum: ${this.formatDate(data.dateRange.start)} - ${this.formatDate(data.dateRange.end)}`
      : 'Alle Buchungen';
    pdf.text(dateRangeText, pageWidth / 2, 28, { align: 'center' });
    pdf.text(`Exportiert am: ${this.formatDateTime(data.exportDate)}`, pageWidth / 2, 35, { align: 'center' });

    yPosition = 50;
    pdf.setTextColor(0, 0, 0);

    // Übersichtskarten
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Übersicht', margin, yPosition);
    yPosition += 10;

    const cardWidth = (pageWidth - 3 * margin) / 3;
    this.drawStatCard(pdf, margin, yPosition, cardWidth, 'Gesamt Buchungen', data.totalBookings.toString());
    this.drawStatCard(pdf, margin + cardWidth + margin / 2, yPosition, cardWidth, 'Verschiedene Produkte', data.topProducts.length.toString());
    this.drawStatCard(pdf, margin + 2 * (cardWidth + margin / 2), yPosition, cardWidth, 'Top Produkt', data.topProducts.length > 0 ? data.topProducts[0].count.toString() : '0');
    yPosition += 30;

    // Status-Statistiken
    if (yPosition + 60 > pageHeight - margin) {
      pdf.addPage();
      yPosition = margin;
    }

    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Buchungen nach Status', margin, yPosition);
    yPosition += 10;

    // Status-Tabelle
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Status', margin, yPosition);
    pdf.text('Anzahl', pageWidth / 2, yPosition);
    pdf.text('Anteil', pageWidth - margin - 30, yPosition);
    yPosition += 7;
    pdf.setFont('helvetica', 'normal');

    data.statusStats.forEach((stat, index) => {
      if (yPosition > pageHeight - margin - 20) {
        pdf.addPage();
        yPosition = margin;
      }

      const percentage = data.totalBookings > 0 ? (stat.count / data.totalBookings * 100).toFixed(1) : '0.0';

      // Farbpunkt
      pdf.setFillColor(this.hexToRgb(stat.color).r, this.hexToRgb(stat.color).g, this.hexToRgb(stat.color).b);
      pdf.circle(margin + 2, yPosition - 1.5, 2, 'F');

      pdf.text(stat.statusName, margin + 7, yPosition);
      pdf.text(stat.count.toString(), pageWidth / 2, yPosition);
      pdf.text(`${percentage}%`, pageWidth - margin - 30, yPosition);
      yPosition += 7;
    });

    yPosition += 10;

    // Top 10 Produkte
    if (yPosition + 60 > pageHeight - margin) {
      pdf.addPage();
      yPosition = margin;
    }

    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Top 10 ausgeliehene Produkte', margin, yPosition);
    yPosition += 10;

    // Produkt-Tabelle
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Rang', margin, yPosition);
    pdf.text('Produktname', margin + 20, yPosition);
    pdf.text('Anzahl', pageWidth - margin - 30, yPosition);
    yPosition += 7;
    pdf.setFont('helvetica', 'normal');

    data.topProducts.forEach((product, index) => {
      if (yPosition > pageHeight - margin - 20) {
        pdf.addPage();
        yPosition = margin;
      }

      const rank = `#${index + 1}`;
      pdf.text(rank, margin, yPosition);

      const maxNameLength = 50;
      const productName = product.productName.length > maxNameLength
        ? product.productName.substring(0, maxNameLength) + '...'
        : product.productName;
      pdf.text(productName, margin + 20, yPosition);
      pdf.text(product.count.toString(), pageWidth - margin - 30, yPosition);
      yPosition += 7;
    });

    // Footer
    const footerY = pageHeight - 10;
    pdf.setFontSize(8);
    pdf.setTextColor(128, 128, 128);
    pdf.text('Generiert von LeihSy - Ausleihsystem', pageWidth / 2, footerY, { align: 'center' });

    // Download
    const filename = `buchungsstatistiken_${this.formatDateForFilename(data.exportDate)}.pdf`;
    pdf.save(filename);
  }

  /**
   * Zeichnet eine Statistik-Karte auf dem PDF
   */
  private drawStatCard(pdf: jsPDF, x: number, y: number, width: number, label: string, value: string): void {
    pdf.setDrawColor(200, 200, 200);
    pdf.setFillColor(248, 249, 250);
    pdf.roundedRect(x, y, width, 20, 3, 3, 'FD');

    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 128);
    pdf.text(value, x + width / 2, y + 8, { align: 'center' });

    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(107, 114, 128);
    pdf.text(label, x + width / 2, y + 15, { align: 'center' });

    pdf.setTextColor(0, 0, 0);
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
   * Generiert den vollständigen HTML-Inhalt für den Export
   */
  private generateHtmlContent(data: StatisticsExportData): string {
    return `<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Buchungsstatistiken - ${this.formatDate(data.exportDate)}</title>
    <style>
        ${this.getStyles()}
    </style>
</head>
<body>
    <div class="container">
        <header class="header">
            <h1>📊 Buchungsstatistiken</h1>
            <p class="subtitle">Auslastung und Analysen Ihrer Buchungen</p>
            ${data.dateRange ? `<p class="date-range">Zeitraum: ${this.formatDate(data.dateRange.start)} - ${this.formatDate(data.dateRange.end)}</p>` : '<p class="date-range">Alle Buchungen</p>'}
            <p class="export-info">Exportiert am: ${this.formatDateTime(data.exportDate)}</p>
        </header>

        <section class="overview-cards">
            <div class="stat-card">
                <div class="stat-icon">📈</div>
                <div class="stat-content">
                    <div class="stat-value">${data.totalBookings}</div>
                    <div class="stat-label">Gesamt Buchungen</div>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-icon">📦</div>
                <div class="stat-content">
                    <div class="stat-value">${data.topProducts.length}</div>
                    <div class="stat-label">Verschiedene Produkte</div>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-icon">⭐</div>
                <div class="stat-content">
                    <div class="stat-value">${data.topProducts.length > 0 ? data.topProducts[0].count : 0}</div>
                    <div class="stat-label">Top Produkt Ausleihen</div>
                </div>
            </div>
        </section>

        <section class="chart-section">
            <h2>📊 Buchungen nach Status</h2>

            <div class="status-chart">
                ${this.generateStatusBars(data.statusStats, data.totalBookings)}
            </div>

            <table class="stats-table">
                <thead>
                    <tr>
                        <th>Status</th>
                        <th class="text-center">Anzahl</th>
                        <th class="text-center">Anteil</th>
                    </tr>
                </thead>
                <tbody>
                    ${this.generateStatusTableRows(data.statusStats, data.totalBookings)}
                </tbody>
            </table>
        </section>

        <section class="chart-section">
            <h2>⭐ Top 10 ausgeliehene Produkte</h2>

            <div class="product-chart">
                ${this.generateProductBars(data.topProducts)}
            </div>

            <table class="ranking-table">
                <thead>
                    <tr>
                        <th class="text-center">Rang</th>
                        <th>Produktname</th>
                        <th class="text-center">Anzahl Ausleihen</th>
                    </tr>
                </thead>
                <tbody>
                    ${this.generateProductTableRows(data.topProducts)}
                </tbody>
            </table>
        </section>

        <footer class="footer">
            <p>Generiert von LeihSy - Ausleihsystem</p>
            <p class="footer-note">© ${new Date().getFullYear()} - Alle Rechte vorbehalten</p>
        </footer>
    </div>
</body>
</html>`;
  }

  /**
   * Generiert die Balkendiagramm-Darstellung für Status-Statistiken
   */
  private generateStatusBars(stats: StatusStat[], totalBookings: number): string {
    if (stats.length === 0) {
      return '<p class="empty-message">Keine Status-Daten vorhanden</p>';
    }

    const maxCount = Math.max(...stats.map(s => s.count));

    return stats.map(stat => {
      const percentage = totalBookings > 0 ? (stat.count / totalBookings * 100) : 0;
      const barWidth = maxCount > 0 ? (stat.count / maxCount * 100) : 0;

      return `
        <div class="bar-item">
          <div class="bar-label">
            <span class="status-dot" style="background-color: ${stat.color}"></span>
            <span>${stat.statusName}</span>
          </div>
          <div class="bar-container">
            <div class="bar-fill" style="width: ${barWidth}%; background-color: ${stat.color}">
              <span class="bar-value">${stat.count} (${percentage.toFixed(1)}%)</span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  /**
   * Generiert Tabellenzeilen für Status-Statistiken
   */
  private generateStatusTableRows(stats: StatusStat[], totalBookings: number): string {
    if (stats.length === 0) {
      return '<tr><td colspan="3" class="text-center empty-message">Keine Status-Daten vorhanden</td></tr>';
    }

    return stats.map(stat => {
      const percentage = totalBookings > 0 ? (stat.count / totalBookings * 100) : 0;

      return `
        <tr>
          <td>
            <span class="status-dot" style="background-color: ${stat.color}"></span>
            ${stat.statusName}
          </td>
          <td class="text-center">${stat.count}</td>
          <td class="text-center">${percentage.toFixed(1)}%</td>
        </tr>
      `;
    }).join('');
  }

  /**
   * Generiert die Balkendiagramm-Darstellung für Top-Produkte
   */
  private generateProductBars(products: ProductRanking[]): string {
    if (products.length === 0) {
      return '<p class="empty-message">Keine Produkt-Daten vorhanden</p>';
    }

    const maxCount = Math.max(...products.map(p => p.count));
    const colors = [
      '#000080', '#0000a0', '#0040c0', '#0060e0', '#4080ff',
      '#60a0ff', '#80c0ff', '#a0d0ff', '#c0e0ff', '#e0f0ff'
    ];

    return products.map((product, index) => {
      const barWidth = maxCount > 0 ? (product.count / maxCount * 100) : 0;
      const color = colors[index % colors.length];

      return `
        <div class="bar-item">
          <div class="bar-label">
            <span class="product-rank">#${index + 1}</span>
            <span>${product.productName}</span>
          </div>
          <div class="bar-container">
            <div class="bar-fill" style="width: ${barWidth}%; background-color: ${color}">
              <span class="bar-value">${product.count}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  /**
   * Generiert Tabellenzeilen für Top-Produkte
   */
  private generateProductTableRows(products: ProductRanking[]): string {
    if (products.length === 0) {
      return '<tr><td colspan="3" class="text-center empty-message">Keine Produkt-Daten vorhanden</td></tr>';
    }

    return products.map((product, index) => {
      const rankClass = index < 3 ? `rank-${index + 1}` : '';

      return `
        <tr>
          <td class="text-center">
            <span class="rank-badge ${rankClass}">#${index + 1}</span>
          </td>
          <td>${product.productName}</td>
          <td class="text-center"><strong>${product.count}</strong></td>
        </tr>
      `;
    }).join('');
  }

  /**
   * CSS-Styles für die exportierte HTML-Datei
   */
  private getStyles(): string {
    return `
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            padding: 2rem;
            line-height: 1.6;
            color: #333;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }

        .header {
            background: linear-gradient(135deg, #000080 0%, #0040c0 100%);
            color: white;
            padding: 3rem 2rem;
            text-align: center;
        }

        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 0.5rem;
            font-weight: 700;
        }

        .subtitle {
            font-size: 1.2rem;
            opacity: 0.95;
            margin-bottom: 0.5rem;
        }

        .date-range {
            font-size: 1rem;
            opacity: 0.9;
            margin-bottom: 0.5rem;
            font-weight: 500;
        }

        .export-info {
            font-size: 0.95rem;
            opacity: 0.85;
            margin-top: 1rem;
            font-style: italic;
        }

        .overview-cards {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1.5rem;
            padding: 2rem;
            background: #f8f9fa;
        }

        .stat-card {
            background: white;
            border-radius: 8px;
            padding: 1.5rem;
            display: flex;
            align-items: center;
            gap: 1rem;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
            transition: transform 0.2s;
        }

        .stat-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
        }

        .stat-icon {
            font-size: 3rem;
        }

        .stat-value {
            font-size: 2.5rem;
            font-weight: 700;
            color: #000080;
        }

        .stat-label {
            font-size: 0.95rem;
            color: #666;
            margin-top: 0.25rem;
        }

        .chart-section {
            padding: 2rem;
            border-top: 2px solid #f0f0f0;
        }

        .chart-section h2 {
            color: #000080;
            font-size: 1.8rem;
            margin-bottom: 1.5rem;
            padding-bottom: 0.5rem;
            border-bottom: 3px solid #000080;
        }

        .status-chart,
        .product-chart {
            background: #f8f9fa;
            padding: 1.5rem;
            border-radius: 8px;
            margin-bottom: 2rem;
        }

        .bar-item {
            margin-bottom: 1rem;
        }

        .bar-label {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-bottom: 0.5rem;
            font-weight: 500;
        }

        .status-dot {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            display: inline-block;
        }

        .product-rank {
            background: #000080;
            color: white;
            padding: 0.2rem 0.5rem;
            border-radius: 4px;
            font-size: 0.85rem;
            font-weight: 600;
        }

        .bar-container {
            background: #e9ecef;
            border-radius: 6px;
            height: 36px;
            overflow: hidden;
            position: relative;
        }

        .bar-fill {
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: flex-end;
            padding-right: 0.75rem;
            transition: width 0.3s ease;
            min-width: 60px;
        }

        .bar-value {
            color: white;
            font-weight: 600;
            font-size: 0.9rem;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        }

        .stats-table,
        .ranking-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 1.5rem;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .stats-table thead,
        .ranking-table thead {
            background: #000080;
            color: white;
        }

        .stats-table th,
        .ranking-table th {
            padding: 1rem;
            text-align: left;
            font-weight: 600;
        }

        .stats-table td,
        .ranking-table td {
            padding: 0.875rem 1rem;
            border-bottom: 1px solid #e9ecef;
        }

        .stats-table tbody tr:hover,
        .ranking-table tbody tr:hover {
            background: #f8f9fa;
        }

        .stats-table tbody tr:last-child td,
        .ranking-table tbody tr:last-child td {
            border-bottom: none;
        }

        .text-center {
            text-align: center;
        }

        .rank-badge {
            display: inline-block;
            padding: 0.3rem 0.6rem;
            border-radius: 4px;
            font-weight: 600;
            background: #e9ecef;
            color: #495057;
        }

        .rank-badge.rank-1 {
            background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
            color: #000;
            font-size: 1.1rem;
        }

        .rank-badge.rank-2 {
            background: linear-gradient(135deg, #c0c0c0 0%, #e8e8e8 100%);
            color: #000;
            font-size: 1.05rem;
        }

        .rank-badge.rank-3 {
            background: linear-gradient(135deg, #cd7f32 0%, #e9a76f 100%);
            color: #fff;
        }

        .empty-message {
            color: #6c757d;
            font-style: italic;
            padding: 2rem;
            text-align: center;
        }

        .footer {
            background: #f8f9fa;
            padding: 2rem;
            text-align: center;
            color: #6c757d;
            border-top: 2px solid #e9ecef;
        }

        .footer p {
            margin: 0.5rem 0;
        }

        .footer-note {
            font-size: 0.85rem;
            opacity: 0.8;
        }

        @media print {
            body {
                background: white;
                padding: 0;
            }

            .container {
                box-shadow: none;
            }

            .stat-card:hover {
                transform: none;
            }
        }

        @media (max-width: 768px) {
            .header h1 {
                font-size: 2rem;
            }

            .overview-cards {
                grid-template-columns: 1fr;
            }

            .stat-value {
                font-size: 2rem;
            }
        }
    `;
  }

  /**
   * Formatiert ein Datum für den Dateinamen (YYYY-MM-DD_HH-mm)
   */
  private formatDateForFilename(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}_${hours}-${minutes}`;
  }

  /**
   * Formatiert ein Datum für die Anzeige (DD.MM.YYYY)
   */
  private formatDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}.${month}.${year}`;
  }

  /**
   * Formatiert ein Datum mit Uhrzeit für die Anzeige (DD.MM.YYYY HH:mm)
   */
  private formatDateTime(date: Date): string {
    const dateStr = this.formatDate(date);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${dateStr} ${hours}:${minutes}`;
  }
}

