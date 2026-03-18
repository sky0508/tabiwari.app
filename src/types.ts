export interface Expense {
  id: string;
  title: string;
  category: string;
  amount: number;
  currency: string;
  payer: string;
  splitAmong: string[];
  timestamp: number;
  date?: string; // "YYYY-MM-DD"
}

export interface Trip {
  id: string;
  name: string;
  members: string[];
  foreignCurrency: string;
  exchangeRate: number;
  expenses: Expense[];
  createdAt: number;
}

export interface PerPersonData {
  paid: number;
  owes: number;
  categories: Record<string, number>;
}

export interface Transfer {
  from: string;
  to: string;
  amount: number;
}

export interface Settlement {
  perPerson: Record<string, PerPersonData>;
  transfers: Transfer[];
  total: number;
  balances: Record<string, number>;
}
