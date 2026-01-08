import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../models/product.model';
import { Item } from '../../models/item.model';
import { TableComponent, ColumnDef } from '../table/table.component';

export interface ProductWithItems {
  product: Product;
  items: Item[];
  availableCount: number;
  totalCount: number;
}

@Component({
  selector: 'app-lender-product-item-list',
  standalone: true,
  imports: [CommonModule, TableComponent],
  template: `
    <div class="bg-white border border-gray-200 rounded-lg overflow-hidden mb-4">
      <div class="bg-gray-50 border-b border-gray-200 p-4">
        <div class="flex items-center justify-between">
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-[#253359] mb-1">
              {{ productData.product.name }}
            </h3>
            <div class="flex items-center gap-4 text-sm text-gray-600">
              <span>
                <i class="pi pi-tag mr-1"></i>
                {{ productData.product.category?.name || 'N/A' }}
              </span>
              <span>
                <i class="pi pi-map-marker mr-1"></i>
                {{ productData.product.location?.roomNr || 'N/A' }}
              </span>
              @if (showAdminInfo) {
                <span class="text-blue-600">
                  <i class="pi pi-info-circle mr-1"></i>
                  ID: {{ productData.product.id }}
                </span>
              }
            </div>
          </div>
          <div class="text-right">
            <p class="text-sm text-gray-600">Verfügbar</p>
            <p class="text-xl font-bold"
               [class.text-green-600]="productData.availableCount > 0"
               [class.text-red-600]="productData.availableCount === 0">
              {{ productData.availableCount }} / {{ productData.totalCount }}
            </p>
          </div>
        </div>
      </div>

      <div class="p-4">
        <app-table
          [columns]="columns"
          [data]="productData.items"
          [showActions]="false"
          [rows]="5"
          [paginator]="false"
          [scrollable]="false"
          [rowClickable]="true"
          (rowSelect)="itemClick.emit($event)"
          emptyMessage="Keine Gegenstände vorhanden">
        </app-table>
      </div>
    </div>
  `
})
export class LenderProductItemListComponent {
  @Input() productData!: ProductWithItems;
  @Input() columns: ColumnDef[] = [];
  @Input() showAdminInfo = false;

  @Output() itemClick = new EventEmitter<Item>();
}

