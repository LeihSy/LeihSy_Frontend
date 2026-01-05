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
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, TooltipModule],
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent {
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
  @Input() rowClickable = false; // Macht Zeilen anklickbar

  @Output() edit = new EventEmitter<any>();
  @Output() remove = new EventEmitter<any>();
  @Output() rowSelect = new EventEmitter<any>();


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

    const statusMap: Record<string, string> = {
      'deleted': 'bg-red-100 text-red-800 border border-red-300',
      'storniert': 'bg-red-100 text-red-800 border border-red-300',
      'cancelled': 'bg-red-100 text-red-800 border border-red-300',
      'active': 'bg-green-100 text-green-800 border border-green-300',
      'aktiv': 'bg-green-100 text-green-800 border border-green-300',
      'pending': 'bg-yellow-100 text-yellow-800 border border-yellow-300',
      'ausstehend': 'bg-yellow-100 text-yellow-800 border border-yellow-300',
      'confirmed': 'bg-blue-100 text-blue-800 border border-blue-300',
      'bestätigt': 'bg-blue-100 text-blue-800 border border-blue-300',
      'completed': 'bg-indigo-100 text-indigo-800 border border-indigo-300',
      'abgeschlossen': 'bg-indigo-100 text-indigo-800 border border-indigo-300',
      'available': 'bg-emerald-100 text-emerald-800 border border-emerald-300',
      'verfügbar': 'bg-emerald-100 text-emerald-800 border border-emerald-300',
      'borrowed': 'bg-orange-100 text-orange-800 border border-orange-300',
      'ausgeliehen': 'bg-orange-100 text-orange-800 border border-orange-300',
      'overdue': 'bg-red-100 text-red-900 border border-red-400',
      'überfällig': 'bg-red-100 text-red-900 border border-red-400'
    };

    return statusMap[statusLower] || 'bg-gray-200 text-gray-700 border border-gray-300';
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

