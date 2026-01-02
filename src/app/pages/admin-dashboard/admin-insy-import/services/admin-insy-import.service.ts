import { Injectable, signal, inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { InsyImportService } from '../../../../services/insy-import.service';
import { InsyImportRequest, ImportStatus } from '../../../../models/insy-import.model';

@Injectable()
export class AdminInsyImportService {
  private readonly insyImportService = inject(InsyImportService);
  private readonly messageService = inject(MessageService);

  // State Signals
  importRequests = signal<InsyImportRequest[]>([]);
  statistics = signal<any>({
    totalPending: 0,
    totalApproved: 0,
    totalRejected: 0,
    newToday: 0
  });
  isLoading = signal(false);
  selectedRequests = signal<InsyImportRequest[]>([]);

  // Alle Import-Requests laden
  loadImportRequests(statusFilter?: ImportStatus | 'ALL'): void {
    this.isLoading.set(true);
    const filter = statusFilter === 'ALL' ? undefined : statusFilter;

    this.insyImportService.getAllImportRequests(filter).subscribe({
      next: (requests) => {
        this.importRequests.set(requests);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Fehler beim Laden der Import-Requests:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Fehler',
          detail: 'Import-Requests konnten nicht geladen werden'
        });
        this.isLoading.set(false);
      }
    });
  }

  // Statistiken laden
  loadStatistics(): void {
    this.insyImportService.getStatistics().subscribe({
      next: (stats) => {
        // Backend gibt möglicherweise ein anderes Format zurück
        // Passe hier an wenn nötig
        this.statistics.set({
          totalPending: stats.pending || stats.PENDING || 0,
          totalApproved: stats.approved || stats.APPROVED || 0,
          totalRejected: stats.rejected || stats.REJECTED || 0,
          newToday: stats.newToday || stats.today || 0
        });
      },
      error: (error) => {
        console.error('Fehler beim Laden der Statistiken:', error);
        // Statistiken sind nicht kritisch, zeige keinen Error-Toast
      }
    });
  }

  // Einzelnen Import genehmigen
  approveImport(request: InsyImportRequest): void {
    this.insyImportService.approveImport(request.id).subscribe({
      next: (updated) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Genehmigt',
          detail: `Import "${request.name}" wurde genehmigt`
        });
        this.refreshData();
      },
      error: (error) => {
        console.error('Fehler beim Genehmigen:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Fehler',
          detail: 'Import konnte nicht genehmigt werden'
        });
      }
    });
  }

  // Einzelnen Import ablehnen
  rejectImport(request: InsyImportRequest, reason?: string): void {
    this.insyImportService.rejectImport(request.id, { reason }).subscribe({
      next: (updated) => {
        this.messageService.add({
          severity: 'warn',
          summary: 'Abgelehnt',
          detail: `Import "${request.name}" wurde abgelehnt`
        });
        this.refreshData();
      },
      error: (error) => {
        console.error('Fehler beim Ablehnen:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Fehler',
          detail: 'Import konnte nicht abgelehnt werden'
        });
      }
    });
  }

  // Mehrere Imports genehmigen
  bulkApprove(requests: InsyImportRequest[]): void {
    const ids = requests.map(r => r.id);
    this.insyImportService.bulkApprove(ids).subscribe({
      next: (updated) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Genehmigt',
          detail: `${requests.length} Imports wurden genehmigt`
        });
        this.selectedRequests.set([]);
        this.refreshData();
      },
      error: (error) => {
        console.error('Fehler beim Bulk-Genehmigen:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Fehler',
          detail: 'Imports konnten nicht genehmigt werden'
        });
      }
    });
  }

  // Mehrere Imports ablehnen
  bulkReject(requests: InsyImportRequest[], reason?: string): void {
    const ids = requests.map(r => r.id);
    this.insyImportService.bulkReject(ids, reason).subscribe({
      next: (updated) => {
        this.messageService.add({
          severity: 'warn',
          summary: 'Abgelehnt',
          detail: `${requests.length} Imports wurden abgelehnt`
        });
        this.selectedRequests.set([]);
        this.refreshData();
      },
      error: (error) => {
        console.error('Fehler beim Bulk-Ablehnen:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Fehler',
          detail: 'Imports konnten nicht abgelehnt werden'
        });
      }
    });
  }

  // Neue Imports von InSy holen (Mock)
  refreshImports(): void {
    this.isLoading.set(true);
    this.insyImportService.refreshImports().subscribe({
      next: (newImports) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Aktualisiert',
          detail: `${newImports.length} neue Imports geladen`
        });
        this.refreshData();
      },
      error: (error) => {
        console.error('Fehler beim Aktualisieren:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Fehler',
          detail: 'Imports konnten nicht aktualisiert werden'
        });
        this.isLoading.set(false);
      }
    });
  }

  // Import löschen (mit Bestätigung)
  confirmDeleteImport(request: InsyImportRequest): void {
    // Diese Methode wird vom Component aufgerufen nach Bestätigung
    this.deleteImport(request);
  }

  // Import tatsächlich löschen
  deleteImport(request: InsyImportRequest): void {
    this.insyImportService.deleteImportRequest(request.id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Gelöscht',
          detail: `Import "${request.name}" wurde gelöscht`
        });
        this.refreshData();
      },
      error: (error) => {
        console.error('Fehler beim Löschen:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Fehler',
          detail: 'Import konnte nicht gelöscht werden'
        });
      }
    });
  }

  // Daten neu laden
  private refreshData(): void {
    this.loadImportRequests();
    this.loadStatistics();
  }
}
