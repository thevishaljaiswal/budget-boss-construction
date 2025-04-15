
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppContext } from "@/context/AppContext";
import { formatDate } from "@/utils/formatters";
import { Check, Camera, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { POLineItem, PurchaseOrder } from "@/types";
import { generateUniqueId } from "@/utils/formatters";

const formSchema = z.object({
  poId: z.string().min(1, "PO/WO reference is required"),
  receiptDate: z.date({ required_error: "Receipt date is required" }),
  receivedBy: z.string().min(1, "Supervisor confirmation is required"),
  remarks: z.string().optional(),
});

interface LineItemData {
  poLineItemId: string;
  description: string;
  orderedQuantity: number;
  quantityReceived: number;
}

interface GoodsReceiptFormProps {
  onClose: () => void;
  onSubmit: (data: any) => void;
}

const GoodsReceiptForm: React.FC<GoodsReceiptFormProps> = ({ onClose, onSubmit }) => {
  const { purchaseOrders, projects, vendors } = useAppContext();
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [lineItems, setLineItems] = useState<LineItemData[]>([]);
  const [attachments, setAttachments] = useState<{photos: boolean, dsr: boolean}>({ photos: false, dsr: false });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      poId: "",
      receiptDate: new Date(),
      receivedBy: "",
      remarks: "",
    },
  });

  const handlePOChange = (poId: string) => {
    const po = purchaseOrders.find(p => p.id === poId);
    setSelectedPO(po || null);

    // Mock line items - in a real app, you would fetch them from the database
    // based on the selected PO
    if (po) {
      // Here we would normally get the line items from a database
      // For this demo, we'll create mock line items
      const mockLineItems: LineItemData[] = [
        {
          poLineItemId: generateUniqueId(),
          description: `Item from ${po.type === 'PO' ? 'Purchase Order' : 'Work Order'} #${po.id}`,
          orderedQuantity: 10,
          quantityReceived: 0
        },
        {
          poLineItemId: generateUniqueId(),
          description: `Another item from ${po.type === 'PO' ? 'Purchase Order' : 'Work Order'} #${po.id}`,
          orderedQuantity: 5,
          quantityReceived: 0
        }
      ];
      
      setLineItems(mockLineItems);
    } else {
      setLineItems([]);
    }
  };

  const handleQuantityChange = (id: string, quantity: number) => {
    setLineItems(items => 
      items.map(item => 
        item.poLineItemId === id 
          ? { ...item, quantityReceived: quantity } 
          : item
      )
    );
  };

  const handleAttachmentToggle = (type: 'photos' | 'dsr') => {
    setAttachments(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const onFormSubmit = (data: z.infer<typeof formSchema>) => {
    // Prepare data for submission
    const grnData = {
      id: generateUniqueId(),
      ...data,
      receiptDate: format(data.receiptDate, "yyyy-MM-dd"),
      lineItems: lineItems.map(item => ({
        id: generateUniqueId(),
        grnId: "", // Will be populated after GRN creation
        poLineItemId: item.poLineItemId,
        quantityReceived: item.quantityReceived
      })),
      attachments: {
        photos: attachments.photos,
        dsr: attachments.dsr
      }
    };
    
    onSubmit(grnData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="poId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>PO/WO Reference</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    handlePOChange(value);
                  }}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select PO/WO" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {purchaseOrders
                      .filter(po => po.status === 'Issued')
                      .map((po) => (
                        <SelectItem key={po.id} value={po.id}>
                          {po.type}-{po.id} ({vendors.find(v => v.id === po.vendorId)?.name})
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
            name="receiptDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date of Receipt</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-2">
          <FormLabel>Line Items</FormLabel>
          <div className="border rounded-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-secondary/20">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Description</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Ordered</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Received</th>
                </tr>
              </thead>
              <tbody>
                {lineItems.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-4 text-center text-muted-foreground">
                      Select a PO/WO to see line items
                    </td>
                  </tr>
                ) : (
                  lineItems.map((item) => (
                    <tr key={item.poLineItemId} className="border-t">
                      <td className="px-4 py-2">{item.description}</td>
                      <td className="px-4 py-2">{item.orderedQuantity}</td>
                      <td className="px-4 py-2">
                        <Input
                          type="number"
                          min={0}
                          max={item.orderedQuantity}
                          value={item.quantityReceived}
                          onChange={(e) => handleQuantityChange(item.poLineItemId, Number(e.target.value))}
                          className="w-20"
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <FormField
          control={form.control}
          name="receivedBy"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Site Supervisor Confirmation</FormLabel>
              <FormControl>
                <Input placeholder="Name of supervisor confirming receipt" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <FormLabel>Attachments</FormLabel>
          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              variant={attachments.photos ? "default" : "outline"}
              size="sm"
              onClick={() => handleAttachmentToggle('photos')}
            >
              <Camera className="mr-2 h-4 w-4" />
              Photos
              {attachments.photos && <Check className="ml-2 h-4 w-4" />}
            </Button>
            <Button
              type="button"
              variant={attachments.dsr ? "default" : "outline"}
              size="sm"
              onClick={() => handleAttachmentToggle('dsr')}
            >
              <FileText className="mr-2 h-4 w-4" />
              Daily Site Report
              {attachments.dsr && <Check className="ml-2 h-4 w-4" />}
            </Button>
          </div>
        </div>

        <FormField
          control={form.control}
          name="remarks"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Remarks</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Additional notes or comments"
                  {...field}
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Submit Receipt</Button>
        </div>
      </form>
    </Form>
  );
};

export default GoodsReceiptForm;
