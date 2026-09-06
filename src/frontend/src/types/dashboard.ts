export interface CategoryExpense {
  categoryId: number;
  categoryName: string;
  color: string;
  totalAmount: number;
}

export interface TrendData {
  date: string;
  income: number;
  expense: number;
}

export interface DashboardOverview {
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
  incomeChangePercent: number;
  expenseChangePercent: number;
  expenseByCategory: CategoryExpense[];
  trendData: TrendData[];
}
