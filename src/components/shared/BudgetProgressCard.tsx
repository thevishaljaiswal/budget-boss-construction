
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatPercentage, getBudgetStatusColor, calculateBudgetUtilization } from "@/utils/formatters";

interface BudgetProgressCardProps {
  title: string;
  totalBudget: number;
  committedBudget: number;
  actualSpend: number;
  icon?: React.ReactNode;
}

const BudgetProgressCard: React.FC<BudgetProgressCardProps> = ({
  title,
  totalBudget,
  committedBudget,
  actualSpend,
  icon,
}) => {
  const budgetUtilization = calculateBudgetUtilization(committedBudget, totalBudget);
  const statusColor = getBudgetStatusColor(committedBudget, totalBudget);
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="w-4 h-4 text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatCurrency(totalBudget)}</div>
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Budget Utilization: {formatPercentage(budgetUtilization)}</span>
            <span>{formatCurrency(committedBudget)} / {formatCurrency(totalBudget)}</span>
          </div>
          <div className="budget-progress">
            <div
              className={`budget-progress-bar ${statusColor}`}
              style={{ width: `${Math.min(budgetUtilization, 100)}%` }}
            ></div>
          </div>
        </div>
        <div className="flex justify-between mt-4 text-sm">
          <div>
            <p className="text-muted-foreground text-xs">Committed</p>
            <p className="font-medium">{formatCurrency(committedBudget)}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Spent</p>
            <p className="font-medium">{formatCurrency(actualSpend)}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Remaining</p>
            <p className="font-medium">{formatCurrency(totalBudget - committedBudget)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BudgetProgressCard;
