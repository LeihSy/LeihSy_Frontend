export interface Device {
  id: string;
  name: string;
  inventoryNumber: string;
  category: string;
  image?: string;
  description: string;
  technicalSpecs: {
    storage?: string;
    sensor?: string;
    accessories?: string[];
  };
  keywords: string[];
  availability: {
    total: number;
    available: number;
    borrowed: number;
  };
  campusAvailability: {
    campus: string;
    location: string;
    available: number;
    total: number;
  }[];
  loanConditions: {
    loanPeriod: string;
    extensions: string;
    notes: string;
  };
}

export interface Loan {
  id: string;
  deviceName: string;
  inventoryNumber: string;
  status: 'active' | 'overdue' | 'reserved';
  borrowedDate: string;
  dueDate: string;
  campus: string;
  remainingDays: number;
  extensionsUsed: number;
  maxExtensions: number;
}
