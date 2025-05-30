export interface Category {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  emoji?: string;
  userId?: string;
  isDefault: boolean;
  isActive: boolean;
  parentCategoryId?: string;
  subcategories?: Category[];
  order: number;
  budgetLimit?: number;
  spentAmount?: number;
  transactionCount?: number;
  tags: string[];
  rules?: CategoryRule[];
  createdAt: string;
  updatedAt?: string;
}

export interface CategoryRule {
  id: string;
  type: 'merchant_name' | 'amount_range' | 'keyword' | 'location';
  condition: 'contains' | 'equals' | 'starts_with' | 'ends_with' | 'greater_than' | 'less_than' | 'between';
  value: string | number | { min: number; max: number };
  priority: number;
  isActive: boolean;
}

export interface CategoryStats {
  totalSpent: number;
  transactionCount: number;
  averageAmount: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
  monthlyData: Array<{
    month: string;
    amount: number;
    count: number;
  }>;
  topMerchants: Array<{
    merchant: string;
    amount: number;
    count: number;
  }>;
}

export interface CategoryBudget {
  categoryId: string;
  budgetAmount: number;
  spentAmount: number;
  remainingAmount: number;
  percentage: number;
  status: 'under_budget' | 'near_limit' | 'over_budget';
  period: 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  endDate: string;
  alerts: BudgetAlert[];
}

export interface BudgetAlert {
  id: string;
  type: 'warning' | 'limit_reached' | 'over_budget';
  threshold: number;
  message: string;
  triggeredAt?: string;
  acknowledged: boolean;
}

export interface CategorySuggestion {
  category: string;
  confidence: number;
  reason: string;
  alternativeCategories: Array<{
    category: string;
    confidence: number;
  }>;
}

export interface CategoryHierarchy {
  id: string;
  name: string;
  level: number;
  children: CategoryHierarchy[];
  totalSpent: number;
  transactionCount: number;
}
 
