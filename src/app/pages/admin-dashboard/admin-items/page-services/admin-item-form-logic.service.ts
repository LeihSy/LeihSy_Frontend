import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MessageService } from 'primeng/api';

import { ItemService } from '../../../../services/item.service';
import { ProductService } from '../../../../services/product.service';
import { UserService } from '../../../../services/user.service';
import { Item } from '../../../../models/item.model';
import { User } from '../../../../models/user.model';

export interface ItemFormHandler {
  patchOwnerName(name: string): void;
  patchOwnerId(id: number): void;
  patchLenderName(name: string): void;
  patchLenderId(id: number): void;
  setOwnerIdDisplayValue(value: string): void;
  setOwnerNameDisplayValue(value: string): void;
  setLenderDisplayValue(value: string): void;
  setOwnerFound(found: boolean): void;
  setLenderFound(found: boolean): void;
}

@Injectable()
export class AdminItemFormLogicService {
  private itemService = inject(ItemService);
  private productService = inject(ProductService);
  private userService = inject(UserService);
  private messageService = inject(MessageService);
  private router = inject(Router);

  handleOwnerIdChange(ownerId: number, formHandler: ItemFormHandler): void {
    this.userService.getUserById(ownerId).subscribe({
      next: (user: User) => {
        formHandler.patchOwnerName(user.name);
        formHandler.setOwnerIdDisplayValue(`Gefunden: ${user.name}`);
        formHandler.setOwnerFound(true);
      },
      error: () => {
        formHandler.setOwnerIdDisplayValue('Benutzer mit dieser ID nicht gefunden');
        formHandler.patchOwnerName('');
        formHandler.setOwnerFound(false);
      }
    });
  }

  handleOwnerNameChange(ownerName: string, formHandler: ItemFormHandler): void {
    this.userService.getUserByName(ownerName).subscribe({
      next: (user: User) => {
        formHandler.patchOwnerId(user.id);
        formHandler.setOwnerNameDisplayValue(`Gefunden: ID ${user.id}`);
        formHandler.setOwnerFound(true);
      },
      error: () => {
        formHandler.setOwnerNameDisplayValue('Benutzer mit diesem Namen nicht gefunden');
        formHandler.patchOwnerId(0);
        formHandler.setOwnerFound(false);
      }
    });
  }

  handleLenderIdChange(lenderId: number, formHandler: ItemFormHandler): void {
    this.userService.getUserById(lenderId).subscribe({
      next: (user: User) => {
        formHandler.patchLenderName(user.name);
        formHandler.setLenderDisplayValue(`Gefunden: ${user.name}`);
        formHandler.setLenderFound(true);
      },
      error: () => {
        formHandler.setLenderDisplayValue('Benutzer mit dieser ID nicht gefunden');
        formHandler.patchLenderName('');
        formHandler.setLenderFound(false);
      }
    });
  }

  handleLenderNameChange(lenderName: string, formHandler: ItemFormHandler): void {
    this.userService.getUserByName(lenderName).subscribe({
      next: (user: User) => {
        formHandler.patchLenderId(user.id);
        formHandler.setLenderDisplayValue(`Gefunden: ID ${user.id}`);
        formHandler.setLenderFound(true);
      },
      error: () => {
        formHandler.setLenderDisplayValue('Benutzer mit diesem Namen nicht gefunden');
        formHandler.patchLenderId(0);
        formHandler.setLenderFound(false);
      }
    });
  }

  generateInventoryNumbers(prefix: string, quantity: number, existingItems: Item[]): string[] {
    if (!prefix || quantity < 1) return [];

    console.log(`[generateInventoryNumbers] Prefix: ${prefix}, Anzahl Items: ${existingItems.length}`);

    // Filtere existierende Items mit dem gleichen Präfix
    const itemsWithPrefix = existingItems.filter(item => item.invNumber?.startsWith(prefix + '-'));
    console.log(`[generateInventoryNumbers] Items mit Präfix ${prefix}: ${itemsWithPrefix.length}`,
      itemsWithPrefix.map(i => i.invNumber));

    const existingNumbers = itemsWithPrefix
      .map(item => {
        // Extrahiere die Nummer nach dem Präfix (z.B. "PRV-001" -> 1)
        const parts = item.invNumber.split('-');
        if (parts.length >= 2) {
          const numberPart = parts.at(-1); // Letzter Teil nach dem letzten "-"
          const num = Number.parseInt(numberPart || '0', 10);
          return Number.isNaN(num) ? 0 : num;
        }
        return 0;
      })
      .filter(num => num > 0);

    console.log(`[generateInventoryNumbers] Extrahierte Nummern:`, existingNumbers);

    // Finde die höchste existierende Nummer
    const maxNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) : 0;
    let nextNumber = maxNumber + 1;

    console.log(`[generateInventoryNumbers] Höchste Nummer: ${maxNumber}, Nächste Nummer: ${nextNumber}`);

    // Generiere neue Inventarnummern
    const numbers: string[] = [];
    for (let i = 0; i < quantity; i++) {
      const paddedNumber = String(nextNumber).padStart(3, '0');
      const newNumber = `${prefix}-${paddedNumber}`;
      numbers.push(newNumber);
      nextNumber++;
    }

    console.log(`[generateInventoryNumbers] Generierte Nummern:`, numbers);
    return numbers;
  }

  updateItem(itemId: number, payload: any): Observable<Item> {
    return this.itemService.updateItem(itemId, payload).pipe(
      tap(() => {
        this.messageService.add({
          severity: 'success',
          summary: 'Erfolg',
          detail: 'Gegenstand erfolgreich aktualisiert'
        });
        this.navigateToItemList();
      })
    );
  }

  createItems(formValue: any): void {
    const quantity = formValue.quantity || 1;
    const baseInvNumber = formValue.invNumber;

    const itemsToCreate = [];
    for (let i = 0; i < quantity; i++) {
      const invNumber = quantity > 1
        ? `${baseInvNumber}-${(i + 1).toString().padStart(3, '0')}`
        : baseInvNumber;

      itemsToCreate.push({
        invNumber,
        owner: formValue.ownerName,
        lenderId: formValue.lenderId,
        productId: formValue.productId,
        available: formValue.available
      });
    }

    let successCount = 0;
    let errorCount = 0;

    itemsToCreate.forEach((item, index) => {
      this.itemService.createItem(item).subscribe({
        next: () => {
          successCount++;
          if (successCount + errorCount === itemsToCreate.length) {
            this.showFinalMessage(successCount, errorCount);
          }
        },
        error: () => {
          errorCount++;
          if (successCount + errorCount === itemsToCreate.length) {
            this.showFinalMessage(successCount, errorCount);
          }
        }
      });
    });
  }

  private showFinalMessage(successCount: number, errorCount: number): void {
    if (errorCount === 0) {
      this.messageService.add({
        severity: 'success',
        summary: 'Erfolg',
        detail: `${successCount} Gegenstand/Gegenstände erfolgreich erstellt`
      });
      this.navigateToItemList();
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'Teilweise erfolgreich',
        detail: `${successCount} erfolgreich, ${errorCount} fehlgeschlagen`
      });
    }
  }

  navigateToItemList(): void {
    this.router.navigate(['/admin/items']);
  }
}

