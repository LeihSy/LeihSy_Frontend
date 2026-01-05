import { Component, inject } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

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
  export class AdminLoanDashboardComponent {
    private readonly messageService = inject(MessageService);

// UI state
tab: ViewTab = 'active';
searchQuery = '';
campusFilter = 'all';
sortBy: SortBy= 'date';

// Options (p-select)
  campusOptions = [
    { label: 'Alle Campus', value: 'all' },
    { label: 'Flandernstraße', value: 'Campus Esslingen Flandernstraße' },
    { label: 'Stadtmitte', value: 'Campus Esslingen Stadtmitte' },
    { label: 'Göppingen', value: 'Campus Göppingen' },
  ];

  sortOptions = [
    { label: 'Nach Datum', value: 'date' },
    { label: 'Nach Student', value: 'student' },
    { label: 'Nach Gerät', value: 'device' },
  ];
  //Mock-daten
  activeLoans: ActiveLoan[] = [];

  pendingPickups: PendingPickup[] = [
    {
      id: 'PP-001',
      studentName: 'Tim Hoffmann',
      studentId: 'ST-901234',
      studentEmail: 'tim.hoffmann@hs-esslingen.de',
      deviceName: 'HTC Vive Pro 2',
      inventoryNumber: 'VR-102',
      pickupDate: '2024-10-17',
      pickupTime: '10:00-14:00',
      campus: 'Campus Esslingen Flandernstraße',
      confirmedDate: '2024-10-15'
    },
    {
      id: 'PP-002',
      studentName: 'Nina Hoffmann',
      studentId: 'ST-012345',
      studentEmail: 'nina.hoffmann@hs-esslingen.de',
      deviceName: 'Sony ZV-E10',
      inventoryNumber: 'K-678',
      pickupDate: '2024-10-18',
      pickupTime: '14:00-18:00',
      campus: 'Campus Esslingen Stadtmitte',
      confirmedDate: '2024-10-16'
    }
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
    
      campusShort(campus: string): string {
        return campus.replace('Campus Esslingen ', '').replace('Campus ', '');
      }
      //Actions (Mock)
  processReturn(id: string) {
    const loan = this.activeLoans.find(l => l.id === id);
    if (!loan) return;

    this.activeLoans = this.activeLoans.filter(l => l.id !== id);

    this.messageService.add({
      severity: 'success',
      summary: 'Rückgabe verbucht',
      detail: `${loan.deviceName} (${loan.inventoryNumber})`,
    });
  }

  processPickup(id: string) {
    const pickup = this.pendingPickups.find(p => p.id === id);
    if (!pickup) return;

    this.pendingPickups = this.pendingPickups.filter(p => p.id !== id);

    this.messageService.add({
      severity: 'success',
      summary: 'Ausgabe bestätigt',
      detail: `${pickup.deviceName} (${pickup.inventoryNumber})`,
    });
  }

} 