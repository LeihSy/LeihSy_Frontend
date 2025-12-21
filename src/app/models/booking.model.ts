export type BookingStatus =
  | 'PENDING'      // Wartet auf Bestätigung
  | 'CONFIRMED'    // Bestätigt, wartet auf Abholung
  | 'PICKED_UP'    // Ausgeliehen
  | 'RETURNED'     // Zurückgegeben
  | 'REJECTED'     // Abgelehnt
  | 'EXPIRED'      // Nicht abgeholt (24h nach Bestätigung)
  | 'CANCELLED';   // Storniert

export interface Booking {
  id: number;
  userId: number;
  userName: string;
  lenderId: number;
  lenderName: string;
  itemId: number;
  itemInvNumber: string;
  productId: number;
  productName: string;
  proposalById: number;
  proposalByName: string;
  message: string;
  status: BookingStatus;
  startDate: string;            // ISO DateTime
  endDate: string;
  proposedPickups: string;
  confirmedPickup: string;
  distributionDate: string;
  returnDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookingCreate {
  userId: number;
  receiverId: number;
  itemId: number;
  message: string;
  startDate: string;
  endDate: string;
  proposalPickup: string;
}

