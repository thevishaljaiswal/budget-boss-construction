import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { v4 as uuidv4 } from "uuid";
import { useAppContext } from "@/context/AppContext";
import { Invoice } from "@/types";
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
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  invoiceNumber: z.string().nonempty("Invoice number is required"),
  vendorId: z.string().nonempty("Vendor is required"),
  poId: z.string().nonempty("PO/WO reference is required"),
  invoiceDate: z.string().nonempty("Invoice date is required"),
  amountClaimed: z.coerce.number().positive("Amount claimed must be positive"),
  amountApproved: z.coerce.number().positive("Amount approved must be positive"),
  retention: z.coerce.number().min(0, "Retention amount must be non-negative"),
  taxDeducted: z.coerce.number().min(0, "Tax deducted must be non-negative"),
  paymentDueDate: z.string().nonempty("Payment due date is required"),
  status: z.enum(["Pending", "Approved", "Paid", "Disputed"]),
});

type InvoiceFormProps = {
  onComplete: () => void;
  editingInvoice?: Invoice;
};

const InvoiceForm: React.FC<InvoiceFormProps> = ({ onComplete, editingInvoice }) => {
  const { vendors, purchaseOrders, addInvoice, updateInvoice } = useAppContext();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: editingInvoice
      ? {
          ...editingInvoice,
          invoiceDate: editingInvoice.invoiceDate.split("T")[0],
          paymentDueDate: editingInvoice.paymentDueDate.split("T")[0],
        }
      : {
          invoiceNumber: "",
          vendorId: "",
          poId: "",
          invoiceDate: new Date().toISOString().split("T")[0],
          amountClaimed: 0,
          amountApproved: 0,
          retention: 0,
          taxDeducted: 0,
          paymentDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
          status: "Pending",
        },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const invoiceData: Invoice = {
      id: editingInvoice?.id || uuidv4(),
      invoiceNumber: values.invoiceNumber,
      vendorId: values.vendorId,
      poId: values.poId,
      invoiceDate: values.invoiceDate,
      amountClaimed: values.amountClaimed,
      amountApproved: values.amountApproved,
      retention: values.retention,
      taxDeducted: values.taxDeducted,
      paymentDueDate: values.paymentDueDate,
      status: values.status,
    };

    if (editingInvoice) {
      updateInvoice(invoiceData);
      toast({
        title: "Invoice Updated",
        description: `Invoice ${invoiceData.invoiceNumber} has been successfully updated.`,
      });
    } else {
      addInvoice(invoiceData);
      toast({
        title: "Invoice Booked",
        description: `Invoice ${invoiceData.invoiceNumber} has been successfully booked.`,
      });
    }

    onComplete();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <h2 className="text-lg font-semibold mb-4">
          {editingInvoice ? "Edit Invoice" : "Book New Invoice"}
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="invoiceNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Invoice Number</FormLabel>
                <FormControl>
                  <Input placeholder="INV-001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="vendorId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vendor</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Vendor" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {vendors.map((vendor) => (
                      <SelectItem key={vendor.id} value={vendor.id}>
                        {vendor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="poId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>PO/WO Reference</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select PO/WO" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {purchaseOrders.map((po) => (
                      <SelectItem key={po.id} value={po.id}>
                        {po.id} - {po.type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="invoiceDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Invoice Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="amountClaimed"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount Claimed</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="amountApproved"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount Approved</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="retention"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Retention (if any)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="taxDeducted"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tax Deducted</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="paymentDueDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Due Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
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
                <FormLabel>Status</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Paid">Paid</SelectItem>
                    <SelectItem value="Disputed">Disputed</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onComplete}>
            Cancel
          </Button>
          <Button type="submit">
            {editingInvoice ? "Update Invoice" : "Book Invoice"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default InvoiceForm;
