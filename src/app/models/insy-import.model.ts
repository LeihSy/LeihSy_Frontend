/**
 * InSy Import Request Model
 * Repräsentiert eine Import-Anfrage aus dem InSy-System
 */
export interface InsyImportRequest {
  id: number;
  insyId: number;
  invNumber: string;
  name: string;
  description: string | null;
  category: string;
  roomNr: string;
  status: ImportStatus;
  createdAt: string;
  processedAt: string | null;
  processedBy: string | null;
}

/**
 * Status einer Import-Anfrage
 */
export enum ImportStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

/**
 * DTO für das Importieren eines Items
 */
export interface ImportItemRequest {
  importRequestId: number;
  productId?: number;  // Optional: Falls Produkt bereits existiert
  lenderId?: number;   // Optional: Falls Verleiher zugewiesen werden soll
}

/**
 * DTO für das Ablehnen eines Imports
 * Die importRequestId wird separat als Parameter übergeben
 */
export interface RejectImportRequest {
  reason?: string;
}

/**
 * Statistiken für das Dashboard
 */
export interface ImportStatistics {
  totalPending: number;
  totalApproved: number;
  totalRejected: number;
  newRequestsToday: number;
}

/**
 * Gruppierte Import-Requests (z.B. nach Kategorie)
 */
export interface GroupedImportRequests {
  category: string;
  requests: InsyImportRequest[];
  count: number;
}

/**
 * Filter-Optionen für Import-Liste
 */
export interface ImportFilter {
  status?: ImportStatus;
  category?: string;
  searchQuery?: string;
  fromDate?: Date;
  toDate?: Date;
}
