export interface Item {
  id: number;
  invNumber: string;            // Inventarnummer z.B. "VR-001"
  owner: string;                // Besitzer
  productId: number;
  productName: string;
  available: boolean;
}

export interface ItemCreate {
  invNumber: string;
  owner: string;
  productId: number;
  available?: boolean;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
}
