import { Component, OnInit, AfterViewInit, signal, ViewChild, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';

import { BackButtonComponent } from '../../../components/buttons/back-button/back-button.component';
import { ItemFormComponent } from '../../../components/admin/forms/item-form/item-form.component';
import { PrivateLendService } from '../../user-dashboard/user-private-lend/private-lend.service';
import { AdminItemFormPageService } from './services/admin-item-form-page.service';
import { AdminItemFormLogicService } from './services/admin-item-form-logic.service';
import { AdminPrivateImportService } from '../admin-private-management/admin-private-import.service';
import { AuthService } from '../../../services/auth.service';
import { Product } from '../../../models/product.model';

@Component({
  selector: 'app-admin-item-form-page',
  standalone: true,
  imports: [
    CommonModule,
    ToastModule,
    DialogModule,
    ButtonModule,
    TooltipModule,
    BackButtonComponent,
    ItemFormComponent
  ],
  providers: [MessageService, AdminItemFormPageService, AdminItemFormLogicService],
  template: `
    <div class="p-8 max-w-7xl mx-auto">
      <p-toast position="bottom-right"></p-toast>

      <app-back-button (backClick)="goBack()"></app-back-button>

      <app-item-form
        [item]="item()"
        [products]="allProducts()"
        [selectedProduct]="selectedProduct()"
        [isEditMode]="isEditMode()"
        [generatedInventoryNumbers]="generatedInventoryNumbers()"
        [mode]="isPrivateMode() ? 'private' : 'admin'"
        (formSubmit)="handleFormSubmit($event)"
        (formCancel)="goBack()"
        (inventoryPrefixChange)="handleInventoryPrefixChange($event)"
        (ownerIdChange)="handleOwnerIdChange($event)"
        (ownerNameChange)="handleOwnerNameChange($event)"
        (lenderIdChange)="handleLenderIdChange($event)"
        (lenderNameChange)="handleLenderNameChange($event)">
      </app-item-form>

      <!-- JSON Preview Dialog -->
      <p-dialog
        header="Gegenstand-Daten (JSON)"
        [(visible)]="showJsonDialog"
        [modal]="true"
        [style]="{width: '700px', maxHeight: '80vh'}"
        [draggable]="false"
        [resizable]="false">
        <div class="flex flex-col gap-4">
          <p class="text-sm text-gray-600">
            Kopieren Sie den folgenden JSON-String, um ihn per E-Mail zu versenden:
          </p>

          <div class="relative">
            <pre class="bg-gray-50 border border-gray-200 rounded p-4 overflow-auto max-h-96 text-sm">{{ jsonString() }}</pre>
            <button
              pButton
              type="button"
              icon="pi pi-copy"
              label="Kopieren"
              class="absolute top-2 right-2 p-button-sm"
              (click)="copyToClipboard()"
              pTooltip="In Zwischenablage kopieren">
            </button>
          </div>

          @if (copySuccess()) {
            <div class="text-green-600 text-sm flex items-center gap-2">
              <i class="pi pi-check-circle"></i>
              <span>In Zwischenablage kopiert!</span>
            </div>
          }
        </div>

        <ng-template pTemplate="footer">
          <button pButton type="button" label="Schließen" (click)="closeJsonDialog()"></button>
        </ng-template>
      </p-dialog>
    </div>
  `
})
export class AdminItemFormPageComponent implements OnInit, AfterViewInit {
  @ViewChild(ItemFormComponent) itemFormComponent!: ItemFormComponent;

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly pageService = inject(AdminItemFormPageService);
  private readonly logicService = inject(AdminItemFormLogicService);
  private readonly messageService = inject(MessageService);
  private readonly privateLendService = inject(PrivateLendService);
  private readonly importService = inject(AdminPrivateImportService);
  private readonly authService = inject(AuthService);

  // Use service signals directly
  item = this.pageService.item;
  allProducts = this.pageService.products;
  allItemsIncludingDeleted = this.pageService.allItems;

  // Local component signals
  selectedProduct = signal<Product | null>(null);
  generatedInventoryNumbers = signal<string[]>([]);
  isEditMode = signal(false);
  itemId: number | null = null;
  productId: number | null = null;

  // JSON Dialog Signals
  showJsonDialog = signal(false);
  jsonString = signal('');
  copySuccess = signal(false);

  // Signal für importierte Daten
  private pendingImportData = signal<any>(null);


  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    const productIdParam = this.route.snapshot.queryParamMap.get('productId');

    if (id) {
      this.itemId = Number.parseInt(id, 10);
      this.isEditMode.set(true);
      this.loadItem();
    } else {
      // Prüfe auf importierte Daten und speichere sie
      const navigation = this.router.getCurrentNavigation();
      const importedData = navigation?.extras?.state?.['importedData'];

      if (importedData) {
        this.pendingImportData.set(importedData);
      }
    }

    if (productIdParam) {
      this.productId = Number.parseInt(productIdParam, 10);
      this.loadSelectedProduct();
    }

    this.loadProducts();
    this.loadAllItemsIncludingDeleted();

    // Im Private-Modus: Generiere Inventarnummern mit PRV-Präfix
    if (this.isPrivateMode() && !this.isEditMode()) {
      // Warte kurz, bis alle Items geladen sind, dann generiere die Nummer
      setTimeout(() => {
        this.handleInventoryPrefixChange('PRV');
      }, 500);
    }
  }

  ngAfterViewInit(): void {
    // Lade importierte Daten nach dem View initialisiert wurde
    if (this.pendingImportData()) {
      setTimeout(() => {
        this.loadImportedData();
      }, 200);
    }
  }

  private loadImportedData(): void {
    const importedData = this.pendingImportData();

    if (!importedData || !this.itemFormComponent?.itemForm) {
      return;
    }

    // Befülle das Formular mit den importierten Daten
    this.itemFormComponent.itemForm.patchValue({
      invNumber: importedData.invNumber || 'PRV',
      ownerName: importedData.ownerName || '',
      lenderName: importedData.lenderName || '',
      productId: importedData.productId || null,
      available: importedData.available !== undefined ? importedData.available : true,
      quantity: importedData.quantity || 1
    });

    this.messageService.add({
      severity: 'success',
      summary: 'Daten geladen',
      detail: 'Die JSON-Daten wurden erfolgreich in das Formular geladen.'
    });

    // Lösche die gespeicherten Daten
    this.pendingImportData.set(null);
  }

  isPrivateMode(): boolean {
    const url = (globalThis as any).location?.pathname || '';
    return url.includes('/user-dashboard/private-lend');
  }

  loadItem(): void {
    if (!this.itemId) return;
    this.pageService.loadItem(this.itemId);
  }

  loadSelectedProduct(): void {
    if (!this.productId) return;

    this.pageService.loadProduct(this.productId).subscribe({
      next: (product) => {
        this.selectedProduct.set(product);
      },
      error: () => {
        // Error handling is done in service
      }
    });
  }

  loadProducts(): void {
    this.pageService.loadProducts();
  }

  loadAllItemsIncludingDeleted(): void {
    this.pageService.loadAllItems();
  }

  handleFormSubmit(formValue: any): void {
    if (formValue && ((formValue as any).privateMode || this.isPrivateMode())) {
      // Hole aktuellen User und Rollen
      const currentUser = this.authService.currentUser();
      const userRoles = this.authService.getRoles();

      console.log('Current User:', currentUser);
      console.log('User Roles:', userRoles);

      // Prüfe ob User Lender oder Admin ist
      const isLenderOrAdmin = userRoles.includes('lender') || userRoles.includes('admin');

      if (!isLenderOrAdmin) {
        // Zeige Warnung und biete Keycloak-Link an
        const keycloakUrl = 'http://localhost:8081/admin/master/console/#/LeihSy/users';

        this.messageService.add({
          severity: 'warn',
          summary: 'Fehlende Berechtigung',
          detail: 'Sie benötigen die "Lender" oder "Admin" Rolle um Gegenstände zu erstellen.'
        });

        if (confirm('Sie benötigen die "Lender" oder "Admin" Rolle um Gegenstände zu erstellen.\n\nMöchten Sie zur Keycloak-Admin-Konsole weitergeleitet werden, um die Rolle zu erhalten?')) {
          window.open(keycloakUrl, '_blank');
        }
        return;
      }

      if (!currentUser || !currentUser.id) {
        this.messageService.add({
          severity: 'error',
          summary: 'Fehler',
          detail: 'Kein Benutzer eingeloggt'
        });
        return;
      }

      // Private flow -> create JSON and show dialog
      const payload = { ...formValue };

      // Verwende die erste generierte Inventarnummer, falls vorhanden
      // Ansonsten erstelle eine mit PRV-Präfix und Timestamp
      if (this.generatedInventoryNumbers().length > 0) {
        payload.invNumber = this.generatedInventoryNumbers()[0];
      } else {
        // Fallback: PRV-Timestamp
        payload.invNumber = 'PRV-' + Date.now();
      }

      // Setze Location ID fest auf 7 (privat)
      payload.locationId = 7;

      // Füge User-IDs hinzu
      payload.ownerId = currentUser.id;
      payload.ownerName = payload.ownerName || currentUser.name;
      payload.lenderId = currentUser.id;
      payload.lenderName = payload.lenderName || currentUser.name;

      // Füge User-Rollen hinzu
      payload.userRoles = userRoles;

      // Erstelle JSON-String
      const jsonData = {
        type: 'item',
        timestamp: new Date().toISOString(),
        payload: payload
      };

      this.jsonString.set(JSON.stringify(jsonData, null, 2));
      this.showJsonDialog.set(true);
      this.copySuccess.set(false);

      this.messageService.add({
        severity: 'success',
        summary: 'Erfolg',
        detail: 'Gegenstand-Daten als JSON vorbereitet.'
      });
      return;
    }

    if (this.isEditMode() && this.itemId) {
      const payload = {
        invNumber: formValue.invNumber,
        owner: formValue.ownerName,
        lenderId: formValue.lenderId,
        productId: formValue.productId,
        available: formValue.available
      };

      this.pageService.updateItem(this.itemId, payload).subscribe({
        next: () => {
          // Success handling is done in service
        },
        error: () => {
          // Error handling is done in service
        }
      });
    } else {
      this.pageService.createItems(formValue);
    }
  }

  handleInventoryPrefixChange(prefix: string): void {
    if (this.isEditMode()) return;

    // Im Private-Modus immer PRV verwenden
    const finalPrefix = this.isPrivateMode() ? 'PRV' : prefix;

    const quantity = 1;
    if (finalPrefix) {
      const numbers = this.logicService.generateInventoryNumbers(finalPrefix, quantity, this.allItemsIncludingDeleted());
      this.generatedInventoryNumbers.set(numbers);
    } else {
      this.generatedInventoryNumbers.set([]);
    }
  }

  handleOwnerIdChange(ownerId: number): void {
    if (this.itemFormComponent) {
      this.logicService.handleOwnerIdChange(ownerId, this.itemFormComponent);
    }
  }

  handleOwnerNameChange(ownerName: string): void {
    if (this.itemFormComponent) {
      this.logicService.handleOwnerNameChange(ownerName, this.itemFormComponent);
    }
  }

  handleLenderIdChange(lenderId: number): void {
    if (this.itemFormComponent) {
      this.logicService.handleLenderIdChange(lenderId, this.itemFormComponent);
    }
  }

  handleLenderNameChange(lenderName: string): void {
    if (this.itemFormComponent) {
      this.logicService.handleLenderNameChange(lenderName, this.itemFormComponent);
    }
  }

  copyToClipboard(): void {
    const text = this.jsonString();
    navigator.clipboard.writeText(text).then(() => {
      this.copySuccess.set(true);
      this.messageService.add({
        severity: 'success',
        summary: 'Kopiert',
        detail: 'JSON wurde in die Zwischenablage kopiert!'
      });

      // Reset nach 3 Sekunden
      setTimeout(() => this.copySuccess.set(false), 3000);
    }).catch(err => {
      console.error('Fehler beim Kopieren:', err);
      this.messageService.add({
        severity: 'error',
        summary: 'Fehler',
        detail: 'Konnte nicht in Zwischenablage kopieren.'
      });
    });
  }

  closeJsonDialog(): void {
    this.showJsonDialog.set(false);
    this.copySuccess.set(false);
  }

  goBack(): void {
    this.logicService.navigateToItemList();
  }
}
