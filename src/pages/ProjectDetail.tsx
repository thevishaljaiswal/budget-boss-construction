
import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";
import PageHeader from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, MapPin, User, Building, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency, formatDate, formatPercentage, getBudgetStatusColor, calculateBudgetUtilization } from "@/utils/formatters";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    projects, 
    budgetItems,
    purchaseRequests,
    purchaseOrders,
    setSelectedProject 
  } = useAppContext();

  const project = projects.find(p => p.id === id);
  
  useEffect(() => {
    if (project) {
      setSelectedProject(project);
    } else {
      toast.error("Project not found", {
        description: "The requested project could not be found.",
      });
      navigate("/projects");
    }
    
    return () => {
      setSelectedProject(null);
    };
  }, [project, id, navigate, setSelectedProject]);
  
  if (!project) {
    return <div>Loading...</div>;
  }
  
  // Project budget items
  const projectBudgetItems = budgetItems.filter(item => item.projectId === project.id);
  
  // Project purchase requests
  const projectPRs = purchaseRequests.filter(pr => pr.projectId === project.id);
  
  // Project purchase orders
  const projectPOs = purchaseOrders.filter(po => po.projectId === project.id);
  
  const budgetUtilization = calculateBudgetUtilization(
    project.committedBudget,
    project.totalBudget
  );
  
  const statusColor = getBudgetStatusColor(
    project.committedBudget,
    project.totalBudget
  );

  return (
    <div className="space-y-8">
      <PageHeader
        title={project.name}
        description={`Project Code: ${project.code}`}
        action={
          <Button variant="outline" onClick={() => navigate("/projects")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-md font-medium">Project Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <span>{project.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-muted-foreground" />
              <span>Manager: {project.projectManager}</span>
            </div>
            <div className="flex items-center gap-2">
              <Building className="h-5 w-5 text-muted-foreground" />
              <span>Client: {project.clientName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <span>
                {formatDate(project.startDate)} — {formatDate(project.endDate)}
              </span>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <Badge
                variant={
                  project.status === "Active"
                    ? "default"
                    : project.status === "Planning"
                    ? "outline"
                    : project.status === "Completed"
                    ? "success"
                    : "secondary"
                }
              >
                Status: {project.status}
              </Badge>
              <Badge
                variant={
                  project.budgetStatus === "Approved"
                    ? "default"
                    : project.budgetStatus === "Pending Approval"
                    ? "warning"
                    : project.budgetStatus === "Locked"
                    ? "success"
                    : "outline"
                }
              >
                Budget: {project.budgetStatus}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-md font-medium">Budget Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-2xl font-bold">
              {formatCurrency(project.totalBudget)}
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Budget Utilization</span>
                <span>{formatPercentage(budgetUtilization)}</span>
              </div>
              <div className="budget-progress">
                <div
                  className={`budget-progress-bar ${statusColor}`}
                  style={{ width: `${Math.min(budgetUtilization, 100)}%` }}
                ></div>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 pt-2">
              <div>
                <p className="text-xs text-muted-foreground">Total Budget</p>
                <p className="font-medium">{formatCurrency(project.totalBudget)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Committed</p>
                <p className="font-medium">{formatCurrency(project.committedBudget)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Actual</p>
                <p className="font-medium">{formatCurrency(project.actualSpend)}</p>
              </div>
            </div>
            
            {budgetUtilization > 80 && (
              <div className="flex items-center gap-2 pt-2 text-warning">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">Budget utilization above 80%</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-md font-medium">Procurement Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Purchase Requests</p>
                <p className="text-2xl font-bold">{projectPRs.length}</p>
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Pending</p>
                    <p className="font-medium">
                      {projectPRs.filter(pr => pr.status === 'Pending Approval').length}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Approved</p>
                    <p className="font-medium">
                      {projectPRs.filter(pr => pr.status === 'Approved' || pr.status === 'Converted to PO').length}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Purchase Orders</p>
                <p className="text-2xl font-bold">{projectPOs.length}</p>
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <div>
                    <p className="text-xs text-muted-foreground">In Progress</p>
                    <p className="font-medium">
                      {projectPOs.filter(po => po.status === 'Issued' || po.status === 'Partially Received').length}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Completed</p>
                    <p className="font-medium">
                      {projectPOs.filter(po => po.status === 'Completed').length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="pt-4">
              <Button variant="outline" className="w-full" onClick={() => navigate('/purchase-requests')}>
                Create Purchase Request
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="budget" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="budget">Budget</TabsTrigger>
          <TabsTrigger value="purchaseRequests">Purchase Requests</TabsTrigger>
          <TabsTrigger value="purchaseOrders">Purchase Orders</TabsTrigger>
        </TabsList>
        
        <TabsContent value="budget" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Budget Items</CardTitle>
              <CardDescription>
                Manage project budget line items and track spending
              </CardDescription>
              <div className="flex justify-end">
                <Button variant="outline" size="sm">
                  Add Budget Item
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {projectBudgetItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <p className="text-muted-foreground mb-2">No budget items have been added yet.</p>
                  <Button>Create First Budget Item</Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="px-2 py-3 text-left text-xs font-medium text-muted-foreground">Description</th>
                        <th className="px-2 py-3 text-left text-xs font-medium text-muted-foreground">UOM</th>
                        <th className="px-2 py-3 text-left text-xs font-medium text-muted-foreground">Qty</th>
                        <th className="px-2 py-3 text-left text-xs font-medium text-muted-foreground">Rate</th>
                        <th className="px-2 py-3 text-left text-xs font-medium text-muted-foreground">Total</th>
                        <th className="px-2 py-3 text-left text-xs font-medium text-muted-foreground">Cont. %</th>
                        <th className="px-2 py-3 text-left text-xs font-medium text-muted-foreground">Grand Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projectBudgetItems.map((item) => (
                        <tr key={item.id} className="border-b hover:bg-secondary/30">
                          <td className="px-2 py-3">{item.description}</td>
                          <td className="px-2 py-3">{item.uom}</td>
                          <td className="px-2 py-3">{item.quantity}</td>
                          <td className="px-2 py-3">{formatCurrency(item.rate)}</td>
                          <td className="px-2 py-3">{formatCurrency(item.totalAmount)}</td>
                          <td className="px-2 py-3">{item.contingencyPercentage}%</td>
                          <td className="px-2 py-3">{formatCurrency(item.grandTotal)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="purchaseRequests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Purchase Requests</CardTitle>
              <CardDescription>
                Create and manage purchase requests for materials and services
              </CardDescription>
              <div className="flex justify-end">
                <Button>
                  Create Purchase Request
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {projectPRs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <p className="text-muted-foreground mb-2">No purchase requests found for this project.</p>
                  <Button>Create First Purchase Request</Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="px-2 py-3 text-left text-xs font-medium text-muted-foreground">Request Type</th>
                        <th className="px-2 py-3 text-left text-xs font-medium text-muted-foreground">Requester</th>
                        <th className="px-2 py-3 text-left text-xs font-medium text-muted-foreground">Date</th>
                        <th className="px-2 py-3 text-left text-xs font-medium text-muted-foreground">Required By</th>
                        <th className="px-2 py-3 text-left text-xs font-medium text-muted-foreground">Status</th>
                        <th className="px-2 py-3 text-left text-xs font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projectPRs.map((pr) => (
                        <tr key={pr.id} className="border-b hover:bg-secondary/30">
                          <td className="px-2 py-3">{pr.requestType}</td>
                          <td className="px-2 py-3">{pr.requesterName}</td>
                          <td className="px-2 py-3">{formatDate(pr.requestDate)}</td>
                          <td className="px-2 py-3">{formatDate(pr.requiredByDate)}</td>
                          <td className="px-2 py-3">
                            <Badge variant={
                              pr.status === 'Approved' ? 'default' :
                              pr.status === 'Pending Approval' ? 'outline' :
                              pr.status === 'Converted to PO' ? 'success' :
                              pr.status === 'Rejected' ? 'destructive' : 'secondary'
                            }>
                              {pr.status}
                            </Badge>
                          </td>
                          <td className="px-2 py-3">
                            <Button variant="ghost" size="sm">View</Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="purchaseOrders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Purchase Orders</CardTitle>
              <CardDescription>
                Create and manage purchase and work orders
              </CardDescription>
              <div className="flex justify-end">
                <Button>
                  Create Purchase Order
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {projectPOs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <p className="text-muted-foreground mb-2">No purchase orders found for this project.</p>
                  <Button>Create First Purchase Order</Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="px-2 py-3 text-left text-xs font-medium text-muted-foreground">PO/WO</th>
                        <th className="px-2 py-3 text-left text-xs font-medium text-muted-foreground">Vendor</th>
                        <th className="px-2 py-3 text-left text-xs font-medium text-muted-foreground">Issue Date</th>
                        <th className="px-2 py-3 text-left text-xs font-medium text-muted-foreground">Delivery Date</th>
                        <th className="px-2 py-3 text-left text-xs font-medium text-muted-foreground">Amount</th>
                        <th className="px-2 py-3 text-left text-xs font-medium text-muted-foreground">Status</th>
                        <th className="px-2 py-3 text-left text-xs font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projectPOs.map((po) => (
                        <tr key={po.id} className="border-b hover:bg-secondary/30">
                          <td className="px-2 py-3">{po.type === 'PO' ? 'Purchase Order' : 'Work Order'}</td>
                          <td className="px-2 py-3">{po.vendorId}</td>
                          <td className="px-2 py-3">{formatDate(po.issueDate)}</td>
                          <td className="px-2 py-3">{formatDate(po.deliveryDate)}</td>
                          <td className="px-2 py-3">{formatCurrency(po.totalAmount)}</td>
                          <td className="px-2 py-3">
                            <Badge variant={
                              po.status === 'Issued' ? 'default' :
                              po.status === 'Draft' ? 'outline' :
                              po.status === 'Completed' ? 'success' :
                              po.status === 'Cancelled' ? 'destructive' : 'secondary'
                            }>
                              {po.status}
                            </Badge>
                          </td>
                          <td className="px-2 py-3">
                            <Button variant="ghost" size="sm">View</Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectDetail;
