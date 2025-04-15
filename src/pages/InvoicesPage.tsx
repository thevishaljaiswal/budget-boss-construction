
import React, { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { Invoice } from "@/types";
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
import InvoiceForm from "@/components/forms/InvoiceForm";
import AdvanceAdjustmentForm from "@/components/forms/AdvanceAdjustmentForm";
import InvoicePaymentForm from "@/components/forms/InvoicePaymentForm";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Landmark } from "lucide-react";

const InvoicesPage = () => {
  const { invoices, vendors, purchaseOrders, advancePayments, advanceAdjustments } = useAppContext();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [adjustmentDialogOpen, setAdjustmentDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | undefined>(undefined);

  const getVendorName = (vendorId: string) => {
    const vendor = vendors.find((v) => v.id === vendorId);
    return vendor ? vendor.name : "Unknown Vendor";
  };

  const getPoReference = (poId: string) => {
    const po = purchaseOrders.find((p) => p.id === poId);
    return po ? po.id : "Unknown PO";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending":
        return <Badge variant="outline">Pending</Badge>;
      case "Approved":
        return <Badge variant="secondary">Approved</Badge>;
      case "Paid":
        return <Badge variant="success">Paid</Badge>;
      case "Disputed":
        return <Badge variant="destructive">Disputed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Check if an invoice has available advances for adjustment
  const hasAvailableAdvances = (invoice: Invoice) => {
    return advancePayments.some(
      (payment) => 
        payment.partyId === invoice.vendorId && 
        payment.remainingAmount > 0
    );
  };

  // Calculate total adjusted amount for an invoice
  const getAdjustedAmount = (invoiceId: string) => {
    return advanceAdjustments
      .filter(adj => adj.invoiceId === invoiceId)
      .reduce((sum, adj) => sum + adj.adjustedAmount, 0);
  };

  const handleAdjustmentClick = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setAdjustmentDialogOpen(true);
  };

  const handlePaymentClick = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setPaymentDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoice Management"
        description="Track and manage vendor invoices"
      />

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Invoice List</h2>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>Book New Invoice</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <InvoiceForm onComplete={() => setDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice Number</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>PO/WO Reference</TableHead>
                <TableHead>Amount Claimed</TableHead>
                <TableHead>Amount Approved</TableHead>
                <TableHead>Advance Adjusted</TableHead>
                <TableHead>Net Payable</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices && invoices.length > 0 ? (
                invoices.map((invoice) => {
                  const adjustedAmount = getAdjustedAmount(invoice.id);
                  const netPayable = invoice.amountApproved - adjustedAmount;
                  
                  return (
                    <TableRow key={invoice.id}>
                      <TableCell>{invoice.invoiceNumber}</TableCell>
                      <TableCell>{getVendorName(invoice.vendorId)}</TableCell>
                      <TableCell>{formatDate(invoice.invoiceDate)}</TableCell>
                      <TableCell>{getPoReference(invoice.poId)}</TableCell>
                      <TableCell>{formatCurrency(invoice.amountClaimed)}</TableCell>
                      <TableCell>{formatCurrency(invoice.amountApproved)}</TableCell>
                      <TableCell>{formatCurrency(adjustedAmount)}</TableCell>
                      <TableCell>{formatCurrency(netPayable)}</TableCell>
                      <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {hasAvailableAdvances(invoice) && invoice.status !== "Paid" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAdjustmentClick(invoice)}
                              className="flex items-center gap-1"
                            >
                              <CreditCard className="h-4 w-4" />
                              <span>Adjust</span>
                            </Button>
                          )}
                          {invoice.status !== "Paid" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePaymentClick(invoice)}
                              className="flex items-center gap-1"
                            >
                              <Landmark className="h-4 w-4" />
                              <span>Pay</span>
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-4">
                    No invoices found. Book a new invoice to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Adjustment Dialog */}
      <Dialog open={adjustmentDialogOpen} onOpenChange={setAdjustmentDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <AdvanceAdjustmentForm 
            invoice={selectedInvoice} 
            onComplete={() => setAdjustmentDialogOpen(false)} 
          />
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <InvoicePaymentForm 
            invoice={selectedInvoice} 
            onComplete={() => setPaymentDialogOpen(false)} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InvoicesPage;
