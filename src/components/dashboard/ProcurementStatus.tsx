
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppContext } from "@/context/AppContext";

const ProcurementStatus: React.FC = () => {
  const { purchaseRequests, purchaseOrders } = useAppContext();
  
  // Count PRs by status
  const prStatusCounts = {
    draft: purchaseRequests.filter(pr => pr.status === 'Draft').length,
    pending: purchaseRequests.filter(pr => pr.status === 'Pending Approval').length,
    approved: purchaseRequests.filter(pr => pr.status === 'Approved').length,
    converted: purchaseRequests.filter(pr => pr.status === 'Converted to PO').length,
    rejected: purchaseRequests.filter(pr => pr.status === 'Rejected').length
  };
  
  // Count POs by status
  const poStatusCounts = {
    draft: purchaseOrders.filter(po => po.status === 'Draft').length,
    issued: purchaseOrders.filter(po => po.status === 'Issued').length,
    partiallyReceived: purchaseOrders.filter(po => po.status === 'Partially Received').length,
    completed: purchaseOrders.filter(po => po.status === 'Completed').length,
    cancelled: purchaseOrders.filter(po => po.status === 'Cancelled').length
  };
  
  return (
    <Card className="col-span-3 lg:col-span-1">
      <CardHeader>
        <CardTitle className="text-md font-medium">Procurement Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-5">
          <div>
            <h3 className="text-sm font-medium mb-2">Purchase Requests</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex justify-between p-2 bg-secondary rounded">
                <span className="text-xs">Pending</span>
                <span className="font-bold">{prStatusCounts.pending}</span>
              </div>
              <div className="flex justify-between p-2 bg-secondary rounded">
                <span className="text-xs">Approved</span>
                <span className="font-bold">{prStatusCounts.approved}</span>
              </div>
              <div className="flex justify-between p-2 bg-secondary rounded">
                <span className="text-xs">Converted</span>
                <span className="font-bold">{prStatusCounts.converted}</span>
              </div>
              <div className="flex justify-between p-2 bg-secondary rounded">
                <span className="text-xs">Draft</span>
                <span className="font-bold">{prStatusCounts.draft}</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-2">Purchase Orders</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex justify-between p-2 bg-secondary rounded">
                <span className="text-xs">Issued</span>
                <span className="font-bold">{poStatusCounts.issued}</span>
              </div>
              <div className="flex justify-between p-2 bg-secondary rounded">
                <span className="text-xs">Received</span>
                <span className="font-bold">{poStatusCounts.partiallyReceived}</span>
              </div>
              <div className="flex justify-between p-2 bg-secondary rounded">
                <span className="text-xs">Completed</span>
                <span className="font-bold">{poStatusCounts.completed}</span>
              </div>
              <div className="flex justify-between p-2 bg-secondary rounded">
                <span className="text-xs">Draft</span>
                <span className="font-bold">{poStatusCounts.draft}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProcurementStatus;
