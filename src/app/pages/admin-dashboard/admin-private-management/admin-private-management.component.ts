import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeaderComponent } from '../../../components/page-header/page-header.component';
import { BackButtonComponent } from '../../../components/buttons/back-button/back-button.component';
import { ManagementCardComponent } from '../../../components/admin/management-card/management-card.component';
import { JsonImportDialogComponent } from '../../../components/admin/json-import-dialog/json-import-dialog.component';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { AdminPrivateManagementPageService } from './page-services/admin-private-management-page.service';

@Component({
  selector: 'app-admin-private-management',
  standalone: true,
  imports: [
    CommonModule,
    PageHeaderComponent,
    BackButtonComponent,
    ManagementCardComponent,
    JsonImportDialogComponent,
    ToastModule
  ],
  providers: [MessageService, AdminPrivateManagementPageService],
  templateUrl: './admin-private-management.component.html',
  styleUrls: ['./admin-private-management.component.scss']
})
export class AdminPrivateManagementComponent {
  private readonly pageService = inject(AdminPrivateManagementPageService);

  // Expose service signals via getters
  get showProductDialog() { return this.pageService.showProductDialog; }
  get showItemDialog() { return this.pageService.showItemDialog; }
  get productJsonInput() { return this.pageService.productJsonInput; }
  get itemJsonInput() { return this.pageService.itemJsonInput; }
  get processingProduct() { return this.pageService.processingProduct; }
  get processingItem() { return this.pageService.processingItem; }

  openProductDialog(): void {
    this.pageService.openProductDialog();
  }

  openItemDialog(): void {
    this.pageService.openItemDialog();
  }

  closeProductDialog(): void {
    this.pageService.closeProductDialog();
  }

  closeItemDialog(): void {
    this.pageService.closeItemDialog();
  }

  createProductFromJson(): void {
    this.pageService.createProductFromJson();
  }

  createItemFromJson(): void {
    this.pageService.createItemFromJson();
  }

  goBack(): void {
    this.pageService.goBack();
  }
}
