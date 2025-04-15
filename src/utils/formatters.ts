
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatPercentage = (percentage: number): string => {
  return `${percentage.toFixed(1)}%`;
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
};

export const formatNumber = (number: number): string => {
  return new Intl.NumberFormat('en-US').format(number);
};

export const calculateBudgetUtilization = (
  committed: number,
  total: number
): number => {
  if (total === 0) return 0;
  return (committed / total) * 100;
};

export const getBudgetStatusColor = (
  committed: number,
  total: number
): 'safe' | 'warning' | 'danger' => {
  const utilization = calculateBudgetUtilization(committed, total);
  if (utilization < 70) return 'safe';
  if (utilization < 90) return 'warning';
  return 'danger';
};

export const generateUniqueId = (): string => {
  return Math.random().toString(36).substring(2, 11);
};
