export enum ProductStatus {
  AVAILABLE = 'AVAILABLE',
  BORROWED = 'BORROWED',
  MAINTENANCE = 'MAINTENANCE'
}

export interface Product {
  id: number;
  inventoryNumber: string;
  name: string;
  description: string;
  categoryId: number;
  categoryName: string;
  location: string;
  imageUrl: string | null;
  status: ProductStatus;
  accessories: string;
}

export interface ProductCreateDTO {
  inventoryNumber: string;
  name: string;
  description: string;
  categoryId: number;
  location: string;
  imageUrl?: string;
  status: ProductStatus;
  accessories?: string;
}
