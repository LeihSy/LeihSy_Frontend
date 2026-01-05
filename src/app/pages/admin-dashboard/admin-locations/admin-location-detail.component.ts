import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../../services/product.service';
import { Product } from '../../../models/product.model';
import { TableComponent, ColumnDef } from '../../../components/table/table.component';
import { ButtonModule } from 'primeng/button';
import { BackButtonComponent } from '../../../components/back-button/back-button.component';

@Component({
  selector: 'app-admin-location-detail',
  standalone: true,
  imports: [CommonModule, TableComponent, ButtonModule, BackButtonComponent],
  templateUrl: './admin-location-detail.component.html',
  styleUrls: []
})
export class AdminLocationDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(ProductService);

  locationId!: number;
  products: Product[] = [];
  columns: ColumnDef[] = [
    { field: 'id', header: 'ID', width: '80px', type: 'number' },
    { field: 'name', header: 'Name' },
    { field: 'categoryName', header: 'Kategorie' },
    { field: 'availableItemCount', header: 'Verfügbar', type: 'number' },
    { field: 'totalItemCount', header: 'Gesamt', type: 'number' }
  ];

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.locationId = idParam ? Number(idParam) : Number.NaN;
    if (Number.isNaN(this.locationId)) {
      this.router.navigate(['/admin/locations']);
      return;
    }

    this.loadProducts();
  }

  loadProducts(): void {
    this.productService.getProductsWithItems({ locationId: this.locationId }).subscribe({
      next: (products) => {
        // map fields so table can read simple properties
        this.products = products.map(p => ({
          ...p,
          categoryName: p.category?.name || 'Unbekannt',
          availableItemCount: p.availableItemCount ?? 0,
          totalItemCount: p.totalItemCount ?? 0
        } as Product));
      },
      error: (err) => {
        console.error('Fehler beim Laden der Produkte für Location', err);
      }
    });
  }

  back(): void {
    this.router.navigate(['/admin/locations']);
  }
}
