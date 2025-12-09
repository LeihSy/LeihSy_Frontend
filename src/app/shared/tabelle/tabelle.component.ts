import { Component, Input, Output, EventEmitter, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

export interface ColumnDef {
  field: string; // Feldname im Datensatz
  header: string; // Spaltenüberschrift
  sortable?: boolean;
  width?: string;
  type?: 'text' | 'date' | 'datetime' | 'status' | 'badge' | 'custom' | 'number' | 'currency';
  template?: TemplateRef<any>; // optional: TemplateRef für benutzerdefinierte Zellen
  class?: string;
  pipe?: any; // optional: Custom Pipe für Formatierung
}

@Component({
  selector: 'app-tabelle',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, TooltipModule],
  templateUrl: './tabelle.component.html',
  styleUrls: ['./tabelle.component.scss']
})
export class TabelleComponent {
  @Input() columns: ColumnDef[] = [];
  @Input() data: any[] = [];
  @Input() loading = false;
  @Input() rows = 10;
  @Input() showActions = false; // action column sichtbar
  @Input() responsiveLayout: 'scroll' | 'stack' = 'scroll';
  @Input() paginator = true;
  @Input() scrollable = true;
  @Input() scrollHeight = '600px';
  @Input() emptyMessage = 'Keine Einträge gefunden.';
  @Input() showEditButton = true;
  @Input() showDeleteButton = true;
  @Input() editButtonIcon = 'pi pi-pencil';
  @Input() deleteButtonIcon = 'pi pi-trash';
  @Input() editButtonTooltip = 'Bearbeiten';
  @Input() deleteButtonTooltip = 'Löschen';
  @Input() showPageLinks = true; // Zeigt Seitenzahlen (Kreise)
  @Input() rowsPerPageOptions: number[] = []; // Leer = kein Dropdown
  @Input() showCurrentPageReport = false; // Kein "Zeige x bis y von z"
  @Input() currentPageReportTemplate = '';

  @Output() edit = new EventEmitter<any>();
  @Output() remove = new EventEmitter<any>();
  @Output() rowSelect = new EventEmitter<any>();

  trackByIndex(index: number, _item: any): number {
    return index;
  }

  onRowSelect(row: any): void {
    this.rowSelect.emit(row);
  }

  onEdit(row: any): void {
    this.edit.emit(row);
  }

  onRemove(row: any): void {
    this.remove.emit(row);
  }

  getCellValue(row: any, col: ColumnDef): any {
    return row[col.field];
  }

  getStatusClass(value: any): string {
    if (!value) return '';

    const statusLower = value.toString().toLowerCase();

    // Für verschiedene Status-Typen
    const statusMap: Record<string, string> = {
      'deleted': 'status-deleted',
      'storniert': 'status-deleted',
      'cancelled': 'status-deleted',
      'active': 'status-active',
      'aktiv': 'status-active',
      'pending': 'status-pending',
      'ausstehend': 'status-pending',
      'confirmed': 'status-confirmed',
      'bestätigt': 'status-confirmed',
      'completed': 'status-completed',
      'abgeschlossen': 'status-completed',
      'available': 'status-available',
      'verfügbar': 'status-available',
      'borrowed': 'status-borrowed',
      'ausgeliehen': 'status-borrowed',
      'overdue': 'status-overdue',
      'überfällig': 'status-overdue'
    };

    return statusMap[statusLower] || 'status-default';
  }

  formatValue(value: any, type?: string): string {
    if (value === null || value === undefined) return '-';

    switch (type) {
      case 'date':
        return this.formatDate(value, false);
      case 'datetime':
        return this.formatDate(value, true);
      case 'number':
        return typeof value === 'number' ? value.toLocaleString('de-DE') : value.toString();
      case 'currency':
        return typeof value === 'number'
          ? value.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })
          : value.toString();
      default:
        return value.toString();
    }
  }

  private formatDate(value: any, includeTime: boolean): string {
    if (!value) return '-';

    try {
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return '-';

      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();

      if (includeTime) {
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${day}.${month}.${year} ${hours}:${minutes}`;
      }

      return `${day}.${month}.${year}`;
    } catch {
      return '-';
    }
  }
}

