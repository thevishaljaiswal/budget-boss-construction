
import React, { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import PageHeader from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AdvanceRequestForm from "@/components/forms/AdvanceRequestForm";
import AdvancePaymentForm from "@/components/forms/AdvancePaymentForm";
import { AdvanceRequest } from "@/types";

const AdvanceRequestsPage = () => {
  const { advanceRequests, projects } = useAppContext();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<AdvanceRequest | undefined>(undefined);

  const getProjectName = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId);
    return project ? project.name : "Unknown Project";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Draft":
        return <Badge variant="outline">Draft</Badge>;
      case "Submitted":
        return <Badge variant="secondary">Submitted</Badge>;
      case "Approved":
        return <Badge variant="success">Approved</Badge>;
      case "Rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      case "Paid":
        return <Badge variant="default">Paid</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handlePaymentClick = (request: AdvanceRequest) => {
    setSelectedRequest(request);
    setPaymentDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Advance Request Management"
        description="Request and track advance payments"
      />

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Advance Requests</h2>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>New Advance Request</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <AdvanceRequestForm onComplete={() => setDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Requested By</TableHead>
                <TableHead>Request Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Party Name</TableHead>
                <TableHead>Purpose</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Settlement Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {advanceRequests && advanceRequests.length > 0 ? (
                advanceRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>{getProjectName(request.projectId)}</TableCell>
                    <TableCell>{request.requestedBy}</TableCell>
                    <TableCell>{formatDate(request.requestDate)}</TableCell>
                    <TableCell>{request.advanceType}</TableCell>
                    <TableCell>{request.partyName}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{request.purpose}</TableCell>
                    <TableCell>{formatCurrency(request.amountRequested)}</TableCell>
                    <TableCell>{formatDate(request.expectedSettlementDate)}</TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell>
                      {request.status === "Approved" && (
                        <Button
                          size="sm"
                          onClick={() => handlePaymentClick(request)}
                        >
                          Record Payment
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-4">
                    No advance requests found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <AdvancePaymentForm 
            advanceRequest={selectedRequest} 
            onComplete={() => setPaymentDialogOpen(false)} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdvanceRequestsPage;
