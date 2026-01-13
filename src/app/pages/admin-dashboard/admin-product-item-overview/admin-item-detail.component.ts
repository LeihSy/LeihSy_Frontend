import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { ColumnDef } from '../../../components/table/table.component';
import { BackButtonComponent } from '../../../components/buttons/back-button/back-button.component';
import { SecondaryButtonComponent } from '../../../components/buttons/secondary-button/secondary-button.component';
import { InfoSectionComponent } from '../../../components/lender/info-section/info-section.component';
import { DetailCardComponent } from '../../../components/admin/detail-card/detail-card.component';
import { LoanHistoryComponent } from '../../../components/shared/loan-history/loan-history.component';
import { AdminItemDetailService } from './page-services/admin-item-detail.service';

@Component({
  selector: 'app-admin-item-detail',
  standalone: true,
  imports: [
    CommonModule,
    TagModule,
    ToastModule,
    BackButtonComponent,
    SecondaryButtonComponent,
    InfoSectionComponent,
    DetailCardComponent,
    LoanHistoryComponent,
    RouterLink
  ],
  templateUrl: './admin-item-detail.component.html',
  providers: [MessageService, AdminItemDetailService]
})
export class AdminItemDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly messageService = inject(MessageService);
  readonly pageService = inject(AdminItemDetailService);

  loanHistoryColumns: ColumnDef[] = [
    { field: 'borrower', header: 'Ausleiher', sortable: true },
    { field: 'startDate', header: 'Von', type: 'date', sortable: true, width: '120px' },
    { field: 'endDate', header: 'Bis', type: 'date', sortable: true, width: '120px' },
    { field: 'status', header: 'Status', type: 'status', sortable: true, width: '130px' }
  ];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const itemId = Number.parseInt(id, 10);
      this.pageService.loadItemDetails(itemId);
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Fehler',
        detail: 'Keine Item-ID gefunden.'
      });
      this.pageService.goBack();
    }
  }

  goBack(): void {
    this.pageService.goBack();
  }

  getStatusSeverity(available: boolean): 'success' | 'danger' {
    return this.pageService.getStatusSeverity(available);
  }
}

