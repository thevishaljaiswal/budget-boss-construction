
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { v4 as uuidv4 } from "uuid";
import { useAppContext } from "@/context/AppContext";
import { AdvancePayment, AdvanceRequest } from "@/types";
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
  advanceRequestId: z.string().nonempty("Advance request is required"),
  paymentMode: z.enum(["NEFT", "RTGS", "Cheque", "UPI"]),
  bankAccountDetails: z.string().nonempty("Bank account details are required"),
  paymentDate: z.string().nonempty("Payment date is required"),
  amountPaid: z.coerce.number().positive("Amount must be positive"),
  referenceNo: z.string().nonempty("Reference number is required"),
  tdsAmount: z.coerce.number().min(0, "TDS amount cannot be negative").optional(),
  otherDeductions: z.coerce.number().min(0, "Deductions cannot be negative").optional(),
  paymentRemarks: z.string().optional(),
});

type AdvancePaymentFormProps = {
  onComplete: () => void;
  advanceRequest?: AdvanceRequest;  // The advance request to create payment for
  editingAdvancePayment?: AdvancePayment;
};

const AdvancePaymentForm: React.FC<AdvancePaymentFormProps> = ({
  onComplete,
  advanceRequest,
  editingAdvancePayment,
}) => {
  const { advanceRequests, addAdvancePayment, updateAdvancePayment } = useAppContext();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: editingAdvancePayment
      ? {
          ...editingAdvancePayment,
          paymentDate: editingAdvancePayment.paymentDate.split("T")[0],
        }
      : {
          advanceRequestId: advanceRequest?.id || "",
          paymentMode: "NEFT",
          bankAccountDetails: "",
          paymentDate: new Date().toISOString().split("T")[0],
          amountPaid: advanceRequest?.amountRequested || 0,
          referenceNo: "",
          tdsAmount: 0,
          otherDeductions: 0,
          paymentRemarks: "",
        },
  });

  const selectedRequestId = form.watch("advanceRequestId");
  
  // Get the selected advance request
  const selectedRequest = advanceRequests.find(
    (req) => req.id === selectedRequestId
  );

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!selectedRequest) {
      toast({
        title: "Error",
        description: "Selected advance request not found",
        variant: "destructive",
      });
      return;
    }

    const deductions = (values.tdsAmount || 0) + (values.otherDeductions || 0);
    const netAmount = values.amountPaid - deductions;

    const advancePaymentData: AdvancePayment = {
      id: editingAdvancePayment?.id || uuidv4(),
      advanceRequestId: values.advanceRequestId,
      partyId: selectedRequest.partyId,
      partyName: selectedRequest.partyName,
      paymentMode: values.paymentMode,
      bankAccountDetails: values.bankAccountDetails,
      paymentDate: values.paymentDate,
      amountPaid: values.amountPaid,
      referenceNo: values.referenceNo,
      tdsAmount: values.tdsAmount,
      otherDeductions: values.otherDeductions,
      paymentRemarks: values.paymentRemarks,
      remainingAmount: netAmount, // Initially, remaining amount equals net amount paid
    };

    if (editingAdvancePayment) {
      updateAdvancePayment(advancePaymentData);
      toast({
        title: "Advance Payment Updated",
        description: `Payment details have been successfully updated.`,
      });
    } else {
      addAdvancePayment(advancePaymentData);
      toast({
        title: "Advance Payment Recorded",
        description: `Payment has been successfully recorded.`,
      });
    }

    onComplete();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <h2 className="text-lg font-semibold mb-4">
          {editingAdvancePayment ? "Edit Advance Payment" : "Record Advance Payment"}
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="advanceRequestId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Advance Request</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                  disabled={!!advanceRequest}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Advance Request" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {advanceRequests
                      .filter(req => req.status === "Approved" && !req.status.includes("Paid"))
                      .map((req) => (
                        <SelectItem key={req.id} value={req.id}>
                          {req.partyName} - {req.purpose.substring(0, 20)}...
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
            name="paymentMode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Mode</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Payment Mode" />
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
              <FormItem>
                <FormLabel>Bank Account Details</FormLabel>
                <FormControl>
                  <Input placeholder="Account number / UPI ID" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
            name="amountPaid"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount Paid</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
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
                <FormLabel>Reference Number</FormLabel>
                <FormControl>
                  <Input placeholder="Transaction ID / Cheque No." {...field} />
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
                <FormLabel>TDS Amount (if applicable)</FormLabel>
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

          <FormField
            control={form.control}
            name="paymentRemarks"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Payment Remarks</FormLabel>
                <FormControl>
                  <Input placeholder="Additional notes" {...field} />
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
          <Button type="submit">
            {editingAdvancePayment ? "Update Payment" : "Record Payment"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default AdvancePaymentForm;
