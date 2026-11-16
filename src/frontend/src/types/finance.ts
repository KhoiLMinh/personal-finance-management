// Shapes of the backend DTOs the screens read. Numbers arrive as JSON numbers (BigDecimal serialised by Jackson).

export type TxType = 'INCOME' | 'EXPENSE';

export interface Transaction {
  id: number;
  walletId: number;
  walletName: string;
  categoryId: number;
  categoryName: string;
  amount: number;
  type: TxType;
  date: string; // yyyy-MM-dd
  description: string | null;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface Budget {
  id: number;
  categoryId: number;
  categoryName: string;
  month: number;
  year: number;
  limitAmount: number;
  warningPercent: number | null;
  status: 'ACTIVE' | 'EXCEED';
}

export interface SavingGoal {
  id: number;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string; // yyyy-MM-dd
  status: 'IN_PROGRESS' | 'COMPLETE' | 'CANCELLED';
}

export interface Category {
  id: number;
  name: string;
  type: TxType;
  icon: string | null;
  color: string | null;
  hidden: boolean;
  parentId: number | null;
  system: boolean; // Jackson drops the "is" prefix of the backend field isSystem
}
