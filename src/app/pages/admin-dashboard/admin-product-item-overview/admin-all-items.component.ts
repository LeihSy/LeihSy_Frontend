import { Component, OnInit, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { Item } from '../../../models/item.model';
import { ColumnDef } from '../../../components/table/table.component';
import { AdminAllItemsService } from './page-services/admin-all-items.service';
import { LenderStatsCardsComponent, StatCard } from '../../../components/lender/lender-stats-cards.component';
import { LenderProductItemListComponent } from '../../../components/lender/lender-product-item-list.component';
import { SearchBarComponent } from '../../../components/search-bar/search-bar.component';
import { PageHeaderComponent } from '../../../components/page-header/page-header.component';

@Component({
  selector: 'app-lender-items',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    CardModule,
    TagModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    ToastModule,
    LenderStatsCardsComponent,
    LenderProductItemListComponent,
    SearchBarComponent,
    PageHeaderComponent
  ],
  templateUrl: './admin-all-items.component.html',
  providers: [MessageService, AdminAllItemsService]
})
export class AdminAllItemsComponent implements OnInit {
  private pageService = inject(AdminAllItemsService);

  itemColumns: ColumnDef[] = [
    { field: 'invNumber', header: 'Inventarnummer', sortable: true, width: '150px' },
    { field: 'owner', header: 'Besitzer', sortable: true },
    { field: 'availableLabel', header: 'Status', type: 'status', sortable: true, width: '120px' }
  ];

  currentUser = this.pageService.currentUser;
  isLoading = this.pageService.isLoading;
  productsWithItems = this.pageService.productsWithItems;

  // Computed stats cards
  statsCards = computed<StatCard[]>(() => [
    {
      label: 'Gesamt Gegenstände',
      value: this.pageService.totalItems(),
      icon: 'pi-box',
      iconColor: 'text-[#000080]',
      valueColor: 'text-[#000080]'
    },
    {
      label: 'Verfügbar',
      value: this.pageService.totalAvailable(),
      icon: 'pi-check-circle',
      iconColor: 'text-green-600',
      valueColor: 'text-green-600'
    },
    {
      label: 'Ausgeliehen',
      value: this.pageService.totalBorrowed(),
      icon: 'pi-clock',
      iconColor: 'text-red-600',
      valueColor: 'text-red-600'
    }
  ]);

  ngOnInit(): void {
    this.pageService.initialize();
  }

  onSearchChange(value: string): void {
    this.pageService.updateSearchQuery(value);
  }

  onItemRowClick(item: Item): void {
    this.pageService.navigateToItemDetail(item.id);
  }
}

