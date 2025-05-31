
import React, { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import PageHeader from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Eye, FileText, Users, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/utils/formatters";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import RFQForm from "@/components/forms/RFQForm";

const RequestForQuotationsPage: React.FC = () => {
  const { 
    requestForQuotations, 
    projects, 
    vendors, 
    vendorQuotations,
    purchaseRequests 
  } = useAppContext();
  const [open, setOpen] = useState(false);

  const getProjectName = (projectId: string) => {
    return projects.find(p => p.id === projectId)?.name || 'Unknown';
  };

  const getVendorNames = (vendorIds: string[]) => {
    return vendorIds.map(id => 
      vendors.find(v => v.id === id)?.name || 'Unknown'
    ).join(', ');
  };

  const getQuotationCount = (rfqId: string) => {
    return vendorQuotations.filter(q => q.rfqId === rfqId).length;
  };

  const getPRReferences = (prIds: string[]) => {
    return prIds.map(id => {
      const pr = purchaseRequests.find(p => p.id === id);
      return pr?.costCodeReference || 'Unknown';
    }).join(', ');
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Request for Quotations"
        description="Create and manage RFQs to gather vendor quotes for approved purchase requests."
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create RFQ
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[900px] max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Request for Quotation</DialogTitle>
                <DialogDescription>
                  Create a new RFQ based on approved purchase requests to gather quotes from vendors.
                </DialogDescription>
              </DialogHeader>
              <RFQForm onSuccess={() => setOpen(false)} />
            </DialogContent>
          </Dialog>
        }
      />

      <Card>
        <CardContent className="pt-6">
          {requestForQuotations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-60 bg-secondary/30 rounded-lg">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No RFQs have been created yet.</p>
              <Button onClick={() => setOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create First RFQ
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>RFQ Number</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>PR References</TableHead>
                    <TableHead>Vendors</TableHead>
                    <TableHead>Response Deadline</TableHead>
                    <TableHead>Quotations</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requestForQuotations.map((rfq) => (
                    <TableRow key={rfq.id}>
                      <TableCell className="font-medium">{rfq.rfqNumber}</TableCell>
                      <TableCell>{getProjectName(rfq.projectId)}</TableCell>
                      <TableCell>{rfq.title}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {getPRReferences(rfq.purchaseRequestIds)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{rfq.vendorIds.length}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{formatDate(rfq.responseDeadline)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getQuotationCount(rfq.id)} received
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          rfq.status === 'Awarded' ? 'success' :
                          rfq.status === 'Responses Received' ? 'default' :
                          rfq.status === 'Sent' ? 'outline' :
                          rfq.status === 'Evaluated' ? 'secondary' :
                          rfq.status === 'Cancelled' ? 'destructive' : 'secondary'
                        }>
                          {rfq.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          {rfq.status === 'Responses Received' && (
                            <Button size="sm">Evaluate</Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RequestForQuotationsPage;
