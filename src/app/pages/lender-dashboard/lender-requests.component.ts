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