import React, { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import PageHeader from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatCurrency } from "@/utils/formatters";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { generateUniqueId } from "@/utils/formatters";

const PurchaseOrdersPage: React.FC = () => {
  const { 
    purchaseOrders, 
    projects, 
    vendors, 
    purchaseRequests,
    addPurchaseOrder 
  } = useAppContext();
  
  const [open, setOpen] = useState(false);
  
  // Form state for new purchase order
  const [newPO, setNewPO] = useState({
    projectId: "",
    vendorId: "",
    type: "PO",
    prReference: "",
    deliveryDate: "",
    paymentTerms: "Net 30",
    taxPercentage: 8.5,
    siteLocation: "",
    specialTerms: "",
    totalAmount: 0,
  });
  
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNewPO((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setNewPO((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleCreatePO = () => {
    const currentDate = new Date().toISOString().split("T")[0];
    
    const purchaseOrder = {
      id: generateUniqueId(),
      ...newPO,
      issueDate: currentDate,
      status: "Draft" as const,
      totalAmount: Number(newPO.totalAmount),
      taxPercentage: Number(newPO.taxPercentage),
      type: newPO.type as "PO" | "WO",
    };
    
    addPurchaseOrder(purchaseOrder);
    setOpen(false);
    
    // Reset form
    setNewPO({
      projectId: "",
      vendorId: "",
      type: "PO",
      prReference: "",
      deliveryDate: "",
      paymentTerms: "Net 30",
      taxPercentage: 8.5,
      siteLocation: "",
      specialTerms: "",
      totalAmount: 0,
    });
  };
  
  // Filter approved PRs by selected project
  const approvedPRs = purchaseRequests.filter(
    pr => pr.status === "Approved" && pr.projectId === newPO.projectId
  );
  
  return (
    <div className="space-y-8">
      <PageHeader
        title="Purchase Orders"
        description="Create and manage purchase orders for materials and work orders for services."
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                New Order
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create Purchase Order</DialogTitle>
                <DialogDescription>
                  Create a new purchase order or work order based on an approved purchase request.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="type" className="text-right">
                    Type
                  </Label>
                  <div className="col-span-3">
                    <Select
                      value={newPO.type}
                      onValueChange={(value) => handleSelectChange("type", value)}
                    >
                      <SelectTrigger id="type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PO">Purchase Order (PO)</SelectItem>
                        <SelectItem value="WO">Work Order (WO)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="projectId" className="text-right">
                    Project
                  </Label>
                  <div className="col-span-3">
                    <Select
                      value={newPO.projectId}
                      onValueChange={(value) => handleSelectChange("projectId", value)}
                    >
                      <SelectTrigger id="projectId">
                        <SelectValue placeholder="Select a project" />
                      </SelectTrigger>
                      <SelectContent>
                        {projects.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name} ({project.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="prReference" className="text-right">
                    PR Reference
                  </Label>
                  <div className="col-span-3">
                    <Select
                      value={newPO.prReference}
                      onValueChange={(value) => handleSelectChange("prReference", value)}
                      disabled={!newPO.projectId || approvedPRs.length === 0}
                    >
                      <SelectTrigger id="prReference">
                        <SelectValue 
                          placeholder={
                            !newPO.projectId 
                              ? "Select a project first" 
                              : approvedPRs.length === 0
                              ? "No approved PRs available"
                              : "Select PR reference"
                          } 
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {approvedPRs.map((pr) => (
                          <SelectItem key={pr.id} value={pr.id}>
                            PR-{pr.id} ({pr.requestType})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="vendorId" className="text-right">
                    Vendor
                  </Label>
                  <div className="col-span-3">
                    <Select
                      value={newPO.vendorId}
                      onValueChange={(value) => handleSelectChange("vendorId", value)}
                    >
                      <SelectTrigger id="vendorId">
                        <SelectValue placeholder="Select vendor" />
                      </SelectTrigger>
                      <SelectContent>
                        {vendors.map((vendor) => (
                          <SelectItem key={vendor.id} value={vendor.id}>
                            {vendor.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="deliveryDate" className="text-right">
                    Delivery Date
                  </Label>
                  <Input
                    id="deliveryDate"
                    name="deliveryDate"
                    type="date"
                    value={newPO.deliveryDate}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="paymentTerms" className="text-right">
                    Payment Terms
                  </Label>
                  <div className="col-span-3">
                    <Select
                      value={newPO.paymentTerms}
                      onValueChange={(value) => handleSelectChange("paymentTerms", value)}
                    >
                      <SelectTrigger id="paymentTerms">
                        <SelectValue placeholder="Select payment terms" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Net 15">Net 15</SelectItem>
                        <SelectItem value="Net 30">Net 30</SelectItem>
                        <SelectItem value="Net 45">Net 45</SelectItem>
                        <SelectItem value="Net 60">Net 60</SelectItem>
                        <SelectItem value="COD">Cash on Delivery</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="taxPercentage" className="text-right">
                    Tax %
                  </Label>
                  <Input
                    id="taxPercentage"
                    name="taxPercentage"
                    type="number"
                    step="0.1"
                    value={newPO.taxPercentage}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="siteLocation" className="text-right">
                    Site Location
                  </Label>
                  <Input
                    id="siteLocation"
                    name="siteLocation"
                    value={newPO.siteLocation}
                    onChange={handleInputChange}
                    className="col-span-3"
                    placeholder="e.g., Main Building, Floor 3, Zone B"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="totalAmount" className="text-right">
                    Total Amount
                  </Label>
                  <Input
                    id="totalAmount"
                    name="totalAmount"
                    type="number"
                    value={newPO.totalAmount}
                    onChange={handleInputChange}
                    className="col-span-3"
                    min={0}
                  />
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="specialTerms" className="text-right pt-2">
                    Special Terms
                  </Label>
                  <Textarea
                    id="specialTerms"
                    name="specialTerms"
                    value={newPO.specialTerms}
                    onChange={handleInputChange}
                    className="col-span-3"
                    placeholder="Any special terms or conditions"
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCreatePO}
                  disabled={
                    !newPO.projectId ||
                    !newPO.vendorId ||
                    !newPO.deliveryDate ||
                    newPO.totalAmount <= 0
                  }
                >
                  Create {newPO.type === "PO" ? "Purchase Order" : "Work Order"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <Card>
        <CardContent className="pt-6">
          {purchaseOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-60 bg-secondary/30 rounded-lg">
              <p className="text-muted-foreground mb-4">No purchase orders have been created yet.</p>
              <Button onClick={() => setOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create First Purchase Order
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Project</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Vendor</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Issue Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Delivery Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {purchaseOrders.map((po) => (
                    <tr key={po.id} className="border-b hover:bg-secondary/30">
                      <td className="px-4 py-3">
                        {po.type === "PO" ? "Purchase Order" : "Work Order"}
                      </td>
                      <td className="px-4 py-3">
                        {projects.find(p => p.id === po.projectId)?.name || 'Unknown'}
                      </td>
                      <td className="px-4 py-3">
                        {vendors.find(v => v.id === po.vendorId)?.name || 'Unknown'}
                      </td>
                      <td className="px-4 py-3">{formatDate(po.issueDate)}</td>
                      <td className="px-4 py-3">{formatDate(po.deliveryDate)}</td>
                      <td className="px-4 py-3">{formatCurrency(po.totalAmount)}</td>
                      <td className="px-4 py-3">
                        <Badge variant={
                          po.status === 'Issued' ? 'default' :
                          po.status === 'Draft' ? 'outline' :
                          po.status === 'Completed' ? 'success' :
                          po.status === 'Cancelled' ? 'destructive' : 'secondary'
                        }>
                          {po.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm">View</Button>
                          {po.status === 'Draft' && (
                            <Button size="sm">Issue</Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PurchaseOrdersPage;
