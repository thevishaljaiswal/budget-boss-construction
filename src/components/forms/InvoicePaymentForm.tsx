
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { v4 as uuidv4 } from "uuid";
import { useAppContext } from "@/context/AppContext";
import { Invoice, InvoicePayment } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/utils/formatters";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const formSchema = z.object({
  invoiceId: z.string().nonempty("Invoice is required"),
  paymentDate: z.string().nonempty("Payment date is required"),
  paymentMode: z.enum(["NEFT", "RTGS", "Cheque", "UPI"], {
    required_error: "Payment mode is required",
  }),
  bankAccountDetails: z.string().nonempty("Bank account details are required"),
  referenceNo: z.string().nonempty("Reference number is required"),
  amountPaid: z.coerce.number().positive("Amount paid must be positive"),
  tdsAmount: z.coerce.number().optional(),
  otherDeductions: z.coerce.number().optional(),
  paymentRemarks: z.string().optional(),
  status: z.enum(["Completed", "Pending", "Failed"], {
    required_error: "Status is required",
  }),
});

type InvoicePaymentFormProps = {
  onComplete: () => void;
  invoice?: Invoice;
  editingPayment?: InvoicePayment;
};

const InvoicePaymentForm: React.FC<InvoicePaymentFormProps> = ({
  onComplete,
  invoice,
  editingPayment,
}) => {
  const { 
    vendors, 
    invoices, 
    advanceAdjustments,
    addInvoicePayment, 
    updateInvoicePayment 
  } = useAppContext();
  const { toast } = useToast();

  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | undefined>(invoice);
  const [adjustmentAmount, setAdjustmentAmount] = useState<number>(0);
  const [netPayableAmount, setNetPayableAmount] = useState<number>(0);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: editingPayment
      ? {
          ...editingPayment,
          paymentDate: editingPayment.paymentDate.split("T")[0],
          amountPaid: editingPayment.netPaymentAmount,
          tdsAmount: editingPayment.tdsAmount || 0,
          otherDeductions: editingPayment.otherDeductions || 0,
          paymentRemarks: editingPayment.paymentRemarks || "",
        }
      : {
          invoiceId: invoice?.id || "",
          paymentDate: new Date().toISOString().split("T")[0],
          paymentMode: "NEFT",
          bankAccountDetails: "",
          referenceNo: "",
          amountPaid: 0,
          tdsAmount: 0,
          otherDeductions: 0,
          paymentRemarks: "",
          status: "Completed",
        },
  });

  const watchInvoiceId = form.watch("invoiceId");
  const watchAmountPaid = form.watch("amountPaid");
  const watchTdsAmount = form.watch("tdsAmount") || 0;
  const watchOtherDeductions = form.watch("otherDeductions") || 0;

  // Calculate total adjustment amount for the selected invoice
  useEffect(() => {
    if (watchInvoiceId) {
      const inv = invoices.find((i) => i.id === watchInvoiceId);
      setSelectedInvoice(inv);

      if (inv) {
        // Calculate total adjustments for this invoice
        const totalAdjustments = advanceAdjustments
          .filter(adj => adj.invoiceId === inv.id)
          .reduce((sum, adj) => sum + adj.adjustedAmount, 0);
        
        setAdjustmentAmount(totalAdjustments);
        
        // Calculate net payable amount
        const netPayable = inv.amountApproved - totalAdjustments;
        setNetPayableAmount(netPayable);
        
        // Set the initial amountPaid if not an edit
        if (!editingPayment) {
          form.setValue("amountPaid", netPayable);
        }
      }
    }
  }, [watchInvoiceId, invoices, advanceAdjustments, form, editingPayment]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!selectedInvoice) {
      toast({
        title: "Error",
        description: "No invoice selected",
        variant: "destructive",
      });
      return;
    }

    const totalDeductions = (values.tdsAmount || 0) + (values.otherDeductions || 0);
    const netPaymentAmount = values.amountPaid - totalDeductions;

    if (netPaymentAmount > netPayableAmount) {
      toast({
        title: "Warning",
        description: `Payment amount exceeds the net payable amount (${formatCurrency(netPayableAmount)})`,
        variant: "destructive",
      });
      return;
    }

    const paymentData: InvoicePayment = {
      id: editingPayment?.id || uuidv4(),
      invoiceId: values.invoiceId,
      vendorId: selectedInvoice.vendorId,
      paymentDate: values.paymentDate,
      paymentMode: values.paymentMode,
      bankAccountDetails: values.bankAccountDetails,
      amountPaid: values.amountPaid,
      referenceNo: values.referenceNo,
      tdsAmount: values.tdsAmount,
      otherDeductions: values.otherDeductions,
      adjustmentAmount: adjustmentAmount,
      netPaymentAmount: netPaymentAmount,
      paymentRemarks: values.paymentRemarks,
      status: values.status,
    };

    if (editingPayment) {
      updateInvoicePayment(paymentData);
      toast({
        title: "Payment Updated",
        description: `Invoice payment has been successfully updated.`,
      });
    } else {
      addInvoicePayment(paymentData);
      toast({
        title: "Payment Created",
        description: `Invoice payment has been successfully created.`,
      });
    }

    onComplete();
  };

  const getVendorName = (vendorId: string) => {
    const vendor = vendors.find(v => v.id === vendorId);
    return vendor ? vendor.name : "Unknown Vendor";
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <h2 className="text-lg font-semibold mb-4">
          {editingPayment ? "Edit Invoice Payment" : "Create Invoice Payment"}
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="invoiceId"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Invoice</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                  disabled={!!invoice}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Invoice" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {invoices
                      .filter(inv => inv.status !== "Paid")
                      .map((inv) => (
                        <SelectItem key={inv.id} value={inv.id}>
                          {inv.invoiceNumber} - {getVendorName(inv.vendorId)}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {selectedInvoice && (
            <div className="col-span-2">
              <Card className="bg-slate-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Invoice Payment Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Vendor</p>
                      <p className="text-sm font-medium">{getVendorName(selectedInvoice.vendorId)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Invoice Amount</p>
                      <p className="text-sm font-medium">{formatCurrency(selectedInvoice.amountApproved)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Advance Adjustments</p>
                      <p className="text-sm font-medium">{formatCurrency(adjustmentAmount)}</p>
                    </div>
                    <div className="col-span-3">
                      <p className="text-xs text-muted-foreground">Net Payable Amount</p>
                      <p className="text-sm font-semibold text-primary">{formatCurrency(netPayableAmount)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <FormField
            control={form.control}
            name="paymentDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="paymentMode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Mode</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment mode" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="NEFT">NEFT</SelectItem>
                    <SelectItem value="RTGS">RTGS</SelectItem>
                    <SelectItem value="Cheque">Cheque</SelectItem>
                    <SelectItem value="UPI">UPI</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="bankAccountDetails"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Bank Account Details</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter bank account details" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="referenceNo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Reference</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter reference number" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="amountPaid"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Amount</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tdsAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>TDS Amount</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="otherDeductions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Other Deductions</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="col-span-2">
            <div className="rounded-md bg-slate-100 p-3">
              <div className="flex justify-between font-medium">
                <span>Net Payment Amount:</span>
                <span>
                  {formatCurrency(
                    (watchAmountPaid || 0) - (watchTdsAmount || 0) - (watchOtherDeductions || 0)
                  )}
                </span>
              </div>
            </div>
          </div>

          <FormField
            control={form.control}
            name="paymentRemarks"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Remarks</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Additional notes about this payment..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onComplete}>
            Cancel
          </Button>
          <Button type="submit" disabled={!watchInvoiceId}>
            {editingPayment ? "Update Payment" : "Create Payment"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default InvoicePaymentForm;
