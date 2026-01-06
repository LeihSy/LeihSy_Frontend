import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AdminPrivateImportService } from './admin-private-import.service';

@Injectable()
export class AdminPrivateManagementPageService {
  private readonly router = inject(Router);
  private readonly importService = inject(AdminPrivateImportService);
  private readonly messageService = inject(MessageService);

  // Dialog state
  showProductDialog = signal(false);
  showItemDialog = signal(false);
  productJsonInput = signal('');
  itemJsonInput = signal('');
  processingProduct = signal(false);
  processingItem = signal(false);

  // Dialog Management - Product
  openProductDialog(): void {
    this.productJsonInput.set('');
    this.showProductDialog.set(true);
  }

  closeProductDialog(): void {
    this.showProductDialog.set(false);
    this.productJsonInput.set('');
  }

  // Dialog Management - Item
  openItemDialog(): void {
    this.itemJsonInput.set('');
    this.showItemDialog.set(true);
  }

  closeItemDialog(): void {
    this.showItemDialog.set(false);
    this.itemJsonInput.set('');
  }

  // Create Product from JSON
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

  // Create Item from JSON
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

  // Navigation
  goBack(): void {
    void this.router.navigate(['/admin']);
  }
}

