
import React, { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import PageHeader from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Mail, Phone, Building, MapPin, CreditCard } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import VendorForm from "@/components/forms/VendorForm";
import { Vendor } from "@/types";

const VendorsPage: React.FC = () => {
  const { vendors, addVendor } = useAppContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  
  // Filter vendors by search term
  const filteredVendors = vendors.filter(
    vendor => 
      vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleVendorCreate = (vendor: Vendor) => {
    addVendor(vendor);
    setIsOpen(false);
  };
  
  return (
    <div className="space-y-8">
      <PageHeader
        title="Vendors"
        description="Manage vendors and suppliers for your construction projects."
        action={
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Vendor
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Vendor</DialogTitle>
                <DialogDescription>
                  Add a new vendor or supplier to your vendor database.
                </DialogDescription>
              </DialogHeader>
              <VendorForm 
                onSuccess={() => setIsOpen(false)}
                onVendorCreate={handleVendorCreate}
              />
            </DialogContent>
          </Dialog>
        }
      />

      <div className="flex justify-between items-center">
        <Input
          placeholder="Search vendors..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {filteredVendors.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-60 py-6">
            <p className="text-muted-foreground mb-4">
              {searchTerm ? "No vendors match your search criteria." : "No vendors have been added yet."}
            </p>
            {!searchTerm && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add First Vendor
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Vendor</DialogTitle>
                    <DialogDescription>
                      Add a new vendor or supplier to your vendor database.
                    </DialogDescription>
                  </DialogHeader>
                  <VendorForm 
                    onSuccess={() => {}}
                    onVendorCreate={handleVendorCreate}
                  />
                </DialogContent>
              </Dialog>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredVendors.map((vendor) => (
            <Card key={vendor.id}>
              <CardContent className="p-6">
                <div className="flex flex-col space-y-4">
                  <div>
                    <h3 className="text-lg font-bold">{vendor.name}</h3>
                    <p className="text-sm text-muted-foreground">{vendor.contactPerson}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{vendor.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{vendor.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {[vendor.city, vendor.state, vendor.country].filter(Boolean).join(", ")}
                      </span>
                    </div>
                    {vendor.gstin && (
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">GSTIN: {vendor.gstin}</span>
                      </div>
                    )}
                    {vendor.bankName && (
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{vendor.bankName}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end space-x-2 pt-2">
                    <Button variant="outline" size="sm">Edit</Button>
                    <Button size="sm">View Orders</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default VendorsPage;
