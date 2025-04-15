
import React, { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import PageHeader from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, FileText, Camera } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/utils/formatters";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import GoodsReceiptForm from "@/components/forms/GoodsReceiptForm";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const GoodsReceiptPage: React.FC = () => {
  const { 
    goodsReceipts, 
    purchaseOrders, 
    vendors, 
    projects, 
    addGoodsReceipt 
  } = useAppContext();
  const [open, setOpen] = useState(false);

  const handleSubmit = (data: any) => {
    addGoodsReceipt(data);
    setOpen(false);
  };

  const renderAttachments = (grn: any) => {
    const attachments = [];
    
    if (grn.attachments?.photos) {
      attachments.push(
        <Badge key="photos" variant="outline" className="mr-1">
          <Camera className="h-3 w-3 mr-1" />
          Photos
        </Badge>
      );
    }
    
    if (grn.attachments?.dsr) {
      attachments.push(
        <Badge key="dsr" variant="outline">
          <FileText className="h-3 w-3 mr-1" />
          DSR
        </Badge>
      );
    }
    
    return attachments.length > 0 ? (
      <div className="flex flex-wrap gap-1">{attachments}</div>
    ) : (
      <span className="text-muted-foreground text-xs">None</span>
    );
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Goods Receipts & Service Confirmations"
        description="Record and track the delivery of materials and completion of services."
        action={
          <Button onClick={() => setOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Record Receipt
          </Button>
        }
      />

      <Card>
        <CardContent className="pt-6">
          {goodsReceipts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-60 bg-secondary/30 rounded-lg">
              <p className="text-muted-foreground mb-4">No receipts have been recorded yet.</p>
              <Button onClick={() => setOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Record First Receipt
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Receipt #</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>PO/WO Ref</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Receipt Date</TableHead>
                  <TableHead>Supervisor</TableHead>
                  <TableHead>Attachments</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {goodsReceipts.map((grn) => {
                  const po = purchaseOrders.find(po => po.id === grn.poId);
                  const vendor = vendors.find(v => v.id === po?.vendorId);
                  const project = projects.find(p => p.id === po?.projectId);
                  
                  return (
                    <TableRow key={grn.id}>
                      <TableCell>GRN-{grn.id}</TableCell>
                      <TableCell>{project?.name || 'Unknown'}</TableCell>
                      <TableCell>{po?.type}-{po?.id || 'Unknown'}</TableCell>
                      <TableCell>{vendor?.name || 'Unknown'}</TableCell>
                      <TableCell>{formatDate(grn.receiptDate)}</TableCell>
                      <TableCell>{grn.receivedBy}</TableCell>
                      <TableCell>{renderAttachments(grn)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">View</Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Record Goods Receipt / Service Confirmation</DialogTitle>
          </DialogHeader>
          <GoodsReceiptForm onClose={() => setOpen(false)} onSubmit={handleSubmit} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GoodsReceiptPage;
