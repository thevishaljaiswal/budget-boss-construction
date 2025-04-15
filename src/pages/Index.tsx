
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import Dashboard from '@/pages/Dashboard';
import ProjectsPage from '@/pages/ProjectsPage';
import ProjectDetail from '@/pages/ProjectDetail';
import BudgetPage from '@/pages/BudgetPage';
import PurchaseRequestsPage from '@/pages/PurchaseRequestsPage';
import PurchaseOrdersPage from '@/pages/PurchaseOrdersPage';
import WorkOrdersPage from '@/pages/WorkOrdersPage';
import VendorsPage from '@/pages/VendorsPage';
import GoodsReceiptPage from '@/pages/GoodsReceiptPage';
import ReportsPage from '@/pages/ReportsPage';
import NotFound from '@/pages/NotFound';

const Index: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="projects/:id" element={<ProjectDetail />} />
        <Route path="budget" element={<BudgetPage />} />
        <Route path="purchase-requests" element={<PurchaseRequestsPage />} />
        <Route path="purchase-orders" element={<PurchaseOrdersPage />} />
        <Route path="work-orders" element={<WorkOrdersPage />} />
        <Route path="goods-receipts" element={<GoodsReceiptPage />} />
        <Route path="vendors" element={<VendorsPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default Index;
