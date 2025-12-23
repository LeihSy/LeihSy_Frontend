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
  activeLoans: ActiveLoan[] = [
    {
      id: 'AL-001',
      studentName: 'Max Mustermann',
      studentId: 'ST-123456',
      studentEmail: 'max.mustermann@hs-esslingen.de',
      deviceName: 'Canon EOS R6 Mark II',
      inventoryNumber: 'K-401',
      borrowedDate: '2024-10-08',
      dueDate: '2024-10-14',
      campus: 'Campus Esslingen Flandernstraße',
      status: 'overdue',
      daysOverdue: 3
    },
    {
      id: 'AL-002',
      studentName: 'Anna Schmidt',
      studentId: 'ST-234567',
      studentEmail: 'anna.schmidt@hs-esslingen.de',
      deviceName: 'MacBook Pro M4',
      inventoryNumber: 'L-220',
      borrowedDate: '2024-10-10',
      dueDate: '2024-10-15',
      campus: 'Campus Esslingen Stadtmitte',
      status: 'overdue',
      daysOverdue: 2
    },
    {
      id: 'AL-003',
      studentName: 'Thomas Müller',
      studentId: 'ST-345678',
      studentEmail: 'thomas.mueller@hs-esslingen.de',
      deviceName: 'Meta Quest 3',
      inventoryNumber: 'VR-215',
      borrowedDate: '2024-10-15',
      dueDate: '2024-10-18',
      campus: 'Campus Esslingen Flandernstraße',
      status: 'active'
    },
    {
      id: 'AL-004',
      studentName: 'Lisa Weber',
      studentId: 'ST-456789',
      studentEmail: 'lisa.weber@hs-esslingen.de',
      deviceName: 'iPad Pro 12.9"',
      inventoryNumber: 'T-158',
      borrowedDate: '2024-10-14',
      dueDate: '2024-10-19',
      campus: 'Campus Göppingen',
      status: 'active'
    },
    {
      id: 'AL-005',
      studentName: 'Michael Klein',
      studentId: 'ST-567890',
      studentEmail: 'michael.klein@hs-esslingen.de',
      deviceName: 'Sony A7 IV',
      inventoryNumber: 'K-512',
      borrowedDate: '2024-10-12',
      dueDate: '2024-10-19',
      campus: 'Campus Esslingen Flandernstraße',
      status: 'active'
    },
  ];

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
  }