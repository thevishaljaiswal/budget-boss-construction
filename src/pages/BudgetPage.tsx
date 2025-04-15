
import React, { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import PageHeader from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Project } from "@/types";
import { formatCurrency } from "@/utils/formatters";
import { PlusCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const BudgetPage: React.FC = () => {
  const { projects, budgetItems } = useAppContext();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  
  const selectedProject = selectedProjectId 
    ? projects.find(p => p.id === selectedProjectId) 
    : null;
  
  const projectBudgetItems = selectedProject 
    ? budgetItems.filter(item => item.projectId === selectedProject.id)
    : [];
  
  return (
    <div className="space-y-8">
      <PageHeader
        title="Budget Management"
        description="Manage and monitor project budgets, work packages, and BOQ items."
        action={
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Budget Item
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Project Selection</CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={selectedProjectId || ""}
            onValueChange={(value) => setSelectedProjectId(value || null)}
          >
            <SelectTrigger className="w-full sm:w-[300px]">
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
        </CardContent>
      </Card>

      {selectedProject ? (
        <>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">{selectedProject.name} Budget</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Code: {selectedProject.code} | Status: {selectedProject.budgetStatus}
                </p>
              </div>
              <Badge
                variant={
                  selectedProject.budgetStatus === "Approved"
                    ? "default"
                    : selectedProject.budgetStatus === "Pending Approval"
                    ? "warning"
                    : selectedProject.budgetStatus === "Locked"
                    ? "success"
                    : "outline"
                }
              >
                {selectedProject.budgetStatus}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="bg-secondary/40 p-4 rounded-md">
                  <p className="text-sm font-medium">Total Budget</p>
                  <p className="text-2xl font-bold">{formatCurrency(selectedProject.totalBudget)}</p>
                </div>
                <div className="bg-secondary/40 p-4 rounded-md">
                  <p className="text-sm font-medium">Committed</p>
                  <p className="text-2xl font-bold">{formatCurrency(selectedProject.committedBudget)}</p>
                </div>
                <div className="bg-secondary/40 p-4 rounded-md">
                  <p className="text-sm font-medium">Actual Spent</p>
                  <p className="text-2xl font-bold">{formatCurrency(selectedProject.actualSpend)}</p>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 mt-4">
                <Button variant="outline">Export Budget</Button>
                <Button variant="outline">Import BOQ</Button>
                <Button>Add Budget Item</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Budget Items</CardTitle>
            </CardHeader>
            <CardContent>
              {projectBudgetItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 bg-secondary/30 rounded-lg">
                  <p className="text-muted-foreground mb-4">No budget items have been added yet.</p>
                  <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add First Budget Item
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="px-2 py-3 text-left text-xs font-medium text-muted-foreground">Description</th>
                        <th className="px-2 py-3 text-left text-xs font-medium text-muted-foreground">Category</th>
                        <th className="px-2 py-3 text-left text-xs font-medium text-muted-foreground">UOM</th>
                        <th className="px-2 py-3 text-left text-xs font-medium text-muted-foreground">Quantity</th>
                        <th className="px-2 py-3 text-left text-xs font-medium text-muted-foreground">Unit Rate</th>
                        <th className="px-2 py-3 text-left text-xs font-medium text-muted-foreground">Total</th>
                        <th className="px-2 py-3 text-left text-xs font-medium text-muted-foreground">Contingency %</th>
                        <th className="px-2 py-3 text-left text-xs font-medium text-muted-foreground">Grand Total</th>
                        <th className="px-2 py-3 text-left text-xs font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projectBudgetItems.map((item) => (
                        <tr key={item.id} className="border-b hover:bg-secondary/30">
                          <td className="px-2 py-3">{item.description}</td>
                          <td className="px-2 py-3">{item.categoryId}</td>
                          <td className="px-2 py-3">{item.uom}</td>
                          <td className="px-2 py-3">{item.quantity}</td>
                          <td className="px-2 py-3">{formatCurrency(item.rate)}</td>
                          <td className="px-2 py-3">{formatCurrency(item.totalAmount)}</td>
                          <td className="px-2 py-3">{item.contingencyPercentage}%</td>
                          <td className="px-2 py-3">{formatCurrency(item.grandTotal)}</td>
                          <td className="px-2 py-3">
                            <Button variant="ghost" size="sm">Edit</Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-secondary/30">
                        <td className="px-2 py-3 font-medium" colSpan={5}>Total</td>
                        <td className="px-2 py-3 font-medium">
                          {formatCurrency(
                            projectBudgetItems.reduce((sum, item) => sum + item.totalAmount, 0)
                          )}
                        </td>
                        <td className="px-2 py-3"></td>
                        <td className="px-2 py-3 font-medium">
                          {formatCurrency(
                            projectBudgetItems.reduce((sum, item) => sum + item.grandTotal, 0)
                          )}
                        </td>
                        <td className="px-2 py-3"></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-60 bg-secondary/30 rounded-lg">
          <p className="text-muted-foreground mb-4">Please select a project to view its budget details.</p>
        </div>
      )}
    </div>
  );
};

export default BudgetPage;
