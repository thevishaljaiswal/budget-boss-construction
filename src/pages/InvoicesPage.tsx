
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
import { Badge } from "@/components/ui/badge";

const InvoicesPage = () => {
  const { invoices, vendors, purchaseOrders } = useAppContext();
  const [dialogOpen, setDialogOpen] = useState(false);

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
                <TableHead>Retention</TableHead>
                <TableHead>Tax Deducted</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices && invoices.length > 0 ? (
                invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>{invoice.invoiceNumber}</TableCell>
                    <TableCell>{getVendorName(invoice.vendorId)}</TableCell>
                    <TableCell>{formatDate(invoice.invoiceDate)}</TableCell>
                    <TableCell>{getPoReference(invoice.poId)}</TableCell>
                    <TableCell>{formatCurrency(invoice.amountClaimed)}</TableCell>
                    <TableCell>{formatCurrency(invoice.amountApproved)}</TableCell>
                    <TableCell>{formatCurrency(invoice.retention)}</TableCell>
                    <TableCell>{formatCurrency(invoice.taxDeducted)}</TableCell>
                    <TableCell>{formatDate(invoice.paymentDueDate)}</TableCell>
                    <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                  </TableRow>
                ))
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
    </div>
  );
};

export default InvoicesPage;
