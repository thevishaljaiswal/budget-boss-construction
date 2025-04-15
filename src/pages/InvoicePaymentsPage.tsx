
import React, { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { Invoice, InvoicePayment } from "@/types";
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
import InvoicePaymentForm from "@/components/forms/InvoicePaymentForm";
import { Badge } from "@/components/ui/badge";
import { Landmark, Pencil } from "lucide-react";

const InvoicePaymentsPage = () => {
  const { invoicePayments, vendors, invoices } = useAppContext();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<InvoicePayment | undefined>(undefined);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | undefined>(undefined);

  const getVendorName = (vendorId: string) => {
    const vendor = vendors.find((v) => v.id === vendorId);
    return vendor ? vendor.name : "Unknown Vendor";
  };

  const getInvoiceNumber = (invoiceId: string) => {
    const invoice = invoices.find((i) => i.id === invoiceId);
    return invoice ? invoice.invoiceNumber : "Unknown Invoice";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Completed":
        return <Badge variant="success">Completed</Badge>;
      case "Pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "Failed":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleNewPayment = () => {
    setSelectedPayment(undefined);
    setSelectedInvoice(undefined);
    setDialogOpen(true);
  };

  const handleEditPayment = (payment: InvoicePayment) => {
    setSelectedPayment(payment);
    setSelectedInvoice(invoices.find(inv => inv.id === payment.invoiceId));
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoice Payments"
        description="Track and manage payments made to vendors"
      />

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Payment List</h2>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNewPayment}>
              <Landmark className="mr-2 h-4 w-4" />
              Create New Payment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <InvoicePaymentForm 
              onComplete={() => setDialogOpen(false)} 
              invoice={selectedInvoice} 
              editingPayment={selectedPayment}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendor</TableHead>
                <TableHead>Invoice Number</TableHead>
                <TableHead>Payment Date</TableHead>
                <TableHead>Reference No</TableHead>
                <TableHead>Payment Mode</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Deductions</TableHead>
                <TableHead>Adjustments</TableHead>
                <TableHead>Net Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoicePayments && invoicePayments.length > 0 ? (
                invoicePayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{getVendorName(payment.vendorId)}</TableCell>
                    <TableCell>{getInvoiceNumber(payment.invoiceId)}</TableCell>
                    <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                    <TableCell>{payment.referenceNo}</TableCell>
                    <TableCell>{payment.paymentMode}</TableCell>
                    <TableCell>{formatCurrency(payment.amountPaid)}</TableCell>
                    <TableCell>
                      {formatCurrency((payment.tdsAmount || 0) + (payment.otherDeductions || 0))}
                    </TableCell>
                    <TableCell>{formatCurrency(payment.adjustmentAmount)}</TableCell>
                    <TableCell>{formatCurrency(payment.netPaymentAmount)}</TableCell>
                    <TableCell>{getStatusBadge(payment.status)}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditPayment(payment)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-4">
                    No payments found. Create a new payment to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvoicePaymentsPage;
