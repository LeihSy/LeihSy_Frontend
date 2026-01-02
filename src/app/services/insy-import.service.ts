import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  InsyImportRequest,
  RejectImportRequest,
  ImportStatistics
} from '../models/insy-import.model';

@Injectable({
  providedIn: 'root'
})
export class InsyImportService {
  private readonly apiUrl = 'http://localhost:8080/api/insy';

  constructor(private http: HttpClient) {}

  /**
   * GET /api/insy/imports - Alle Import-Requests abrufen
   */
  getAllImportRequests(statusFilter?: string): Observable<InsyImportRequest[]> {
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
   * GET /api/insy/imports/count - Zähler abrufen
   */
  getStatistics(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/imports/count`);
  }

  /**
   * PATCH /api/insy/imports/{id} - Import genehmigen
   */
  approveImport(id: number): Observable<InsyImportRequest> {
    return this.http.patch<InsyImportRequest>(`${this.apiUrl}/imports/${id}`, {
      action: 'APPROVE'
    });
  }

  /**
   * PATCH /api/insy/imports/{id} - Import ablehnen
   */
  rejectImport(id: number, request: RejectImportRequest): Observable<InsyImportRequest> {
    return this.http.patch<InsyImportRequest>(`${this.apiUrl}/imports/${id}`, {
      action: 'REJECT',
      reason: request.reason
    });
  }

  /**
   * PATCH /api/insy/imports/batch - Mehrere Imports genehmigen
   */
  bulkApprove(ids: number[]): Observable<InsyImportRequest[]> {
    return this.http.patch<InsyImportRequest[]>(`${this.apiUrl}/imports/batch`, {
      ids,
      action: 'APPROVE'
    });
  }

  /**
   * PATCH /api/insy/imports/batch - Mehrere Imports ablehnen
   */
  bulkReject(ids: number[], reason?: string): Observable<InsyImportRequest[]> {
    return this.http.patch<InsyImportRequest[]>(`${this.apiUrl}/imports/batch`, {
      ids,
      action: 'REJECT',
      reason
    });
  }

  /**
   * PATCH /api/insy/imports/{id} - Import löschen
   */
  deleteImportRequest(id: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/imports/${id}`, {
      action: 'DELETE'
    });
  }

  /**
   * POST /api/insy/mock/imports - Mock-Daten generieren
   */
  refreshImports(): Observable<InsyImportRequest[]> {
    return this.http.post<InsyImportRequest[]>(`${this.apiUrl}/mock/imports`, {});
  }
}
