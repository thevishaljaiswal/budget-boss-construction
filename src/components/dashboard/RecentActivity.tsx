
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppContext } from "@/context/AppContext";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { Badge } from "@/components/ui/badge";

const RecentActivity: React.FC = () => {
  const { purchaseOrders, purchaseRequests } = useAppContext();
  
  // Combine purchase orders and purchase requests for the activity feed
  const activities = [
    ...purchaseOrders.map(po => ({
      id: `po-${po.id}`,
      type: 'Purchase Order',
      status: po.status,
      date: po.issueDate,
      amount: po.totalAmount,
      projectId: po.projectId,
      reference: `PO-${po.id}`
    })),
    ...purchaseRequests.map(pr => ({
      id: `pr-${pr.id}`,
      type: 'Purchase Request',
      status: pr.status,
      date: pr.requestDate,
      amount: 0, // PRs don't have amount
      projectId: pr.projectId,
      reference: `PR-${pr.id}`
    }))
  ];
  
  // Sort by date (newest first) and limit to 5
  const recentActivities = activities
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <Card className="col-span-3 lg:col-span-1">
      <CardHeader>
        <CardTitle className="text-md font-medium">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentActivities.length === 0 ? (
            <p className="text-center text-muted-foreground">No recent activity</p>
          ) : (
            recentActivities.map(activity => (
              <div key={activity.id} className="flex items-start justify-between pb-4 border-b last:border-0 last:pb-0">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{activity.type}: {activity.reference}</h4>
                    <Badge variant="outline">{activity.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{formatDate(activity.date)}</p>
                </div>
                {activity.amount > 0 && (
                  <div className="text-right">
                    <span className="font-medium">{formatCurrency(activity.amount)}</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
