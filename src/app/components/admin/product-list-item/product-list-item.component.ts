import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { Product } from '../../../models/product.model';
import { Item } from '../../../models/item.model';
import { TableComponent, ColumnDef } from '../../table/table.component';

export interface ProductWithItems {
  product: Product;
  items: Item[];
  availableCount: number;
  totalCount: number;
}

@Component({
  selector: 'app-product-list-item',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    TooltipModule,
    TableComponent
  ],
  templateUrl: './product-list-item.component.html',
  styleUrls: ['./product-list-item.component.scss']
})
export class ProductListItemComponent {
  @Input() productData!: ProductWithItems;
  @Input() isExpanded = false;
  @Input() itemColumns: ColumnDef[] = [];
  @Input() showActions = false;

  @Output() toggleExpansion = new EventEmitter<number>();
  @Output() addItem = new EventEmitter<Product>();
  @Output() editItem = new EventEmitter<Item>();
  @Output() deleteItem = new EventEmitter<Item>();
  @Output() itemClick = new EventEmitter<Item>();
  @Output() productClick = new EventEmitter<number>();
  @Output() createItem = new EventEmitter<number>();

  onToggleExpansion(): void {
    this.toggleExpansion.emit(this.productData.product.id);
  }

  onAddItem(event: Event): void {
    event.stopPropagation();
    this.addItem.emit(this.productData.product);
  }

  onEditItem(item: Item): void {
    this.editItem.emit(item);
  }

  onDeleteItem(item: Item): void {
    this.deleteItem.emit(item);
  }

  onItemClick(item: Item): void {
    this.itemClick.emit(item);
  }

  onProductClick(): void {
    this.productClick.emit(this.productData.product.id);
  }

  onCreateItem(): void {
    this.createItem.emit(this.productData.product.id);
  }
}

