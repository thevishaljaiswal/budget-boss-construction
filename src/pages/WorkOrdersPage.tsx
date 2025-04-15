
import React from "react";
import { useAppContext } from "@/context/AppContext";
import PageHeader from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatCurrency } from "@/utils/formatters";
import { useNavigate } from "react-router-dom";

const WorkOrdersPage: React.FC = () => {
  const { purchaseOrders, projects, vendors } = useAppContext();
  const navigate = useNavigate();
  
  // Filter to show only Work Orders
  const workOrders = purchaseOrders.filter(po => po.type === "WO");
  
  return (
    <div className="space-y-8">
      <PageHeader
        title="Work Orders"
        description="Manage service and work orders for your construction projects."
        action={
          <Button onClick={() => navigate('/purchase-orders')}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Work Order
          </Button>
        }
      />

      <Card>
        <CardContent className="pt-6">
          {workOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-60 bg-secondary/30 rounded-lg">
              <p className="text-muted-foreground mb-4">No work orders have been created yet.</p>
              <Button onClick={() => navigate('/purchase-orders')}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create First Work Order
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">WO Number</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Project</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Vendor</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Issue Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Completion Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {workOrders.map((wo) => (
                    <tr key={wo.id} className="border-b hover:bg-secondary/30">
                      <td className="px-4 py-3">WO-{wo.id}</td>
                      <td className="px-4 py-3">
                        {projects.find(p => p.id === wo.projectId)?.name || 'Unknown'}
                      </td>
                      <td className="px-4 py-3">
                        {vendors.find(v => v.id === wo.vendorId)?.name || 'Unknown'}
                      </td>
                      <td className="px-4 py-3">{formatDate(wo.issueDate)}</td>
                      <td className="px-4 py-3">{formatDate(wo.deliveryDate)}</td>
                      <td className="px-4 py-3">{formatCurrency(wo.totalAmount)}</td>
                      <td className="px-4 py-3">
                        <Badge variant={
                          wo.status === 'Issued' ? 'default' :
                          wo.status === 'Draft' ? 'outline' :
                          wo.status === 'Completed' ? 'success' :
                          wo.status === 'Cancelled' ? 'destructive' : 'secondary'
                        }>
                          {wo.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm">View</Button>
                          {wo.status === 'Issued' && (
                            <Button size="sm">Complete</Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkOrdersPage;
