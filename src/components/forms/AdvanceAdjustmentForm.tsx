
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { v4 as uuidv4 } from "uuid";
import { useAppContext } from "@/context/AppContext";
import { AdvanceAdjustment, AdvancePayment, Invoice } from "@/types";
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
  advancePaymentId: z.string().nonempty("Advance payment is required"),
  adjustedAmount: z
    .coerce
    .number()
    .positive("Amount must be positive")
    .refine(
      (val) => val > 0,
      "Adjusted amount must be greater than zero"
    ),
  adjustmentDate: z.string().nonempty("Adjustment date is required"),
  remarks: z.string().optional(),
});

type AdvanceAdjustmentFormProps = {
  onComplete: () => void;
  invoice?: Invoice;
  editingAdjustment?: AdvanceAdjustment;
};

const AdvanceAdjustmentForm: React.FC<AdvanceAdjustmentFormProps> = ({
  onComplete,
  invoice,
  editingAdjustment,
}) => {
  const { 
    vendors,
    invoices, 
    advancePayments, 
    advanceAdjustments,
    addAdvanceAdjustment, 
    updateAdvanceAdjustment 
  } = useAppContext();
  const { toast } = useToast();
  
  const [availableAdvances, setAvailableAdvances] = useState<AdvancePayment[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | undefined>(invoice);
  const [remainingInvoiceAmount, setRemainingInvoiceAmount] = useState<number>(0);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: editingAdjustment
      ? {
          ...editingAdjustment,
          adjustmentDate: editingAdjustment.adjustmentDate.split("T")[0],
        }
      : {
          invoiceId: invoice?.id || "",
          advancePaymentId: "",
          adjustedAmount: 0,
          adjustmentDate: new Date().toISOString().split("T")[0],
          remarks: "",
        },
  });

  const watchInvoiceId = form.watch("invoiceId");
  const watchAdvancePaymentId = form.watch("advancePaymentId");
  
  // Update selected invoice when invoice ID changes
  useEffect(() => {
    if (watchInvoiceId) {
      const inv = invoices.find((i) => i.id === watchInvoiceId);
      setSelectedInvoice(inv);
      
      if (inv) {
        // Calculate remaining invoice amount after existing adjustments
        const existingAdjustments = advanceAdjustments
          .filter(adj => adj.invoiceId === inv.id && (!editingAdjustment || adj.id !== editingAdjustment.id))
          .reduce((sum, adj) => sum + adj.adjustedAmount, 0);
          
        const remaining = inv.amountApproved - existingAdjustments;
        setRemainingInvoiceAmount(remaining);
        
        // Find available advances for this vendor
        const vendorAdvances = advancePayments.filter(
          (ap) => {
            // Get advance request details
            const remainingAmount = ap.remainingAmount;
            return (
              ap.partyId === inv.vendorId && 
              remainingAmount > 0 &&
              (!editingAdjustment || ap.id !== editingAdjustment.advancePaymentId)
            );
          }
        );
        
        setAvailableAdvances(vendorAdvances);
      }
    }
  }, [watchInvoiceId, invoices, advancePayments, advanceAdjustments, editingAdjustment]);
  
  // Update form when selected advance payment changes
  useEffect(() => {
    if (watchAdvancePaymentId) {
      const selectedAdvance = advancePayments.find(
        (ap) => ap.id === watchAdvancePaymentId
      );
      
      if (selectedAdvance && selectedInvoice) {
        // Default to the smaller of remaining invoice amount or available advance
        const defaultAdjustment = Math.min(
          remainingInvoiceAmount,
          selectedAdvance.remainingAmount
        );
        
        form.setValue("adjustedAmount", defaultAdjustment);
      }
    }
  }, [watchAdvancePaymentId, form, advancePayments, remainingInvoiceAmount, selectedInvoice]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const selectedAdvance = advancePayments.find(
      (ap) => ap.id === values.advancePaymentId
    );
    
    if (!selectedAdvance) {
      toast({
        title: "Error",
        description: "Selected advance payment not found",
        variant: "destructive",
      });
      return;
    }
    
    if (values.adjustedAmount > selectedAdvance.remainingAmount) {
      toast({
        title: "Error",
        description: "Adjusted amount cannot exceed available advance amount",
        variant: "destructive",
      });
      return;
    }
    
    if (values.adjustedAmount > remainingInvoiceAmount) {
      toast({
        title: "Error",
        description: "Adjusted amount cannot exceed remaining invoice amount",
        variant: "destructive",
      });
      return;
    }

    const adjustmentData: AdvanceAdjustment = {
      id: editingAdjustment?.id || uuidv4(),
      invoiceId: values.invoiceId,
      advancePaymentId: values.advancePaymentId,
      adjustedAmount: values.adjustedAmount,
      adjustmentDate: values.adjustmentDate,
      remainingAdvance: selectedAdvance.remainingAmount - values.adjustedAmount,
      remarks: values.remarks,
    };

    if (editingAdjustment) {
      updateAdvanceAdjustment(adjustmentData);
      toast({
        title: "Adjustment Updated",
        description: `Advance adjustment has been successfully updated.`,
      });
    } else {
      addAdvanceAdjustment(adjustmentData);
      toast({
        title: "Adjustment Created",
        description: `Advance adjustment has been successfully created.`,
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
          {editingAdjustment ? "Edit Advance Adjustment" : "Create Advance Adjustment"}
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="invoiceId"
            render={({ field }) => (
              <FormItem>
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
                  <CardTitle className="text-sm font-medium">Invoice Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Vendor</p>
                      <p className="text-sm font-medium">{getVendorName(selectedInvoice.vendorId)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Amount</p>
                      <p className="text-sm font-medium">{formatCurrency(selectedInvoice.amountApproved)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Remaining Amount</p>
                      <p className="text-sm font-medium">{formatCurrency(remainingInvoiceAmount)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <FormField
            control={form.control}
            name="advancePaymentId"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Available Advances</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Advance" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {availableAdvances.length > 0 ? (
                      availableAdvances.map((adv) => (
                        <SelectItem key={adv.id} value={adv.id}>
                          {adv.partyName} - {formatCurrency(adv.remainingAmount)} available
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>
                        No available advances for this vendor
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="adjustedAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount to Adjust</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="adjustmentDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Adjustment Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="remarks"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Remarks</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Additional notes about this adjustment..."
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
          <Button type="submit" disabled={!watchAdvancePaymentId || !watchInvoiceId}>
            {editingAdjustment ? "Update Adjustment" : "Create Adjustment"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default AdvanceAdjustmentForm;
