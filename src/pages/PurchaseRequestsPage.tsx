
import React, { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import PageHeader from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2, Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/utils/formatters";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PurchaseRequest } from "@/types";

interface PurchaseRequestItem {
  id: string;
  requestType: "Material" | "Service";
  description: string;
  quantity: number;
  budgetItemId: string;
  costCodeReference: string;
  justification: string;
}

const PurchaseRequestsPage: React.FC = () => {
  const { purchaseRequests, projects, budgetItems, addPurchaseRequest } = useAppContext();
  const [open, setOpen] = useState(false);
  
  // Form state for new purchase request header
  const [prHeader, setPrHeader] = useState({
    projectId: "",
    requesterName: "",
    requiredByDate: "",
  });
  
  // Form state for purchase request items (multiple entries)
  const [prItems, setPrItems] = useState<PurchaseRequestItem[]>([
    {
      id: generateUniqueId(),
      requestType: "Material",
      description: "",
      quantity: 1,
      budgetItemId: "",
      costCodeReference: "",
      justification: "",
    },
  ]);
  
  const handleHeaderChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setPrHeader((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleHeaderSelectChange = (name: string, value: string) => {
    setPrHeader((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleItemChange = (
    id: string,
    field: keyof PurchaseRequestItem,
    value: string | number
  ) => {
    setPrItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };
  
  const addNewItem = () => {
    setPrItems((prev) => [
      ...prev,
      {
        id: generateUniqueId(),
        requestType: "Material",
        description: "",
        quantity: 1,
        budgetItemId: "",
        costCodeReference: "",
        justification: "",
      },
    ]);
  };
  
  const removeItem = (id: string) => {
    if (prItems.length > 1) {
      setPrItems((prev) => prev.filter((item) => item.id !== id));
    }
  };
  
  const handleCreatePR = () => {
    const currentDate = new Date().toISOString().split("T")[0];
    
    // Create individual PRs for each item
    prItems.forEach((item) => {
      const purchaseRequest: PurchaseRequest = {
        id: generateUniqueId(),
        projectId: prHeader.projectId,
        requestType: item.requestType,
        requesterName: prHeader.requesterName,
        requestDate: currentDate,
        requiredByDate: prHeader.requiredByDate,
        costCodeReference: item.costCodeReference,
        budgetItemId: item.budgetItemId,
        quantity: Number(item.quantity),
        justification: item.justification,
        attachments: [],
        status: "Pending Approval",
      };
      
      addPurchaseRequest(purchaseRequest);
    });
    
    setOpen(false);
    
    // Reset form
    setPrHeader({
      projectId: "",
      requesterName: "",
      requiredByDate: "",
    });
    
    setPrItems([
      {
        id: generateUniqueId(),
        requestType: "Material",
        description: "",
        quantity: 1,
        budgetItemId: "",
        costCodeReference: "",
        justification: "",
      },
    ]);
  };
  
  const selectedProject = projects.find(p => p.id === prHeader.projectId);
  const projectBudgetItems = selectedProject 
    ? budgetItems.filter(item => item.projectId === selectedProject.id)
    : [];
  
  const isFormValid = () => {
    if (!prHeader.projectId || !prHeader.requesterName || !prHeader.requiredByDate) {
      return false;
    }
    
    return prItems.every(
      (item) =>
        item.budgetItemId && 
        item.costCodeReference && 
        item.quantity > 0 &&
        item.description
    );
  };
  
  return (
    <div className="space-y-8">
      <PageHeader
        title="Purchase Requests"
        description="Create and manage purchase requests for materials and services."
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                New Request
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px] max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Purchase Request</DialogTitle>
                <DialogDescription>
                  Complete the form below to create a new purchase request with multiple items. Items will be subject to budget availability.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4">
                {/* Header Section */}
                <div className="space-y-4 rounded-md border p-4">
                  <h3 className="text-lg font-medium">Request Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="projectId">Project</Label>
                      <Select
                        value={prHeader.projectId}
                        onValueChange={(value) => handleHeaderSelectChange("projectId", value)}
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
                    <div className="space-y-2">
                      <Label htmlFor="requesterName">Requester Name</Label>
                      <Input
                        id="requesterName"
                        name="requesterName"
                        value={prHeader.requesterName}
                        onChange={handleHeaderChange}
                        placeholder="Your name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="requiredByDate">Required By</Label>
                      <Input
                        id="requiredByDate"
                        name="requiredByDate"
                        type="date"
                        value={prHeader.requiredByDate}
                        onChange={handleHeaderChange}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Items Table Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Request Items</h3>
                    <Button onClick={addNewItem} size="sm">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Item
                    </Button>
                  </div>
                  
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Type</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Budget Item</TableHead>
                          <TableHead>Cost Code</TableHead>
                          <TableHead>Qty</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {prItems.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>
                              <Select
                                value={item.requestType}
                                onValueChange={(value) => 
                                  handleItemChange(item.id, "requestType", value as "Material" | "Service")
                                }
                              >
                                <SelectTrigger id={`requestType-${item.id}`} className="w-full">
                                  <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Material">Material</SelectItem>
                                  <SelectItem value="Service">Service</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Input
                                value={item.description}
                                onChange={(e) => 
                                  handleItemChange(item.id, "description", e.target.value)
                                }
                                placeholder="Item description"
                              />
                            </TableCell>
                            <TableCell>
                              <Select
                                value={item.budgetItemId}
                                onValueChange={(value) => 
                                  handleItemChange(item.id, "budgetItemId", value)
                                }
                                disabled={!prHeader.projectId}
                              >
                                <SelectTrigger id={`budgetItem-${item.id}`} className="w-full">
                                  <SelectValue 
                                    placeholder={
                                      !prHeader.projectId 
                                        ? "Select project first" 
                                        : "Select budget item"
                                    } 
                                  />
                                </SelectTrigger>
                                <SelectContent>
                                  {projectBudgetItems.map((budgetItem) => (
                                    <SelectItem key={budgetItem.id} value={budgetItem.id}>
                                      {budgetItem.description}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Input
                                value={item.costCodeReference}
                                onChange={(e) => 
                                  handleItemChange(item.id, "costCodeReference", e.target.value)
                                }
                                placeholder="e.g., HVR-001"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => 
                                  handleItemChange(item.id, "quantity", parseInt(e.target.value))
                                }
                                className="w-16"
                                min={1}
                              />
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeItem(item.id)}
                                disabled={prItems.length === 1}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  
                  {/* Justification Section */}
                  <div className="space-y-2">
                    <Label htmlFor="justification">Justification</Label>
                    <Textarea
                      id="justification"
                      placeholder="Explain why these items are needed..."
                      className="min-h-[80px]"
                      value={prItems[0].justification}
                      onChange={(e) => {
                        // Apply same justification to all items
                        const justification = e.target.value;
                        setPrItems((prev) =>
                          prev.map((item) => ({ ...item, justification }))
                        );
                      }}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCreatePR}
                  disabled={!isFormValid()}
                >
                  <Save className="mr-2 h-4 w-4" />
                  Create Purchase Request
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <Card>
        <CardContent className="pt-6">
          {purchaseRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-60 bg-secondary/30 rounded-lg">
              <p className="text-muted-foreground mb-4">No purchase requests have been created yet.</p>
              <Button onClick={() => setOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create First Purchase Request
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project</TableHead>
                    <TableHead>Request Type</TableHead>
                    <TableHead>Requester</TableHead>
                    <TableHead>Request Date</TableHead>
                    <TableHead>Required By</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchaseRequests.map((pr) => (
                    <TableRow key={pr.id}>
                      <TableCell>
                        {projects.find(p => p.id === pr.projectId)?.name || 'Unknown'}
                      </TableCell>
                      <TableCell>{pr.requestType}</TableCell>
                      <TableCell>{pr.requesterName}</TableCell>
                      <TableCell>{formatDate(pr.requestDate)}</TableCell>
                      <TableCell>{formatDate(pr.requiredByDate)}</TableCell>
                      <TableCell>
                        <Badge variant={
                          pr.status === 'Approved' ? 'success' :
                          pr.status === 'Pending Approval' ? 'outline' :
                          pr.status === 'Converted to PO' ? 'success' :
                          pr.status === 'Rejected' ? 'destructive' : 'secondary'
                        }>
                          {pr.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm">View</Button>
                          {pr.status === 'Approved' && (
                            <Button size="sm">Create PO</Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PurchaseRequestsPage;
