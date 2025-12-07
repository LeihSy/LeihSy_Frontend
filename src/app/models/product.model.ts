// Import Category and Location from dedicated model files
import { Category } from './category.model';
import { Location } from './location.model';

// Product DTO (vereinfachte Version für Listen/Übersichten)
export interface ProductDTO {
  id: number;
  name: string;
  description: string;
  expiryDate: number;           // int32
  price: number;
  imageUrl: string | null;
  accessories: string | null;   // JSON-String

  // Relations (nur IDs und Namen)
  categoryId: number;
  categoryName: string;
  locationId: number;
  locationRoomNr: string;

  // Availability
  availableItems: number;
  totalItems: number;

  // Timestamps
  createdAt: string;            // date-time
  updatedAt: string;            // date-time
}

// Product (vollständiges Schema mit expandierten Objekten)
export interface Product {
  id: number;
  name: string;
  description: string;
  expiryDate: number;           // int32
  price: number;
  imageUrl: string | null;
  accessories: string | null;   // JSON-String

  // Insy-spezifisch
  insyId?: number;

  // Expandierte Relations (vollständige Objekte)
  category?: Category;
  location?: Location;
  items?: any[];                // Item[]
  recommendedSets?: RecommendedSet[];

  // IDs für Beziehungen (falls nicht expandiert)
  categoryId?: number;
  locationId?: number;

  // Availability
  availableItemCount: number;
  totalItemCount: number;

  // Soft Delete
  deleted: boolean;
  deletedAt?: string | null;    // date-time

  // Timestamps
  createdAt: string;            // date-time
  updatedAt: string;            // date-time
}

// Hilfsobjekte für expandierte Relations


export interface RecommendedSet {
  id: number;
  name: string;
  products?: Product[];
}

// DTO für das Erstellen von Produkten
export interface ProductCreateDTO {
  name: string;
  description: string;
  categoryId: number;
  locationId: number;
  expiryDate: number;
  price: number;
  imageUrl?: string;
  accessories?: string;
  insyId?: number;
}

// DTO für das Aktualisieren von Produkten
export interface ProductUpdateDTO {
  name?: string;
  description?: string;
  categoryId?: number;
  locationId?: number;
  expiryDate?: number;
  price?: number;
  imageUrl?: string;
  accessories?: string;
  insyId?: number;
}
