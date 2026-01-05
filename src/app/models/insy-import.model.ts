/**
 * InSy Import Models
 * Interfaces fuer die Kommunikation mit dem Backend InSy-Import-System
 */

/**
 * Status einer Import-Anfrage (muss mit Backend InsyImportStatus enum uebereinstimmen)
 */
export enum ImportStatus {
  PENDING = 'PENDING',
  IMPORTED = 'IMPORTED',
  REJECTED = 'REJECTED',
  UPDATED = 'UPDATED'
}

/**
 * Import-Typ fuer neue Imports
 */
export enum ImportType {
  NEW_PRODUCT = 'NEW_PRODUCT',
  EXISTING_PRODUCT = 'EXISTING_PRODUCT'
}

/**
 * Action fuer Status-Updates
 */
export enum ImportAction {
  IMPORT = 'IMPORT',
  REJECT = 'REJECT'
}

/**
 * InSy Import Item DTO (Response vom Backend)
 * Entspricht InsyImportItemDTO.java
 */
export interface InsyImportRequest {
  id: number;
  insyId: number;
  invNumber: string;
  name: string;
  description: string | null;
  location: string | null;
  owner: string | null;
  status: ImportStatus;
  createdAt: string;
  processedAt: string | null;

  // Matching-Info (vom Backend enriched)
  hasMatchingProduct: boolean;
  matchingProductId: number | null;
  matchingProductName: string | null;

  // Nach Import gesetzte Felder
  createdProductId: number | null;
  createdProductName: string | null;
  createdItemId: number | null;
  rejectReason: string | null;
}

/**
 * Request DTO fuer PATCH /api/insy/imports/{id}
 * Entspricht InsyImportStatusUpdateDTO.java
 */
export interface ImportStatusUpdateRequest {
  action: ImportAction;

  // Felder fuer IMPORT action
  importType?: ImportType;
  existingProductId?: number;
  categoryId?: number;
  locationId?: number;
  price?: number;
  expiryDate?: number;
  invNumber?: string;
  lenderId?: number;

  // Felder fuer REJECT action
  rejectReason?: string;
}

/**
 * Request DTO fuer Batch-Import
 * Entspricht InsyBatchImportRequestDTO.java
 */
export interface BatchImportRequest {
  importItemIds: number[];
  productId: number;
  lenderId?: number;
  invNumberPrefix?: string;
}

/**
 * DTO fuer das Ablehnen eines Imports (vereinfacht)
 */
export interface RejectImportRequest {
  reason?: string;
}

/**
 * Statistiken fuer das Dashboard
 */
export interface ImportStatistics {
  totalPending: number;
  totalImported: number;
  totalRejected: number;
  totalUpdated: number;
}

/**
 * Filter-Optionen fuer Import-Liste
 */
export interface ImportFilter {
  status?: ImportStatus;
  search?: string;
}

/**
 * Kategorie (fuer Dropdown im Import-Dialog)
 */
export interface CategoryOption {
  id: number;
  name: string;
}

/**
 * Location (fuer Dropdown im Import-Dialog)
 */
export interface LocationOption {
  id: number;
  roomNr: string;
}

/**
 * Product (fuer Dropdown bei EXISTING_PRODUCT)
 */
export interface ProductOption {
  id: number;
  name: string;
  categoryName: string | null;
}
