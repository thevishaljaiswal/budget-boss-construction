
import React from "react";
import { useAppContext } from "@/context/AppContext";
import PageHeader from "@/components/shared/PageHeader";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { Card, CardContent } from "@/components/ui/card";

const AdvanceAdjustmentsPage = () => {
  const { 
    advanceAdjustments, 
    advancePayments, 
    invoices, 
    vendors 
  } = useAppContext();

  const getInvoiceNumber = (invoiceId: string) => {
    const invoice = invoices.find((i) => i.id === invoiceId);
    return invoice ? invoice.invoiceNumber : "Unknown Invoice";
  };

  const getVendorName = (invoiceId: string) => {
    const invoice = invoices.find((i) => i.id === invoiceId);
    if (!invoice) return "Unknown Vendor";
    
    const vendor = vendors.find((v) => v.id === invoice.vendorId);
    return vendor ? vendor.name : "Unknown Vendor";
  };

  const getAdvanceReference = (paymentId: string) => {
    const payment = advancePayments.find((p) => p.id === paymentId);
    return payment ? payment.referenceNo : "Unknown Reference";
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Advance Adjustments"
        description="View all advance adjustments against invoices"
      />

      <div>
        <h2 className="text-xl font-semibold mb-4">Adjustment List</h2>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Adjustment Date</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Invoice Number</TableHead>
                <TableHead>Advance Reference</TableHead>
                <TableHead>Adjusted Amount</TableHead>
                <TableHead>Remaining Advance</TableHead>
                <TableHead>Remarks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {advanceAdjustments && advanceAdjustments.length > 0 ? (
                advanceAdjustments.map((adjustment) => (
                  <TableRow key={adjustment.id}>
                    <TableCell>{formatDate(adjustment.adjustmentDate)}</TableCell>
                    <TableCell>{getVendorName(adjustment.invoiceId)}</TableCell>
                    <TableCell>{getInvoiceNumber(adjustment.invoiceId)}</TableCell>
                    <TableCell>{getAdvanceReference(adjustment.advancePaymentId)}</TableCell>
                    <TableCell>{formatCurrency(adjustment.adjustedAmount)}</TableCell>
                    <TableCell>{formatCurrency(adjustment.remainingAdvance)}</TableCell>
                    <TableCell>{adjustment.remarks || "-"}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    No advance adjustments found.
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

export default AdvanceAdjustmentsPage;
