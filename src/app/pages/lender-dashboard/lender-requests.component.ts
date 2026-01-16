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
import { TooltipModule } from 'primeng/tooltip';

// Services & Models
import { BookingService } from '../../services/booking.service';
import { LocationService } from '../../services/location.service'; 
import { Location } from '../../models/location.model'; 
import { UserService } from '../../services/user.service';
import { PickupSelectionDialogComponent } from './pickup-selection-dialogs.component';

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
  proposedPickups?: string[];
}

@Component({
  selector: 'app-lender-requests',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ToastModule, ButtonModule, DialogModule,
    TagModule, InputTextModule, SelectModule, TableModule, TooltipModule,PickupSelectionDialogComponent
  ],
  providers: [MessageService],
  templateUrl: './lender-requests.component.html'
})
export class LenderRequestsComponent implements OnInit {
  
  
  private bookingService = inject(BookingService);
  private messageService = inject(MessageService);
  private locationService = inject(LocationService); 
  private userService = inject(UserService);

  isPickupDialogOpen = false;
  selectedRequestForPickup: LenderRequest | null = null;

  // UI State
  searchQuery = '';
  campusFilter = 'all';
  sortBy: 'newest' | 'oldest' | 'student' = 'newest';
  tab: 'pending' | 'done' = 'pending';

  requests: LenderRequest[] = []; 
  locations: Location[] = []; // Liste der Standorte aus der DB

  
  campusOptions: any[] = [{ label: 'Alle Campus', value: 'all' }];
  
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
    this.loadLocations(); // Zuerst Standorte für die Filter laden
    this.loadData();
  }

  // --- STANDORTE AUS DB LADEN ---
  loadLocations() {
    this.locationService.getAllLocations().subscribe({
      next: (data: Location[]) => {
        this.locations = data;
        this.campusOptions = [
          { label: 'Alle Campus', value: 'all' },
          ...data.map(loc => ({ 
            label: loc.roomNr, 
            value: loc.roomNr 
          }))
        ];
      },
      error: (err: any) => console.error('Fehler beim Laden der Standorte', err)
    });
  }

  // --- DATEN LADEN ---
  loadData() {
    this.bookingService.getPendingBookings().subscribe({
      next: (data: any[]) => {
        this.requests = data.map(b => {
        
          let parsedPickups: string[] = [];
          try {
            if (b.proposedPickups) {
              parsedPickups = Array.isArray(b.proposedPickups) 
                ? b.proposedPickups 
                : JSON.parse(b.proposedPickups);
            }
          } catch (e) {
            console.error('Fehler beim Parsen der Termine:', e);
            parsedPickups = [];
          }
  
          const realCampus = b.roomNr || b.item?.location?.roomNr || 'Unbekannt';
  
          return {
            id: b.id,
            studentName: b.userName || b.user?.name || 'Unbekannt',
            studentId: b.user?.uniqueId || b.userId?.toString() || '', 
            productName: b.productName || b.item?.product?.name,
            inventoryNumber: b.invNumber || b.item?.invNumber,
            campus: realCampus || '-', 
            fromDate: b.startDate,
            toDate: b.endDate,
            status: b.status || 'PENDING',
            message: b.message,
            proposedPickups: parsedPickups 
          };
        });
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

    if (this.campusFilter !== 'all') {
      res = res.filter(r => r.campus === this.campusFilter);
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

  // --- ACTIONS ---

  accept(req: LenderRequest): void {
    if (req.status !== 'PENDING') return;

    this.bookingService.confirmBooking(req.id, []).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Anfrage genehmigt',
          detail: `${req.studentName} • ${req.productName}`
        });
        this.loadData();
      },
      error: (err: any) => {
        this.messageService.add({ severity: 'error', summary: 'Fehler', detail: 'Konnte nicht genehmigt werden.' });
      }
    });
  }
  //Termin Vorschläge
  openAcceptDialog(req: LenderRequest): void {
    if (req.status !== 'PENDING') return;
    this.selectedRequestForPickup = req;
    this.isPickupDialogOpen = true;
  }

  // Verleiher wählt einen Termin des Studenten 
  onPickupSelected(event: { selectedPickup: string; message: string }) {
    if (!this.selectedRequestForPickup) return;
  
    const dateList = [event.selectedPickup];
  
    this.bookingService.confirmBooking(
      this.selectedRequestForPickup.id, 
      dateList, 
      event.message
    ).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Erfolgreich', detail: 'Terminvorschlag gesendet.' });
        this.isPickupDialogOpen = false;
        this.loadData();
      },
      error: (err) => {
        console.error('Fehler beim Bestätigen:', err);
        this.messageService.add({ severity: 'error', summary: 'Fehler', detail: 'Konnte nicht gespeichert werden.' });
      }
    });
  }

  //Verleiher macht Gegenvorschläge 
  onNewPickupsProposed(event: { newPickups: string[]; message: string }) {
    if (!this.selectedRequestForPickup) return;

    const updateData = {
      action: 'propose',
      proposedPickups: event.newPickups,
      message: event.message
    } as any;

    this.bookingService.updateStatus(this.selectedRequestForPickup.id, updateData).subscribe({
      next: () => {
        this.messageService.add({ severity: 'info', summary: 'Vorschlag gesendet', detail: 'Gegenvorschläge wurden an den Studenten gesendet.' });
        this.isPickupDialogOpen = false;
        this.loadData();
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Fehler', detail: 'Konnte nicht gesendet werden.' })
    });
  }


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
        this.loadData();
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
    if (req.status === 'CONFIRMED' || req.status === 'accepted') {
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
    return campus;
  }
}