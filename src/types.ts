export interface MerchantDetails {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AcmeMerchantDetails {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface AcmeMerchantTransaction {
  id: string;
  amount: string;
  type: string;
  customer: string;
  merchant: string;
  order: string;
  created_at: string;
  updated_at: string;
}

export interface MerchantTransaction {
  id: string;
  amount: number;
  type: "SALE" | "REFUND";
  customer: string;
  merchant: string;
  order: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Page<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
