import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BookingService } from '../../services/booking.service';
import { LocationService } from '../../services/location.service'; 
import { UserService } from '../../services/user.service';
import { LocationDTO } from '../../models/location.model';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

type SortBy = 'date' | 'student' | 'device';
type ViewTab = 'active' | 'pending';

interface ActiveLoan {
  id: string;
  studentName: string;
  studentId: string;
  studentEmail: string;
  deviceName: string;
  inventoryNumber: string;
  borrowedDate: string; // YYYY-MM-DD
  dueDate: string;      // YYYY-MM-DD
  campus: string;
  status: 'active' | 'overdue';
  daysOverdue?: number;
}
interface PendingPickup {
    id: string;
    studentName: string;
    studentId: string;
    studentEmail: string;
    deviceName: string;
    inventoryNumber: string;
    pickupDate: string;   // YYYY-MM-DD
    pickupTime: string;
    campus: string;
    confirmedDate: string; // YYYY-MM-DD
  }
  
  @Component({
    selector: 'app-admin-loan-dashboard',
    standalone: true,
    imports: [
      CommonModule,
      FormsModule,
      NgClass,
      RouterLink,
      ButtonModule,
      InputTextModule,
      SelectModule,
      TagModule,
      TableModule,
      ToastModule
    ],
    providers: [MessageService],
    templateUrl: './admin-loan-dashboard.component.html',
  })
  export class AdminLoanDashboardComponent implements OnInit {
    private readonly messageService = inject(MessageService);
    private readonly bookingService = inject(BookingService);
    private readonly locationService = inject(LocationService);
    private readonly userService = inject(UserService);

    activeLoans: ActiveLoan[] = [];
    pendingPickups: PendingPickup[] = [];

    ngOnInit(){
      this.loadData();
      this.loadLocations();
    }
// UI state
tab: ViewTab = 'active';
searchQuery = '';
campusFilter = 'all';
sortBy: SortBy= 'date';

// Options (p-select)
campusOptions: any[] = [
  { label: 'Alle Standorte', value: 'all' }
];

  sortOptions = [
    { label: 'Nach Datum', value: 'date' },
    { label: 'Nach Student', value: 'student' },
    { label: 'Nach Gerät', value: 'device' },
  ];


//Stats
    get overdueCount(): number {
        return this.activeLoans.filter(l => l.status === 'overdue').length;
      }
    
      get activeCount(): number {
        return this.activeLoans.filter(l => l.status === 'active').length;
      }
    
      get pendingCount(): number {
        return this.pendingPickups.length;
      }
    
      get dueTodayCount(): number {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
    
        return this.activeLoans.filter(loan => {
          const d = new Date(loan.dueDate);
          d.setHours(0, 0, 0, 0);
          return d.getTime() === today.getTime();
        }).length;
      }
  
  //Filtering & sorting
  get filteredAndSortedLoans(): ActiveLoan[] {
    const q = this.searchQuery.trim().toLowerCase();
    const campus = this.campusFilter;

    const filtered = this.activeLoans.filter(loan => {
      const matchesSearch =
        !q ||
        loan.studentName.toLowerCase().includes(q) ||
        loan.studentId.toLowerCase().includes(q) ||
        loan.deviceName.toLowerCase().includes(q) ||
        loan.inventoryNumber.toLowerCase().includes(q);

      const matchesCampus = campus === 'all' || loan.campus === campus;
      return matchesSearch && matchesCampus;
    });

    return [...filtered].sort((a, b) => {
      if (this.sortBy === 'date') {
        if (a.status === 'overdue' && b.status !== 'overdue') return -1;
        if (a.status !== 'overdue' && b.status === 'overdue') return 1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      if (this.sortBy === 'student') return a.studentName.localeCompare(b.studentName);
      return a.deviceName.localeCompare(b.deviceName);
    });
  }

  get filteredAndSortedPickups(): PendingPickup[] {
    const q = this.searchQuery.trim().toLowerCase();
    const campus = this.campusFilter;

    const filtered = this.pendingPickups.filter(p => {
      const matchesSearch =
        !q ||
        p.studentName.toLowerCase().includes(q) ||
        p.studentId.toLowerCase().includes(q) ||
        p.deviceName.toLowerCase().includes(q) ||
        p.inventoryNumber.toLowerCase().includes(q);

      const matchesCampus = campus === 'all' || p.campus === campus;
      return matchesSearch && matchesCampus;
    });

    return [...filtered].sort((a, b) => {
      if (this.sortBy === 'date') return new Date(a.pickupDate).getTime() - new Date(b.pickupDate).getTime();
      if (this.sortBy === 'student') return a.studentName.localeCompare(b.studentName);
      return a.deviceName.localeCompare(b.deviceName);
    });
  }
    //Helpers
    formatDate(dateString: string): string {
        return new Date(dateString).toLocaleDateString('de-DE', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      }
      loadLocations() {
        this.locationService.getAllLocations().subscribe({
          next: (locations: LocationDTO[]) => {
       
            const dbOptions = locations.map(loc => ({
              label: loc.roomNr, 
              value: loc.roomNr  
            }));
            this.campusOptions = [{ label: 'Alle Standorte', value: 'all' }, ...dbOptions];
          },
          error: (err) => console.error('Konnte Locations nicht laden', err)
        });
      }
      campusShort(campus: string): string {
        if (!campus) return '-';
        return campus.replace('Campus Esslingen ', '').replace('Campus ', '');
      }
      
      loadData() {
        this.userService.getCurrentUser().subscribe({
          next: (user: any) => {
            if (!user || !user.id) return;
    
            this.bookingService.getBookingsByLenderId(user.id, true).subscribe({
              next: (allBookings: any[]) => {
              
                this.activeLoans = allBookings
                  .filter(b => b.status === 'PICKED_UP')
                  .map(b => ({
                    id: b.id.toString(),
                    studentName: b.userName || b.user?.name || 'Unbekannt',
                    studentId: b.userId?.toString() || b.user?.matrikelNr || '',
                    studentEmail: b.user?.email || '',
                    deviceName: b.productName || b.item?.product?.name || 'Gerät',
                    inventoryNumber: b.invNumber || b.item?.invNumber || b.itemInvNumber || '-',
                    borrowedDate: b.distributionDate,
                    dueDate: b.endDate,
                    campus: b.roomNr || 'Unbekannt', 
                    status: (!b.returnDate && new Date(b.endDate) < new Date()) ? 'overdue' : 'active',
                    daysOverdue: this.calculateOverdueDays(b.endDate)
                  }));

                this.pendingPickups = allBookings
                  .filter(b => b.status === 'CONFIRMED')
                  .map(p => ({
                    id: p.id.toString(),
                    studentName: p.userName || p.user?.name || 'Unbekannt',
                    studentId: p.userId?.toString() || p.user?.matrikelNr || '',
                    studentEmail: p.user?.email || '',
                    deviceName: p.productName || p.item?.product?.name || 'Gerät',
                    inventoryNumber: p.invNumber || p.item?.invNumber || p.itemInvNumber || '-',
                    pickupDate: p.confirmedPickup ? p.confirmedPickup.split('T')[0] : '',
                    pickupTime: p.confirmedPickup ? p.confirmedPickup.split('T')[1]?.substring(0, 5) : '',
                    campus: p.roomNr || 'Unbekannt',
                    confirmedDate: p.createdAt
                  }));
              },
              error: (err: any) => {
                console.error('Fehler beim Laden:', err);
                this.messageService.add({ severity: 'error', summary: 'Fehler', detail: 'Daten konnten nicht geladen werden' });
              }
            });
          },
          error: (err) => console.error('User nicht gefunden', err)
        });
      }
    
      private calculateOverdueDays(dueDate: string): number {
        const due = new Date(dueDate);
        const now = new Date();
        if (due >= now) return 0;
        const diff = now.getTime() - due.getTime();
        return Math.floor(diff / (1000 * 60 * 60 * 24));
      }
        
      processPickup(id: string) {
        this.bookingService.recordPickup(Number(id)).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Ausgabe bestätigt',
              detail: 'Der Status wurde auf Ausgeliehen gesetzt.',
            });
            this.loadData();
          },
          error: (err: any) => {
            console.error('Fehler bei Ausgabe:', err);
            this.messageService.add({ severity: 'error', summary: 'Fehler', detail: 'Ausgabe fehlgeschlagen' });
          }
        });
      }
    } 