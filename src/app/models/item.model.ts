// ItemDTO (vereinfachte Version für Listen/Übersichten)
export interface ItemDTO {
  id: number;
  invNumber: string;            // Inventarnummer z.B. "VR-001"
  owner: string;                // Besitzer

  // Lender (Verleiher)
  lenderId: number;
  lenderName: string;

  // Product
  productId: number;
  productName: string;

  // Status
  available: boolean;

  // Timestamps
  createdAt: string;            // date-time
  updatedAt: string;            // date-time
}

// Item (vollständiges Schema mit expandierten Objekten)
export interface Item {
  id: number;
  invNumber: string;            // Inventarnummer z.B. "VR-001"
  owner: string;                // Besitzer

  // Insy-spezifisch
  insyId?: number;

  // Expandierte Relations (vollständige Objekte)
  product?: any;                // Product object
  lender?: any;                 // User/Lender object
  bookings?: any[];             // Booking[]

  // IDs für Beziehungen (falls nicht expandiert)
  productId?: number;
  lenderId?: number;

  // Für Abwärtskompatibilität mit bestehendem Code
  productName?: string;
  lenderName?: string;

  // Status
  available: boolean;

  // Soft Delete
  deleted: boolean;
  deletedAt?: string | null;    // date-time

  // Timestamps
  createdAt: string;            // date-time
  updatedAt: string;            // date-time
}

// ItemCreateRequestDTO (für das Erstellen von Items)
export interface ItemCreateRequestDTO {
  invNumber: string;
  owner: string;
  productId: number;
  lenderId: number;
}

// Legacy-Support: Alias für bestehenden Code
export interface ItemCreate extends ItemCreateRequestDTO {
  available?: boolean;          // Optional für Abwärtskompatibilität
}

