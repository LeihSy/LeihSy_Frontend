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
        
        // sort
        if (this.sortBy === 'student') {
        res.sort((a, b) => a.studentName.localeCompare(b.studentName));
            } else if (this.sortBy === 'oldest') {
        res.sort((a, b) => a.fromDate.localeCompare(b.fromDate));
            } else {
        res.sort((a, b) => b.fromDate.localeCompare(a.fromDate));
      }
      
            return res;
    }
    //Aktionen 
    accept(req: LenderRequest): void {
        if (req.status !== 'pending') return;
    
        req.status = 'accepted';
        req.declineReason = undefined;
    
        this.messageService.add({
          severity: 'success',
          summary: 'Anfrage angenommen',
          detail: `${req.studentName} • ${req.productName}`
        });
      }
      openDecline(req: LenderRequest): void {
        if (req.status !== 'pending') return;
    
        this.selectedRequest = req;
        this.declineReason = '';
        this.declineError = '';
        this.isDeclineDialogOpen = true;
      }
      closeDecline(): void {
        this.isDeclineDialogOpen = false;
        this.selectedRequest = null;
        this.declineReason = '';
        this.declineError = '';
      }
      confirmDecline(): void {
        if (!this.selectedRequest) return;
    
        const reason = this.declineReason.trim();
        if (!reason) {
          this.declineError = 'Bitte geben Sie eine Begründung an (Pflichtfeld).';
          return;
        }
        this.selectedRequest.status = 'declined';
        this.selectedRequest.declineReason = reason;
    
        this.messageService.add({
          severity: 'warn',
          summary: 'Anfrage abgelehnt',
          detail: `${this.selectedRequest.studentName} • ${this.selectedRequest.productName}`
        });
    
        this.closeDecline();
      }
      
      statusTag(req: LenderRequest): { value: string; cls: string } {
        if (req.status === 'pending') {
          return { value: 'Offen', cls: 'bg-orange-600 text-white text-xs font-normal px-2 py-1 rounded whitespace-nowrap' };
        }
        if (req.status === 'accepted') {
          return { value: 'Angenommen', cls: 'bg-green-600 text-white text-xs font-normal px-2 py-1 rounded whitespace-nowrap' };
        }
        return { value: 'Abgelehnt', cls: 'bg-red-600 text-white text-xs font-normal px-2 py-1 rounded whitespace-nowrap' };
      }
    }