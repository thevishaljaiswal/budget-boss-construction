
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { v4 as uuidv4 } from "uuid";
import { useAppContext } from "@/context/AppContext";
import { AdvanceRequest } from "@/types";
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

const formSchema = z.object({
  projectId: z.string().nonempty("Project is required"),
  requestedBy: z.string().nonempty("Requester name is required"),
  requestDate: z.string().nonempty("Request date is required"),
  advanceType: z.enum(["Vendor", "Employee", "Subcontractor", "Petty Cash"]),
  partyId: z.string().nonempty("Party ID is required"),
  purpose: z.string().nonempty("Purpose/Remarks is required"),
  costCodeReference: z.string().nonempty("Cost code reference is required"),
  amountRequested: z.coerce.number().positive("Amount must be positive"),
  expectedSettlementDate: z.string().nonempty("Expected settlement date is required"),
  status: z.enum(["Draft", "Submitted", "Approved", "Rejected", "Paid"]),
});

type AdvanceRequestFormProps = {
  onComplete: () => void;
  editingAdvanceRequest?: AdvanceRequest;
};

const AdvanceRequestForm: React.FC<AdvanceRequestFormProps> = ({
  onComplete,
  editingAdvanceRequest,
}) => {
  const { projects, vendors, addAdvanceRequest, updateAdvanceRequest } = useAppContext();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: editingAdvanceRequest
      ? {
          ...editingAdvanceRequest,
          requestDate: editingAdvanceRequest.requestDate.split("T")[0],
          expectedSettlementDate: editingAdvanceRequest.expectedSettlementDate.split("T")[0],
        }
      : {
          projectId: "",
          requestedBy: "",
          requestDate: new Date().toISOString().split("T")[0],
          advanceType: "Vendor",
          partyId: "",
          purpose: "",
          costCodeReference: "",
          amountRequested: 0,
          expectedSettlementDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
          status: "Draft",
        },
  });

  const advanceType = form.watch("advanceType");
  const selectedPartyId = form.watch("partyId");

  // Get party name based on selected ID and advance type
  const getPartyName = (id: string): string => {
    if (advanceType === "Vendor") {
      const vendor = vendors.find((v) => v.id === id);
      return vendor ? vendor.name : "";
    }
    // For other types, we'd integrate with employee/subcontractor data
    return "";
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const partyName = getPartyName(values.partyId);
    
    const advanceRequestData: AdvanceRequest = {
      id: editingAdvanceRequest?.id || uuidv4(),
      projectId: values.projectId,
      requestedBy: values.requestedBy,
      requestDate: values.requestDate,
      advanceType: values.advanceType,
      partyId: values.partyId,
      partyName: partyName,
      purpose: values.purpose,
      costCodeReference: values.costCodeReference,
      amountRequested: values.amountRequested,
      expectedSettlementDate: values.expectedSettlementDate,
      approvers: [
        { name: "Project Manager", status: "Pending" },
        { name: "Finance Director", status: "Pending" },
      ],
      status: values.status,
    };

    if (editingAdvanceRequest) {
      updateAdvanceRequest(advanceRequestData);
      toast({
        title: "Advance Request Updated",
        description: `Advance request has been successfully updated.`,
      });
    } else {
      addAdvanceRequest(advanceRequestData);
      toast({
        title: "Advance Request Created",
        description: `New advance request has been successfully created.`,
      });
    }

    onComplete();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <h2 className="text-lg font-semibold mb-4">
          {editingAdvanceRequest ? "Edit Advance Request" : "Create Advance Request"}
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="projectId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Project" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
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
            name="requestedBy"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Requested By</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="requestDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Request Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="advanceType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Advance Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Vendor">Vendor</SelectItem>
                    <SelectItem value="Employee">Employee</SelectItem>
                    <SelectItem value="Subcontractor">Subcontractor</SelectItem>
                    <SelectItem value="Petty Cash">Petty Cash</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="partyId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {advanceType === "Vendor"
                    ? "Vendor"
                    : advanceType === "Employee"
                    ? "Employee"
                    : advanceType === "Subcontractor"
                    ? "Subcontractor"
                    : "Cash Handler"}
                </FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={`Select ${advanceType}`} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {advanceType === "Vendor" && 
                      vendors.map((vendor) => (
                        <SelectItem key={vendor.id} value={vendor.id}>
                          {vendor.name}
                        </SelectItem>
                      ))}
                    {/* For other types, we would show different lists */}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="purpose"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Purpose/Remarks</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter purpose of advance..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="costCodeReference"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cost Code / BOQ Reference</FormLabel>
                <FormControl>
                  <Input placeholder="CC-001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="amountRequested"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount Requested</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="expectedSettlementDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Expected Settlement Date</FormLabel>
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
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Submitted">Submitted</SelectItem>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                    <SelectItem value="Paid">Paid</SelectItem>
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
            {editingAdvanceRequest ? "Update Request" : "Submit Request"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default AdvanceRequestForm;
