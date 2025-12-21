// LocationDTO (vereinfachte Version für Listen/Übersichten)
export interface LocationDTO {
  id: number;                   // int64
  roomNr: string;
  createdAt: string;            // date-time
  updatedAt: string;            // date-time
}

// Location (vollständiges Schema mit expandierten Objekten)
export interface Location {
  id: number;                   // int64
  roomNr: string;

  // Expandierte Relations (vollständige Objekte)
  products?: any[];             // Product[]

  // Soft Delete
  deleted: boolean;
  deletedAt?: string | null;    // date-time

  // Timestamps
  createdAt: string;            // date-time
  updatedAt: string;            // date-time
}

// LocationCreateDTO (für das Erstellen von Locations)
export interface LocationCreateDTO {
  roomNr: string;
  building?: string;
  floor?: string;
}

// LocationUpdateDTO (für das Aktualisieren von Locations)
export interface LocationUpdateDTO {
  roomNr?: string;
  building?: string;
  floor?: string;
}

