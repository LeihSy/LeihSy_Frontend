import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { ColumnDef } from '../../../components/table/table.component';
import { BackButtonComponent } from '../../../components/buttons/back-button/back-button.component';
import { ItemHeaderComponent } from '../../../components/lender/item-header/item-header.component';
import { InfoSectionComponent } from '../../../components/lender/info-section/info-section.component';
import { LoanHistoryComponent } from '../../../components/shared/loan-history/loan-history.component';
import { ItemDetailService } from './page-services/item-detail.service';

@Component({
  selector: 'app-item-detail',
  standalone: true,
  imports: [
    CommonModule,
    TagModule,
    ToastModule,
    BackButtonComponent,
    ItemHeaderComponent,
    InfoSectionComponent,
    LoanHistoryComponent
  ],
  templateUrl: './item-detail.component.html',
  styleUrls: ['./item-detail.component.scss'],
  providers: [MessageService, ItemDetailService]
})
export class ItemDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly messageService = inject(MessageService);
  readonly pageService = inject(ItemDetailService);

  // Spalten-Definition für die Loan History Tabelle
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
}
