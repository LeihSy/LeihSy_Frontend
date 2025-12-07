// CategoryDTO (vereinfachte Version für Listen/Übersichten)
export interface CategoryDTO {
  id: number;                   // int64
  name: string;
  createdAt: string;            // date-time
  updatedAt: string;            // date-time
}

// Category (vollständiges Schema mit expandierten Objekten)
export interface Category {
  id: number;
  name: string;

  // Expandierte Relations (vollständige Objekte)
  products?: any[];             // Product[]

  // Soft Delete
  deleted: boolean;
  deletedAt?: string | null;    // date-time

  // Timestamps
  createdAt: string;            // date-time
  updatedAt: string;            // date-time
}


// CategoryCreateDTO (für das Erstellen von Kategorien)
export interface CategoryCreateDTO {
  name: string;
  description?: string;
}

// CategoryUpdateDTO (für das Aktualisieren von Kategorien)
export interface CategoryUpdateDTO {
  name?: string;
  description?: string;
}

