export interface Product {
  id: number;
  name: string;
  description: string;
  expiryDate: number;
  price: number;
  imageUrl: string | null;
  accessories: string | null; // JSON-String

  // Relations
  categoryId: number;
  categoryName: string;
  locationId: number;
  locationRoomNr: string;
  lenderId: number;
  lenderName: string;

  // Availability
  availableItems: number;
  totalItems: number;

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface ProductCreateDTO {
  name: string;
  description: string;
  categoryId: number;
  locationId: number;
  lenderId: number;
  expiryDate: number;
  price: number;
  imageUrl?: string;
  accessories?: string;
}
