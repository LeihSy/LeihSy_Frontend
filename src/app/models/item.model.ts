export enum ItemStatus {
  AVAILABLE = 'AVAILABLE',
  RESERVED = 'RESERVED',
  BORROWED = 'BORROWED',
  MAINTENANCE = 'MAINTENANCE',
  UNAVAILABLE = 'UNAVAILABLE'
}

export interface Item {
  id: number;
  inventoryNumber: string;
  name: string;
  description: string;
  categoryId: number;
  categoryName: string;
  location: string;
  imageUrl?: string;
  status: ItemStatus;
  accessories?: string;
}

export interface ItemCreate {
  inventoryNumber: string;
  name: string;
  description?: string;
  categoryId: number;
  location?: string;
  imageUrl?: string;
  accessories?: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
}
