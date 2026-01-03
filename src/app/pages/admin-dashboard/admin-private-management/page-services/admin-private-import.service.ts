import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ProductService } from '../../../../services/product.service';
import { ItemService } from '../../../../services/item.service';

export interface JsonImportData {
  type: 'product' | 'item';
  timestamp?: string;
  payload: any;
}

export interface ImportResult {
  success: boolean;
  error?: string;
  observable?: Observable<any>;
}

@Injectable({
  providedIn: 'root'
})
export class AdminPrivateImportService {
  private readonly productService = inject(ProductService);
  private readonly itemService = inject(ItemService);

  /**
   * Verarbeitet den JSON-String und erstellt direkt das Produkt/Item
   */
  processJsonImport(jsonString: string): ImportResult {
    try {
      const jsonData: JsonImportData = JSON.parse(jsonString);

      if (!jsonData.payload) {
        return { success: false, error: 'JSON muss ein "payload" Feld enthalten' };
      }

      if (jsonData.type === 'product') {
        return this.createProduct(jsonData.payload);
      } else if (jsonData.type === 'item') {
        return this.createItem(jsonData.payload);
      } else {
        return { success: false, error: 'JSON Typ muss "product" oder "item" sein' };
      }
    } catch (error: any) {
      return { success: false, error: 'Ungültiger JSON-String: ' + error.message };
    }
  }

  /**
   * Erstellt direkt ein Produkt via POST
   */
  private createProduct(payload: any): ImportResult {
    console.log('Creating Product with original payload:', payload);

    // Transformiere das Payload in das korrekte ProductCreateDTO Format
    const productDTO = {
      name: payload.name,
      description: payload.description || '',
      categoryId: Number(payload.categoryId),
      locationId: payload.locationId === 'privat' ? 7 : Number(payload.locationId),
      expiryDate: Number(payload.expiryDate) || 0,
      price: Number(payload.price) || 0,
      imageUrl: payload.imageUrl || '',
      accessories: payload.accessories || ''
    };

    console.log('Transformed Product DTO:', productDTO);

    const observable = this.productService.createProduct(productDTO, null);
    return { success: true, observable };
  }

  /**
   * Erstellt direkt ein Item via POST
   */
  private createItem(payload: any): ImportResult {
    console.log('Creating Item with original payload:', payload);

    // Transformiere das Payload in das korrekte ItemCreate Format
    const itemDTO = {
      invNumber: payload.invNumber || payload.invnumber || 'PRV-' + Date.now(),
      owner: payload.owner || payload.ownerName || '',
      productId: Number(payload.productId),
      lenderId: payload.lenderId || 0,
      isAvailable: payload.available !== undefined ? payload.available : true
    };

    console.log('Transformed Item DTO:', itemDTO);

    const observable = this.itemService.createItem(itemDTO);
    return { success: true, observable };
  }
}

