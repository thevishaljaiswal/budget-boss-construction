
import React from "react";
import { useAppContext } from "@/context/AppContext";
import PageHeader from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency, formatPercentage } from "@/utils/formatters";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const ReportsPage: React.FC = () => {
  const { projects, budgetItems, purchaseOrders } = useAppContext();
  
  // Budget breakdown by category
  const budgetByCategory = budgetItems.reduce((acc, item) => {
    const categoryId = item.categoryId;
    if (!acc[categoryId]) {
      acc[categoryId] = 0;
    }
    acc[categoryId] += item.grandTotal;
    return acc;
  }, {} as Record<string, number>);
  
  const budgetCategoryData = Object.entries(budgetByCategory).map(([categoryId, total]) => ({
    name: `Category ${categoryId}`,
    value: total,
  }));
  
  // Project budget utilization
  const projectUtilizationData = projects.map(project => ({
    name: project.name,
    budget: project.totalBudget,
    committed: project.committedBudget,
    actual: project.actualSpend,
    remaining: project.totalBudget - project.committedBudget,
    utilization: (project.committedBudget / project.totalBudget) * 100,
  }));
  
  // Procurement status summary
  const procurementStatusData = [
    {
      name: 'Draft',
      value: purchaseOrders.filter(po => po.status === 'Draft').length,
    },
    {
      name: 'Issued',
      value: purchaseOrders.filter(po => po.status === 'Issued').length,
    },
    {
      name: 'Partially Received',
      value: purchaseOrders.filter(po => po.status === 'Partially Received').length,
    },
    {
      name: 'Completed',
      value: purchaseOrders.filter(po => po.status === 'Completed').length,
    },
    {
      name: 'Cancelled',
      value: purchaseOrders.filter(po => po.status === 'Cancelled').length,
    },
  ];
  
  // Colors for pie charts
  const COLORS = [
    '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', 
    '#82CA9D', '#FDBF6F', '#FF6584', '#6977DA', '#20B2AA'
  ];
  
  return (
    <div className="space-y-8">
      <PageHeader
        title="Reports"
        description="Generate and view project reports and analytics."
        action={
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Export Reports
          </Button>
        }
      />

      <Tabs defaultValue="budget">
        <TabsList className="mb-4">
          <TabsTrigger value="budget">Budget Reports</TabsTrigger>
          <TabsTrigger value="procurement">Procurement Reports</TabsTrigger>
          <TabsTrigger value="performance">Performance Reports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="budget" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Budget Utilization by Project</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                {projectUtilizationData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={projectUtilizationData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                    >
                      <XAxis 
                        dataKey="name" 
                        angle={-45} 
                        textAnchor="end"
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(value as number)} />
                      <Legend />
                      <Bar dataKey="budget" name="Total Budget" fill="#8884d8" />
                      <Bar dataKey="committed" name="Committed" fill="#82ca9d" />
                      <Bar dataKey="actual" name="Actual Spent" fill="#ffc658" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-muted-foreground">No data available.</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Budget Breakdown by Category</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                {budgetCategoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={budgetCategoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} (${formatPercentage(percent * 100)})`}
                      >
                        {budgetCategoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(value as number)} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-muted-foreground">No data available.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Budget Variance Report</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Project</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Total Budget</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Committed</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Actual Spent</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Remaining</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Utilization</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projectUtilizationData.map((project, index) => (
                      <tr key={index} className="border-b hover:bg-secondary/30">
                        <td className="px-4 py-3">{project.name}</td>
                        <td className="px-4 py-3">{formatCurrency(project.budget)}</td>
                        <td className="px-4 py-3">{formatCurrency(project.committed)}</td>
                        <td className="px-4 py-3">{formatCurrency(project.actual)}</td>
                        <td className="px-4 py-3">{formatCurrency(project.remaining)}</td>
                        <td className="px-4 py-3">{formatPercentage(project.utilization)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-end mt-4">
                <Button variant="outline" size="sm">
                  <FileText className="mr-2 h-4 w-4" />
                  Export to Excel
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="procurement" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Purchase Orders by Status</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                {procurementStatusData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={procurementStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} (${formatPercentage(percent * 100)})`}
                      >
                        {procurementStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-muted-foreground">No data available.</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Procurement Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Purchase Orders</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-secondary/40 p-4 rounded-md">
                        <p className="text-sm text-muted-foreground">Total POs</p>
                        <p className="text-2xl font-bold">{purchaseOrders.filter(po => po.type === 'PO').length}</p>
                      </div>
                      <div className="bg-secondary/40 p-4 rounded-md">
                        <p className="text-sm text-muted-foreground">Total Value</p>
                        <p className="text-2xl font-bold">
                          {formatCurrency(
                            purchaseOrders
                              .filter(po => po.type === 'PO')
                              .reduce((sum, po) => sum + po.totalAmount, 0)
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">Work Orders</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-secondary/40 p-4 rounded-md">
                        <p className="text-sm text-muted-foreground">Total WOs</p>
                        <p className="text-2xl font-bold">{purchaseOrders.filter(po => po.type === 'WO').length}</p>
                      </div>
                      <div className="bg-secondary/40 p-4 rounded-md">
                        <p className="text-sm text-muted-foreground">Total Value</p>
                        <p className="text-2xl font-bold">
                          {formatCurrency(
                            purchaseOrders
                              .filter(po => po.type === 'WO')
                              .reduce((sum, po) => sum + po.totalAmount, 0)
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Procurement Timeline</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <div className="flex h-full items-center justify-center">
                <p className="text-muted-foreground">Additional procurement timeline data will be shown here.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Project Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <div className="flex h-full items-center justify-center">
                <p className="text-muted-foreground">Project performance metrics will be shown here.</p>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Cost Variance Analysis</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <div className="flex h-full items-center justify-center">
                  <p className="text-muted-foreground">Cost variance analysis data will be shown here.</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Schedule Performance</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <div className="flex h-full items-center justify-center">
                  <p className="text-muted-foreground">Schedule performance data will be shown here.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsPage;
