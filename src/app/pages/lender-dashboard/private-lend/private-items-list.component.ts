import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { BackButtonComponent } from '../../../components/buttons/back-button/back-button.component';
import { TableComponent, ColumnDef } from '../../../components/table/table.component';
import { FilledButtonComponent } from '../../../components/buttons/filled-button/filled-button.component';
import { SecondaryButtonComponent } from '../../../components/buttons/secondary-button/secondary-button.component';
import { ProductService } from '../../../services/product.service';
import { ItemService } from '../../../services/item.service';
import { Product } from '../../../models/product.model';
import { Item } from '../../../models/item.model';

@Component({
  selector: 'app-private-items-list',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    ToastModule,
    ConfirmDialogModule,
    BackButtonComponent,
    TableComponent,
    FilledButtonComponent,
    SecondaryButtonComponent
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './private-items-list.component.html'
})
export class PrivateItemsListComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly productService = inject(ProductService);
  private readonly itemService = inject(ItemService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  privateProducts = signal<Product[]>([]);
  privateItems = signal<Item[]>([]);
  isLoading = signal(true);

  productColumns = signal<ColumnDef[]>([
    { field: 'name', header: 'Name', sortable: true },
    { field: 'description', header: 'Beschreibung', sortable: false },
    { field: 'categoryName', header: 'Kategorie', sortable: true, type: 'badge' },
    { field: 'price', header: 'Preis', sortable: true, type: 'currency' }
  ]);

  itemColumns = signal<ColumnDef[]>([
    { field: 'invNumber', header: 'Inventarnummer', sortable: true },
    { field: 'productName', header: 'Produkt', sortable: true },
    { field: 'availabilityStatus', header: 'Status', sortable: true, type: 'status' }
  ]);

  ngOnInit(): void {
    this.loadPrivateData();
  }

  loadPrivateData(): void {
    this.isLoading.set(true);

    this.productService.getProducts().subscribe({
      next: (products) => {
        const privateProducts = products.filter(p =>
          p.location && p.location.roomNr?.toLowerCase() === 'privat'
        ).map(p => ({
          ...p,
          categoryName: p.category?.name || '-'
        }));
        this.privateProducts.set(privateProducts);
      },
      error: (err) => {
        console.error('Fehler beim Laden der privaten Produkte:', err);
      }
    });

    this.itemService.getAllItems().subscribe({
      next: (items) => {
        const privateItems = items.filter(item =>
          item.invNumber?.startsWith('PRV-')
        ).map(item => ({
          ...item,
          availabilityStatus: item.isAvailable ? 'Verfügbar' : 'Verliehen'
        }));
        this.privateItems.set(privateItems);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Fehler beim Laden der privaten Items:', err);
        this.isLoading.set(false);
      }
    });
  }


  editProduct(product: Product): void {
    this.router.navigate(['/lender/private-lend/product', product.id]);
  }

  editItem(item: Item): void {
    this.router.navigate(['/lender/private-lend/item', item.id]);
  }

  deleteProduct(product: Product): void {
    this.confirmationService.confirm({
      message: `Möchtest du das Produkt "${product.name}" wirklich löschen?`,
      header: 'Produkt löschen',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Löschen',
      rejectLabel: 'Abbrechen',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary',
      accept: () => {
        this.productService.deleteProduct(product.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Erfolg',
              detail: 'Produkt wurde gelöscht'
            });
            this.loadPrivateData();
          },
          error: (err) => {
            console.error('Fehler beim Löschen:', err);
            this.messageService.add({
              severity: 'error',
              summary: 'Fehler',
              detail: 'Produkt konnte nicht gelöscht werden'
            });
          }
        });
      }
    });
  }

  deleteItem(item: Item): void {
    this.confirmationService.confirm({
      message: `Möchtest du den Gegenstand "${item.invNumber}" wirklich löschen?`,
      header: 'Gegenstand löschen',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Löschen',
      rejectLabel: 'Abbrechen',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary',
      accept: () => {
        this.itemService.deleteItem(item.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Erfolg',
              detail: 'Gegenstand wurde gelöscht'
            });
            this.loadPrivateData();
          },
          error: (err) => {
            console.error('Fehler beim Löschen:', err);
            this.messageService.add({
              severity: 'error',
              summary: 'Fehler',
              detail: 'Gegenstand konnte nicht gelöscht werden'
            });
          }
        });
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/lender/private-lend']);
  }
}

