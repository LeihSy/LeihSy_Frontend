import { Component, computed } from '@angular/core';
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

type RequestStatus = 'pending' | 'accepted' | 'declined';

interface LenderRequest {
    id: number;
    studentName: string;
    studentId: string;
    productName: string;
    inventoryNumber: string;
    campus: string;
    fromDate: string; 
    toDate: string;   
    status: RequestStatus;
    declineReason?: string;
  }
  
  @Component({
    selector: 'app-lender-requests',
    standalone: true,
    imports: [
      CommonModule,
      FormsModule,
      ToastModule,
      ButtonModule,
      DialogModule,
      TagModule,
      InputTextModule,
      SelectModule,
      TableModule
    ],
    providers: [MessageService],
    templateUrl: './lender-requests.component.html'
  })

  searchQuery = '';
  campusFilter = 'all';
  sortBy: 'newest' | 'oldest' | 'student' = 'newest';
  tab: 'pending' | 'done' = 'pending';

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

  //Mock

  requests: LenderRequest[] = [
    {
      id: 1,
      studentName: 'Max Mustermann',
      studentId: 'S123456',
      productName: 'Canon EOS R5',
      inventoryNumber: 'INV-10021',
      campus: 'Esslingen',
      fromDate: '2026-01-10',
      toDate: '2026-01-12',
      status: 'pending'
    },
    {
      id: 2,
      studentName: 'Lisa Hoffmann',
      studentId: 'S987654',
      productName: 'DJI Mic 2',
      inventoryNumber: 'INV-20011',
      campus: 'Göppingen',
      fromDate: '2026-01-15',
      toDate: '2026-01-16',
      status: 'pending'
    },
    {
        id: 3,
        studentName: 'Maria Schmidt',
        studentId: 'S555111',
        productName: 'Stativ Manfrotto',
        inventoryNumber: 'INV-30007',
        campus: 'Esslingen',
        fromDate: '2026-01-05',
        toDate: '2026-01-06',
        status: 'accepted'
      }
    ];

    isDeclineDialogOpen = false;
    selectedRequest: LenderRequest | null = null;
    declineReason = '';
    declineError = '';

    pendingCount = computed(() => this.requests.filter(r => r.status === 'pending').length);
    acceptedCount = computed(() => this.requests.filter(r => r.status === 'accepted').length);
    declinedCount = computed(() => this.requests.filter(r => r.status === 'declined').length);

    filteredPending = computed(() => this.applyAll(this.requests.filter(r => r.status === 'pending')));
    filteredDone = computed(() => this.applyAll(this.requests.filter(r => r.status !== 'pending')));

    private applyAll(list: LenderRequest[]): LenderRequest[] {
        const q = this.searchQuery.toLowerCase().trim();
        const campus = this.campusFilter;

        if (q) {
            res = res.filter(r =>
              r.studentName.toLowerCase().includes(q) ||
              r.studentId.toLowerCase().includes(q) ||
              r.productName.toLowerCase().includes(q) ||
              r.inventoryNumber.toLowerCase().includes(q)
            );
          }
      
          if (campus !== 'all') {
            res = res.filter(r => r.campus === campus);
          }