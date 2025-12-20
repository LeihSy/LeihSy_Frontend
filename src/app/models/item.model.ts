export interface Item {
  id: number;
  invNumber: string;            // Inventarnummer z.B. "VR-001"
  owner: string;                // Besitzer
  lenderId?: number;            // Verleiher ID
  lenderName?: string;          // Verleiher Name
  productId: number;
  productName: string;
  isAvailable: boolean;         // Backend gibt isAvailable zurück
  createdAt?: string;
  updatedAt?: string;
}

export interface ItemCreate {
  invNumber: string;
  owner: string;
  productId: number;
  available?: boolean;          // Beim Erstellen bleibt es "available" (Backend erwartet das)
}

export interface Category {
  id: number;
  name: string;
  description?: string;
}
