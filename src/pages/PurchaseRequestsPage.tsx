
import React, { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import PageHeader from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
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

const PurchaseRequestsPage: React.FC = () => {
  const { purchaseRequests, projects, budgetItems, addPurchaseRequest } = useAppContext();
  const [open, setOpen] = useState(false);
  
  // Form state for new purchase request
  const [newPR, setNewPR] = useState({
    projectId: "",
    requestType: "Material",
    requesterName: "",
    requiredByDate: "",
    costCodeReference: "",
    budgetItemId: "",
    quantity: 1,
    justification: "",
  });
  
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNewPR((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setNewPR((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleCreatePR = () => {
    const currentDate = new Date().toISOString().split("T")[0];
    
    const purchaseRequest = {
      id: generateUniqueId(),
      ...newPR,
      requestDate: currentDate,
      attachments: [] as string[],
      status: "Pending Approval" as const,
      quantity: Number(newPR.quantity),
    };
    
    addPurchaseRequest(purchaseRequest);
    setOpen(false);
    
    // Reset form
    setNewPR({
      projectId: "",
      requestType: "Material",
      requesterName: "",
      requiredByDate: "",
      costCodeReference: "",
      budgetItemId: "",
      quantity: 1,
      justification: "",
    });
  };
  
  const selectedProject = projects.find(p => p.id === newPR.projectId);
  const projectBudgetItems = selectedProject 
    ? budgetItems.filter(item => item.projectId === selectedProject.id)
    : [];
  
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
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create Purchase Request</DialogTitle>
                <DialogDescription>
                  Complete the form below to create a new purchase request. This will be subject to budget availability.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="projectId" className="text-right">
                    Project
                  </Label>
                  <div className="col-span-3">
                    <Select
                      value={newPR.projectId}
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
                  <Label htmlFor="requestType" className="text-right">
                    Request Type
                  </Label>
                  <div className="col-span-3">
                    <Select
                      value={newPR.requestType}
                      onValueChange={(value) => handleSelectChange("requestType", value)}
                    >
                      <SelectTrigger id="requestType">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Material">Material</SelectItem>
                        <SelectItem value="Service">Service</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="requesterName" className="text-right">
                    Requester Name
                  </Label>
                  <Input
                    id="requesterName"
                    name="requesterName"
                    value={newPR.requesterName}
                    onChange={handleInputChange}
                    className="col-span-3"
                    placeholder="Your name"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="requiredByDate" className="text-right">
                    Required By
                  </Label>
                  <Input
                    id="requiredByDate"
                    name="requiredByDate"
                    type="date"
                    value={newPR.requiredByDate}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="costCodeReference" className="text-right">
                    Cost Code
                  </Label>
                  <Input
                    id="costCodeReference"
                    name="costCodeReference"
                    value={newPR.costCodeReference}
                    onChange={handleInputChange}
                    className="col-span-3"
                    placeholder="e.g., HVR-2023-CIVIL-001"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="budgetItemId" className="text-right">
                    Budget Item
                  </Label>
                  <div className="col-span-3">
                    <Select
                      value={newPR.budgetItemId}
                      onValueChange={(value) => handleSelectChange("budgetItemId", value)}
                      disabled={!newPR.projectId}
                    >
                      <SelectTrigger id="budgetItemId">
                        <SelectValue placeholder={!newPR.projectId ? "Select a project first" : "Select budget item"} />
                      </SelectTrigger>
                      <SelectContent>
                        {projectBudgetItems.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.description}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="quantity" className="text-right">
                    Quantity
                  </Label>
                  <Input
                    id="quantity"
                    name="quantity"
                    type="number"
                    value={newPR.quantity}
                    onChange={handleInputChange}
                    className="col-span-3"
                    min={1}
                  />
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="justification" className="text-right pt-2">
                    Justification
                  </Label>
                  <Textarea
                    id="justification"
                    name="justification"
                    value={newPR.justification}
                    onChange={handleInputChange}
                    className="col-span-3"
                    placeholder="Explain why this purchase is needed"
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCreatePR}
                  disabled={
                    !newPR.projectId ||
                    !newPR.requesterName ||
                    !newPR.requiredByDate ||
                    !newPR.budgetItemId
                  }
                >
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
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Project</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Request Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Requester</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Request Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Required By</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {purchaseRequests.map((pr) => (
                    <tr key={pr.id} className="border-b hover:bg-secondary/30">
                      <td className="px-4 py-3">
                        {projects.find(p => p.id === pr.projectId)?.name || 'Unknown'}
                      </td>
                      <td className="px-4 py-3">{pr.requestType}</td>
                      <td className="px-4 py-3">{pr.requesterName}</td>
                      <td className="px-4 py-3">{formatDate(pr.requestDate)}</td>
                      <td className="px-4 py-3">{formatDate(pr.requiredByDate)}</td>
                      <td className="px-4 py-3">
                        <Badge variant={
                          pr.status === 'Approved' ? 'default' :
                          pr.status === 'Pending Approval' ? 'outline' :
                          pr.status === 'Converted to PO' ? 'success' :
                          pr.status === 'Rejected' ? 'destructive' : 'secondary'
                        }>
                          {pr.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm">View</Button>
                          {pr.status === 'Approved' && (
                            <Button size="sm">Create PO</Button>
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

export default PurchaseRequestsPage;
