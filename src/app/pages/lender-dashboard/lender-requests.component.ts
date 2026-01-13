import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { BookingService } from '../../services/booking.service';
import { TooltipModule } from 'primeng/tooltip';

interface LenderRequest {
  id: number;
  studentName: string;
  studentId: string;
  productName: string;
  inventoryNumber: string;
  campus: string;
  fromDate: string;
  toDate: string;
  status: string; 
  message?: string;
  declineReason?: string;
}

@Component({
  selector: 'app-lender-requests',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ToastModule, ButtonModule, DialogModule,
    TagModule, InputTextModule, SelectModule, TableModule,TooltipModule
  ],
  providers: [MessageService],
  templateUrl: './lender-requests.component.html'
})
export class LenderRequestsComponent implements OnInit {
  
  // Services injecten
  private bookingService = inject(BookingService);
  private messageService = inject(MessageService);

  // UI State
  searchQuery = '';
  campusFilter = 'all';
  sortBy: 'newest' | 'oldest' | 'student' = 'newest';
  tab: 'pending' | 'done' = 'pending';

  requests: LenderRequest[] = []; 

  // Optionen für Dropdowns
  campusOptions = [
    { label: 'Alle Campus', value: 'all' },
    { label: 'ES', value: 'Esslingen' },
    { label: 'GO', value: 'Göppingen' }
  ];
  sortOptions = [
    { label: 'Neueste zuerst', value: 'newest' },
    { label: 'Älteste zuerst', value: 'oldest' },
    { label: 'Student A-Z', value: 'student' }
  ];

  // Dialog State
  isDeclineDialogOpen = false;
  selectedRequest: LenderRequest | null = null;
  declineReason = '';
  declineError = '';

  ngOnInit() {
    this.loadData();
  }

  // --- DATEN LADEN ---
  loadData() {
    this.bookingService.getPendingBookings().subscribe({
      next: (data: any[]) => {
        this.requests = data.map(b => ({
          id: b.id,
          studentName: b.userName || b.user?.name || 'Unbekannt',
          studentId: b.user?.uniqueId || b.userId?.toString() || '', 
          productName: b.productName || b.item?.product?.name,
          inventoryNumber: b.invNumber || b.item?.invNumber,
          campus: 'Esslingen', 
          fromDate: b.startDate,
          toDate: b.endDate,
          status: b.status || 'PENDING',
          message: b.message
        }));
      },
      error: (err: any) => console.error('Fehler beim Laden', err)
    });
  }


  pendingCount(): number {
    return this.requests.filter(r => r.status === 'PENDING').length;
  }

  filteredPending(): LenderRequest[] {
    return this.applyAll(this.requests.filter(r => r.status === 'PENDING'));
  }

  filteredDone(): LenderRequest[] {
    return this.applyAll(this.requests.filter(r => r.status !== 'PENDING'));
  }

  private applyAll(list: LenderRequest[]): LenderRequest[] {
    const q = this.searchQuery.toLowerCase().trim();
    let res = [...list];

    // Suche
    if (q) {
      res = res.filter(r =>
        (r.studentName && r.studentName.toLowerCase().includes(q)) ||
        (r.productName && r.productName.toLowerCase().includes(q)) ||
        (r.inventoryNumber && r.inventoryNumber.toLowerCase().includes(q))
      );
    }

    // Filter Campus
    if (this.campusFilter !== 'all') {
      res = res.filter(r => this.campusShort(r.campus) === this.campusShort(this.campusFilter));
    }

    // Sortierung
    if (this.sortBy === 'student') {
      res.sort((a, b) => a.studentName.localeCompare(b.studentName));
    } else if (this.sortBy === 'oldest') {
      res.sort((a, b) => a.fromDate.localeCompare(b.fromDate));
    } else {
      res.sort((a, b) => b.fromDate.localeCompare(a.fromDate));
    }

    return res;
  }

  // --- ACTIONS (Backend Calls) ---

  accept(req: LenderRequest): void {
    if (req.status !== 'PENDING') return;

    this.bookingService.confirmBooking(req.id,[]).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Anfrage genehmigt',
          detail: `${req.studentName} • ${req.productName}`
        });
        this.loadData(); // Neu laden
      },
      error: (err: any) => {
        this.messageService.add({ severity: 'error', summary: 'Fehler', detail: 'Konnte nicht genehmigt werden.' });
      }
    });
  }

  // Dialog öffnen
  openDecline(req: LenderRequest): void {
    if (req.status !== 'PENDING') return;
    this.selectedRequest = req;
    this.declineReason = '';
    this.declineError = '';
    this.isDeclineDialogOpen = true;
  }

  closeDecline(): void {
    this.isDeclineDialogOpen = false;
    this.selectedRequest = null;
  }

  // Ablehnen im Backend
  confirmDecline(): void {
    if (!this.selectedRequest) return; 

    this.bookingService.updateStatus(this.selectedRequest.id, { 
      action: 'reject', 
      message: this.declineReason 
    }).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'info',
          summary: 'Anfrage abgelehnt',
          detail: 'Die Buchung wurde entfernt.'
        });
        this.closeDecline();
        this.loadData(); // Neu laden
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Fehler', detail: 'Konnte nicht ablehnen.' });
      }
    });
  }

  // --- HELPER ---

  statusTag(req: LenderRequest): { value: string; cls: string } {
    if (req.status === 'PENDING') {
      return { value: 'Offen', cls: 'bg-orange-600 text-white text-xs font-normal px-2 py-1 rounded whitespace-nowrap' };
    }
    if (req.status === 'CONFIRMED' || req.status === 'accepted') { // Beides abfangen
      return { value: 'Angenommen', cls: 'bg-green-600 text-white text-xs font-normal px-2 py-1 rounded whitespace-nowrap' };
    }
    return { value: 'Abgelehnt', cls: 'bg-red-600 text-white text-xs font-normal px-2 py-1 rounded whitespace-nowrap' };
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return dateStr;
    return new Intl.DateTimeFormat('de-DE', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    }).format(d);
  }

  campusShort(campus: string): string {
    if (!campus) return '';
    const c = campus.toLowerCase();
    if (c.includes('esslingen')) return 'ES';
    if (c.includes('göppingen') || c.includes('goeppingen')) return 'GO';
    return campus;
  }
}