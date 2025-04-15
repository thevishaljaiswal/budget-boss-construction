
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
import { Badge } from "@/components/ui/badge";

const AdvancePaymentsPage = () => {
  const { advancePayments, advanceRequests, advanceAdjustments } = useAppContext();

  const getRequestPurpose = (requestId: string) => {
    const request = advanceRequests.find((r) => r.id === requestId);
    return request ? request.purpose : "Unknown Purpose";
  };

  const getPaymentModeBadge = (paymentMode: string) => {
    switch (paymentMode) {
      case "NEFT":
        return <Badge variant="outline">NEFT</Badge>;
      case "RTGS":
        return <Badge variant="secondary">RTGS</Badge>;
      case "Cheque":
        return <Badge>Cheque</Badge>;
      case "UPI":
        return <Badge variant="default">UPI</Badge>;
      default:
        return <Badge variant="outline">{paymentMode}</Badge>;
    }
  };

  // Calculate adjusted amount for each payment
  const getAdjustedAmount = (paymentId: string) => {
    return advanceAdjustments
      .filter(adj => adj.advancePaymentId === paymentId)
      .reduce((sum, adj) => sum + adj.adjustedAmount, 0);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Advance Payments"
        description="Track advance payments and their utilization"
      />

      <div>
        <h2 className="text-xl font-semibold mb-4">Payment List</h2>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Party Name</TableHead>
                <TableHead>Purpose</TableHead>
                <TableHead>Payment Date</TableHead>
                <TableHead>Payment Mode</TableHead>
                <TableHead>Reference No</TableHead>
                <TableHead>Amount Paid</TableHead>
                <TableHead>Deductions</TableHead>
                <TableHead>Net Amount</TableHead>
                <TableHead>Adjusted</TableHead>
                <TableHead>Remaining</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {advancePayments && advancePayments.length > 0 ? (
                advancePayments.map((payment) => {
                  const adjustedAmount = getAdjustedAmount(payment.id);
                  const deductions = (payment.tdsAmount || 0) + (payment.otherDeductions || 0);
                  const netAmount = payment.amountPaid - deductions;
                  
                  return (
                    <TableRow key={payment.id}>
                      <TableCell>{payment.partyName}</TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {getRequestPurpose(payment.advanceRequestId)}
                      </TableCell>
                      <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                      <TableCell>{getPaymentModeBadge(payment.paymentMode)}</TableCell>
                      <TableCell>{payment.referenceNo}</TableCell>
                      <TableCell>{formatCurrency(payment.amountPaid)}</TableCell>
                      <TableCell>{formatCurrency(deductions)}</TableCell>
                      <TableCell>{formatCurrency(netAmount)}</TableCell>
                      <TableCell>{formatCurrency(adjustedAmount)}</TableCell>
                      <TableCell>{formatCurrency(payment.remainingAmount)}</TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-4">
                    No advance payments found.
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

export default AdvancePaymentsPage;
