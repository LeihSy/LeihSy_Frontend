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