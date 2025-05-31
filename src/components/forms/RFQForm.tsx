
import React, { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { generateUniqueId } from "@/utils/formatters";
import { RequestForQuotation, RFQLineItem } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface RFQFormProps {
  onSuccess: () => void;
}

const RFQForm: React.FC<RFQFormProps> = ({ onSuccess }) => {
  const { 
    projects, 
    purchaseRequests, 
    vendors, 
    addRequestForQuotation, 
    addRFQLineItem 
  } = useAppContext();
  
  const [formData, setFormData] = useState({
    projectId: "",
    title: "",
    description: "",
    responseDeadline: "",
    deliveryLocation: "",
    paymentTerms: "Net 30 days",
    validityPeriod: 30,
    technicalSpecifications: "",
    specialTerms: "",
  });
  
  const [selectedPRs, setSelectedPRs] = useState<string[]>([]);
  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePRSelection = (prId: string, checked: boolean) => {
    if (checked) {
      setSelectedPRs(prev => [...prev, prId]);
    } else {
      setSelectedPRs(prev => prev.filter(id => id !== prId));
    }
  };

  const handleVendorSelection = (vendorId: string, checked: boolean) => {
    if (checked) {
      setSelectedVendors(prev => [...prev, vendorId]);
    } else {
      setSelectedVendors(prev => prev.filter(id => id !== vendorId));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const currentDate = new Date().toISOString().split("T")[0];
    const rfqId = generateUniqueId();
    
    // Generate RFQ number
    const selectedProject = projects.find(p => p.id === formData.projectId);
    const rfqNumber = `RFQ-${selectedProject?.code || 'PROJ'}-${Date.now()}`;
    
    // Create RFQ
    const rfq: RequestForQuotation = {
      id: rfqId,
      projectId: formData.projectId,
      rfqNumber,
      purchaseRequestIds: selectedPRs,
      title: formData.title,
      description: formData.description,
      issueDate: currentDate,
      responseDeadline: formData.responseDeadline,
      deliveryLocation: formData.deliveryLocation,
      paymentTerms: formData.paymentTerms,
      validityPeriod: formData.validityPeriod,
      technicalSpecifications: formData.technicalSpecifications,
      specialTerms: formData.specialTerms,
      status: 'Draft',
      createdBy: 'Current User', // In real app, get from auth context
      vendorIds: selectedVendors,
    };
    
    addRequestForQuotation(rfq);
    
    // Create RFQ line items for each selected PR
    selectedPRs.forEach(prId => {
      const pr = purchaseRequests.find(p => p.id === prId);
      if (pr) {
        const lineItem: RFQLineItem = {
          id: generateUniqueId(),
          rfqId,
          purchaseRequestId: prId,
          itemDescription: `${pr.requestType}: ${pr.justification}`,
          quantity: pr.quantity,
          uom: 'unit', // Default UOM, can be customized
          technicalSpecs: pr.justification,
          deliveryDate: pr.requiredByDate,
        };
        addRFQLineItem(lineItem);
      }
    });
    
    onSuccess();
  };

  const selectedProject = projects.find(p => p.id === formData.projectId);
  const approvedPRs = purchaseRequests.filter(
    pr => pr.projectId === formData.projectId && pr.status === 'Approved'
  );

  const isFormValid = () => {
    return formData.projectId && 
           formData.title && 
           formData.responseDeadline && 
           formData.deliveryLocation &&
           selectedPRs.length > 0 &&
           selectedVendors.length > 0;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="projectId">Project *</Label>
          <Select
            value={formData.projectId}
            onValueChange={(value) => handleSelectChange("projectId", value)}
          >
            <SelectTrigger>
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
          <Label htmlFor="responseDeadline">Response Deadline *</Label>
          <Input
            id="responseDeadline"
            name="responseDeadline"
            type="date"
            value={formData.responseDeadline}
            onChange={handleInputChange}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">RFQ Title *</Label>
        <Input
          id="title"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          placeholder="Enter RFQ title"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Describe the RFQ requirements"
          rows={3}
        />
      </div>

      {/* Purchase Requests Selection */}
      {formData.projectId && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Select Purchase Requests</CardTitle>
          </CardHeader>
          <CardContent>
            {approvedPRs.length === 0 ? (
              <p className="text-muted-foreground">No approved purchase requests found for this project.</p>
            ) : (
              <div className="space-y-3">
                {approvedPRs.map((pr) => (
                  <div key={pr.id} className="flex items-center space-x-3">
                    <Checkbox
                      id={`pr-${pr.id}`}
                      checked={selectedPRs.includes(pr.id)}
                      onCheckedChange={(checked) => 
                        handlePRSelection(pr.id, checked as boolean)
                      }
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{pr.requestType}</Badge>
                        <span className="font-medium">{pr.costCodeReference}</span>
                        <span className="text-sm text-muted-foreground">
                          Qty: {pr.quantity}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{pr.justification}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Vendor Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Select Vendors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {vendors.map((vendor) => (
              <div key={vendor.id} className="flex items-center space-x-3">
                <Checkbox
                  id={`vendor-${vendor.id}`}
                  checked={selectedVendors.includes(vendor.id)}
                  onCheckedChange={(checked) => 
                    handleVendorSelection(vendor.id, checked as boolean)
                  }
                />
                <div>
                  <span className="font-medium">{vendor.name}</span>
                  <p className="text-sm text-muted-foreground">{vendor.contactPerson}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="deliveryLocation">Delivery Location *</Label>
          <Input
            id="deliveryLocation"
            name="deliveryLocation"
            value={formData.deliveryLocation}
            onChange={handleInputChange}
            placeholder="Site delivery address"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="paymentTerms">Payment Terms</Label>
          <Select
            value={formData.paymentTerms}
            onValueChange={(value) => handleSelectChange("paymentTerms", value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Net 30 days">Net 30 days</SelectItem>
              <SelectItem value="Net 45 days">Net 45 days</SelectItem>
              <SelectItem value="Net 60 days">Net 60 days</SelectItem>
              <SelectItem value="Advance Payment">Advance Payment</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="validityPeriod">Validity Period (days)</Label>
          <Input
            id="validityPeriod"
            name="validityPeriod"
            type="number"
            value={formData.validityPeriod}
            onChange={handleInputChange}
            min={1}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="technicalSpecifications">Technical Specifications</Label>
        <Textarea
          id="technicalSpecifications"
          name="technicalSpecifications"
          value={formData.technicalSpecifications}
          onChange={handleInputChange}
          placeholder="Technical requirements and specifications"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="specialTerms">Special Terms & Conditions</Label>
        <Textarea
          id="specialTerms"
          name="specialTerms"
          value={formData.specialTerms}
          onChange={handleInputChange}
          placeholder="Any special terms or conditions"
          rows={3}
        />
      </div>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Cancel
        </Button>
        <Button type="submit" disabled={!isFormValid()}>
          Create RFQ
        </Button>
      </div>
    </form>
  );
};

export default RFQForm;
