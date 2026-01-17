import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  InsyImportRequest,
  ImportStatusUpdateRequest,
  BatchImportRequest,
  ImportStatus,
  ImportAction,
  ImportType
} from '../models/insy-import.model';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class InsyImportService {
  private readonly apiUrl = `${environment.apiBaseURL}/api/insy`;

  constructor(private readonly http: HttpClient) {}

  /**
   * GET /api/insy/imports - Alle Import-Requests abrufen
   */
  getAllImportRequests(statusFilter?: ImportStatus | string): Observable<InsyImportRequest[]> {
    let params = new HttpParams();
    if (statusFilter && statusFilter !== 'ALL') {
      params = params.set('status', statusFilter);
    }
    return this.http.get<InsyImportRequest[]>(`${this.apiUrl}/imports`, { params });
  }

  /**
   * GET /api/insy/imports/{id} - Einzelnen Import-Request abrufen
   */
  getImportRequestById(id: number): Observable<InsyImportRequest> {
    return this.http.get<InsyImportRequest>(`${this.apiUrl}/imports/${id}`);
  }

  /**
   * GET /api/insy/imports/count - Zaehler abrufen
   */
  getImportCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.apiUrl}/imports/count`);
  }

  /**
   * PATCH /api/insy/imports/{id} - Import als neues Product genehmigen
   */
  importAsNewProduct(
    id: number,
    categoryId: number,
    locationId: number,
    options?: {
      price?: number;
      expiryDate?: number;
      invNumber?: string;
      lenderId?: number;
    }
  ): Observable<InsyImportRequest> {
    const body: ImportStatusUpdateRequest = {
      action: ImportAction.IMPORT,
      importType: ImportType.NEW_PRODUCT,
      categoryId,
      locationId,
      ...options
    };
    return this.http.patch<InsyImportRequest>(`${this.apiUrl}/imports/${id}`, body);
  }

  /**
   * PATCH /api/insy/imports/{id} - Import zu bestehendem Product hinzufuegen
   */
  importToExistingProduct(
    id: number,
    existingProductId: number,
    options?: {
      invNumber?: string;
      lenderId?: number;
    }
  ): Observable<InsyImportRequest> {
    const body: ImportStatusUpdateRequest = {
      action: ImportAction.IMPORT,
      importType: ImportType.EXISTING_PRODUCT,
      existingProductId,
      ...options
    };
    return this.http.patch<InsyImportRequest>(`${this.apiUrl}/imports/${id}`, body);
  }

  /**
   * PATCH /api/insy/imports/{id} - Import ablehnen
   */
  rejectImport(id: number, reason?: string): Observable<InsyImportRequest> {
    const body: ImportStatusUpdateRequest = {
      action: ImportAction.REJECT,
      rejectReason: reason
    };
    return this.http.patch<InsyImportRequest>(`${this.apiUrl}/imports/${id}`, body);
  }

  /**
   * PATCH /api/insy/imports/batch - Mehrere Imports zu einem Product hinzufuegen
   */
  batchImport(request: BatchImportRequest): Observable<InsyImportRequest[]> {
    return this.http.patch<InsyImportRequest[]>(`${this.apiUrl}/imports/batch`, request);
  }

  /**
   * POST /api/insy/mock/imports - Mock-Daten generieren (nur fuer Entwicklung)
   */
  createMockImports(count: number = 5): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/mock/imports?count=${count}`, {});
  }
}
