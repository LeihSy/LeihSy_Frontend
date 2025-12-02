export interface User {
  id: number;
  uniqueId: string;             // Keycloak ID
  name: string;
  budget: number;
}

export interface UserCreateDTO {
  uniqueId: string;             // Keycloak ID
  name: string;
  budget?: number;              // Optional beim Erstellen, Standard könnte im Backend gesetzt werden
}

export interface UserUpdateDTO {
  name?: string;
  budget?: number;
}

