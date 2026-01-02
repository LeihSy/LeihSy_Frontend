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
import { LenderItemsService } from './service/admin-product-item-overview.service';
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
  styleUrls: ['./admin-all-items.component.scss'],
  providers: [MessageService, LenderItemsService]
})
export class AdminAllItemsComponent implements OnInit {
  private lenderService = inject(LenderItemsService);

  // Spalten-Definition für die Item-Tabelle
  itemColumns: ColumnDef[] = [
    { field: 'invNumber', header: 'Inventarnummer', sortable: true, width: '150px' },
    { field: 'owner', header: 'Besitzer', sortable: true },
    { field: 'availableLabel', header: 'Status', type: 'status', sortable: true, width: '120px' }
  ];

  // Use service signals
  currentUser = this.lenderService.currentUser;
  isLoading = this.lenderService.isLoading;
  productsWithItems = this.lenderService.productsWithItems;

  // Computed stats cards
  statsCards = computed<StatCard[]>(() => [
    {
      label: 'Gesamt Gegenstände',
      value: this.lenderService.totalItems(),
      icon: 'pi-box',
      iconColor: 'text-[#000080]',
      valueColor: 'text-[#000080]'
    },
    {
      label: 'Verfügbar',
      value: this.lenderService.totalAvailable(),
      icon: 'pi-check-circle',
      iconColor: 'text-green-600',
      valueColor: 'text-green-600'
    },
    {
      label: 'Ausgeliehen',
      value: this.lenderService.totalBorrowed(),
      icon: 'pi-clock',
      iconColor: 'text-red-600',
      valueColor: 'text-red-600'
    }
  ]);

  ngOnInit(): void {
    this.lenderService.initialize();
  }

  onSearchChange(value: string): void {
    this.lenderService.updateSearchQuery(value);
  }

  onItemRowClick(item: Item): void {
    this.lenderService.navigateToItemDetail(item.id);
  }
}

