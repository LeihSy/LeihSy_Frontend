import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { FilledButtonComponent } from '../../../components/buttons/filled-button/filled-button.component';
import { SecondaryButtonComponent } from '../../../components/buttons/secondary-button/secondary-button.component';
import { PageHeaderComponent } from '../../../components/page-header/page-header.component';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TextareaModule } from 'primeng/textarea';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { AdminPrivateImportService, ImportResult } from './admin-private-import.service';

@Component({
  selector: 'app-admin-private-management',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    FilledButtonComponent,
    SecondaryButtonComponent,
    PageHeaderComponent,
    ButtonModule,
    DialogModule,
    TextareaModule,
    FormsModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './admin-private-management.component.html',
  styleUrls: ['./admin-private-management.component.scss']
})
export class AdminPrivateManagementComponent {
  private readonly router = inject(Router);
  private readonly importService = inject(AdminPrivateImportService);
  private readonly messageService = inject(MessageService);

  showProductDialog = signal(false);
  showItemDialog = signal(false);
  productJsonInput = signal('');
  itemJsonInput = signal('');
  processingProduct = signal(false);
  processingItem = signal(false);

  openProductDialog(): void {
    this.productJsonInput.set('');
    this.showProductDialog.set(true);
  }

  openItemDialog(): void {
    this.itemJsonInput.set('');
    this.showItemDialog.set(true);
  }

  closeProductDialog(): void {
    this.showProductDialog.set(false);
    this.productJsonInput.set('');
  }

  closeItemDialog(): void {
    this.showItemDialog.set(false);
    this.itemJsonInput.set('');
  }

  createProductFromJson(): void {
    const jsonString = this.productJsonInput();

    if (!jsonString.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warnung',
        detail: 'Bitte geben Sie einen JSON-String ein.'
      });
      return;
    }

    this.processingProduct.set(true);

    const result = this.importService.processJsonImport(jsonString);

    if (result.success && result.observable) {
      result.observable.subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Erfolg',
            detail: 'Privates Produkt wurde erfolgreich erstellt!'
          });
          this.closeProductDialog();
          this.processingProduct.set(false);
        },
        error: (err) => {
          console.error('Fehler beim Erstellen:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Fehler',
            detail: 'Produkt konnte nicht erstellt werden: ' + (err.error?.message || err.message || 'Unbekannter Fehler')
          });
          this.processingProduct.set(false);
        }
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'JSON Fehler',
        detail: result.error || 'Unbekannter Fehler'
      });
      this.processingProduct.set(false);
    }
  }

  createItemFromJson(): void {
    const jsonString = this.itemJsonInput();

    if (!jsonString.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warnung',
        detail: 'Bitte geben Sie einen JSON-String ein.'
      });
      return;
    }

    this.processingItem.set(true);

    const result = this.importService.processJsonImport(jsonString);

    if (result.success && result.observable) {
      result.observable.subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Erfolg',
            detail: 'Privater Gegenstand wurde erfolgreich erstellt!'
          });
          this.closeItemDialog();
          this.processingItem.set(false);
        },
        error: (err) => {
          console.error('Fehler beim Erstellen:', err);
          console.error('Error Details:', {
            status: err.status,
            statusText: err.statusText,
            error: err.error,
            message: err.message
          });
          this.messageService.add({
            severity: 'error',
            summary: 'Fehler',
            detail: 'Gegenstand konnte nicht erstellt werden: ' + (err.error?.message || err.statusText || err.message || 'Unbekannter Fehler')
          });
          this.processingItem.set(false);
        }
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'JSON Fehler',
        detail: result.error || 'Unbekannter Fehler'
      });
      this.processingItem.set(false);
    }
  }

  goBack(): void {
    void this.router.navigate(['/admin']);
  }
}

