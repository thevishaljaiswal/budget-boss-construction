import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/context/AppContext";
import MainLayout from "@/components/layout/MainLayout";
import Dashboard from "@/pages/Dashboard";
import ProjectsPage from "@/pages/ProjectsPage";
import ProjectDetail from "@/pages/ProjectDetail";
import BudgetPage from "@/pages/BudgetPage";
import PurchaseRequestsPage from "@/pages/PurchaseRequestsPage";
import PurchaseOrdersPage from "@/pages/PurchaseOrdersPage";
import WorkOrdersPage from "@/pages/WorkOrdersPage";
import GoodsReceiptPage from "@/pages/GoodsReceiptPage";
import VendorsPage from "@/pages/VendorsPage";
import InvoicesPage from "@/pages/InvoicesPage";
import AdvanceRequestsPage from "@/pages/AdvanceRequestsPage";
import AdvancePaymentsPage from "@/pages/AdvancePaymentsPage";
import AdvanceAdjustmentsPage from "@/pages/AdvanceAdjustmentsPage";
import InvoicePaymentsPage from "@/pages/InvoicePaymentsPage";
import ReportsPage from "@/pages/ReportsPage";
import NotFound from "@/pages/NotFound";
import RequestForQuotationsPage from "@/pages/RequestForQuotationsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route
              path="/"
              element={
                <MainLayout>
                  <Dashboard />
                </MainLayout>
              }
            />
            <Route
              path="/projects"
              element={
                <MainLayout>
                  <ProjectsPage />
                </MainLayout>
              }
            />
            <Route
              path="/projects/:id"
              element={
                <MainLayout>
                  <ProjectDetail />
                </MainLayout>
              }
            />
            <Route
              path="/budget"
              element={
                <MainLayout>
                  <BudgetPage />
                </MainLayout>
              }
            />
            <Route
              path="/purchase-requests"
              element={
                <MainLayout>
                  <PurchaseRequestsPage />
                </MainLayout>
              }
            />
            <Route
              path="/purchase-orders"
              element={
                <MainLayout>
                  <PurchaseOrdersPage />
                </MainLayout>
              }
            />
            <Route
              path="/work-orders"
              element={
                <MainLayout>
                  <WorkOrdersPage />
                </MainLayout>
              }
            />
            <Route
              path="/goods-receipts"
              element={
                <MainLayout>
                  <GoodsReceiptPage />
                </MainLayout>
              }
            />
            <Route
              path="/invoices"
              element={
                <MainLayout>
                  <InvoicesPage />
                </MainLayout>
              }
            />
            <Route
              path="/advance-requests"
              element={
                <MainLayout>
                  <AdvanceRequestsPage />
                </MainLayout>
              }
            />
            <Route
              path="/advance-payments"
              element={
                <MainLayout>
                  <AdvancePaymentsPage />
                </MainLayout>
              }
            />
            <Route
              path="/advance-adjustments"
              element={
                <MainLayout>
                  <AdvanceAdjustmentsPage />
                </MainLayout>
              }
            />
            <Route
              path="/invoice-payments"
              element={
                <MainLayout>
                  <InvoicePaymentsPage />
                </MainLayout>
              }
            />
            <Route
              path="/vendors"
              element={
                <MainLayout>
                  <VendorsPage />
                </MainLayout>
              }
            />
            <Route
              path="/reports"
              element={
                <MainLayout>
                  <ReportsPage />
                </MainLayout>
              }
            />
            <Route
              path="/rfq"
              element={
                <MainLayout>
                  <RequestForQuotationsPage />
                </MainLayout>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AppProvider>
  </QueryClientProvider>
);

export default App;
