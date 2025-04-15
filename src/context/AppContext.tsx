
import React, { createContext, useContext, useState, useMemo } from 'react';
import { 
  Project, 
  BudgetItem, 
  PurchaseRequest, 
  PurchaseOrder,
  Vendor,
  GoodsReceipt,
  Invoice,
  AdvanceRequest,
  AdvancePayment,
  AdvanceAdjustment
} from '@/types';
import { 
  projects as initialProjects,
  budgetItems as initialBudgetItems,
  purchaseRequests as initialPurchaseRequests,
  purchaseOrders as initialPurchaseOrders,
  vendors as initialVendors
} from '@/data/mockData';

interface AppContextType {
  projects: Project[];
  budgetItems: BudgetItem[];
  purchaseRequests: PurchaseRequest[];
  purchaseOrders: PurchaseOrder[];
  vendors: Vendor[];
  goodsReceipts: GoodsReceipt[];
  invoices: Invoice[];
  advanceRequests: AdvanceRequest[];
  advancePayments: AdvancePayment[];
  advanceAdjustments: AdvanceAdjustment[];
  selectedProject: Project | null;
  setSelectedProject: (project: Project | null) => void;
  addProject: (project: Project) => void;
  updateProject: (updatedProject: Project) => void;
  addBudgetItem: (budgetItem: BudgetItem) => void;
  updateBudgetItem: (updatedBudgetItem: BudgetItem) => void;
  addPurchaseRequest: (purchaseRequest: PurchaseRequest) => void;
  updatePurchaseRequest: (updatedPurchaseRequest: PurchaseRequest) => void;
  addPurchaseOrder: (purchaseOrder: PurchaseOrder) => void;
  updatePurchaseOrder: (updatedPurchaseOrder: PurchaseOrder) => void;
  addGoodsReceipt: (goodsReceipt: GoodsReceipt) => void;
  updateGoodsReceipt: (updatedGoodsReceipt: GoodsReceipt) => void;
  addInvoice: (invoice: Invoice) => void;
  updateInvoice: (updatedInvoice: Invoice) => void;
  addAdvanceRequest: (advanceRequest: AdvanceRequest) => void;
  updateAdvanceRequest: (updatedAdvanceRequest: AdvanceRequest) => void;
  addAdvancePayment: (advancePayment: AdvancePayment) => void;
  updateAdvancePayment: (updatedAdvancePayment: AdvancePayment) => void;
  addAdvanceAdjustment: (advanceAdjustment: AdvanceAdjustment) => void;
  updateAdvanceAdjustment: (updatedAdvanceAdjustment: AdvanceAdjustment) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>(initialBudgetItems);
  const [purchaseRequests, setPurchaseRequests] = useState<PurchaseRequest[]>(initialPurchaseRequests);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(initialPurchaseOrders);
  const [vendors] = useState<Vendor[]>(initialVendors);
  const [goodsReceipts, setGoodsReceipts] = useState<GoodsReceipt[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [advanceRequests, setAdvanceRequests] = useState<AdvanceRequest[]>([]);
  const [advancePayments, setAdvancePayments] = useState<AdvancePayment[]>([]);
  const [advanceAdjustments, setAdvanceAdjustments] = useState<AdvanceAdjustment[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(projects[0] || null);

  const addProject = (project: Project) => {
    setProjects([...projects, project]);
  };

  const updateProject = (updatedProject: Project) => {
    setProjects(
      projects.map((project) =>
        project.id === updatedProject.id ? updatedProject : project
      )
    );
  };

  const addBudgetItem = (budgetItem: BudgetItem) => {
    setBudgetItems([...budgetItems, budgetItem]);
  };

  const updateBudgetItem = (updatedBudgetItem: BudgetItem) => {
    setBudgetItems(
      budgetItems.map((item) =>
        item.id === updatedBudgetItem.id ? updatedBudgetItem : item
      )
    );
  };

  const addPurchaseRequest = (purchaseRequest: PurchaseRequest) => {
    setPurchaseRequests([...purchaseRequests, purchaseRequest]);
  };

  const updatePurchaseRequest = (updatedPurchaseRequest: PurchaseRequest) => {
    setPurchaseRequests(
      purchaseRequests.map((pr) =>
        pr.id === updatedPurchaseRequest.id ? updatedPurchaseRequest : pr
      )
    );
  };

  const addPurchaseOrder = (purchaseOrder: PurchaseOrder) => {
    setPurchaseOrders([...purchaseOrders, purchaseOrder]);
  };

  const updatePurchaseOrder = (updatedPurchaseOrder: PurchaseOrder) => {
    setPurchaseOrders(
      purchaseOrders.map((po) =>
        po.id === updatedPurchaseOrder.id ? updatedPurchaseOrder : po
      )
    );
  };

  const addGoodsReceipt = (goodsReceipt: GoodsReceipt) => {
    setGoodsReceipts([...goodsReceipts, goodsReceipt]);
  };

  const updateGoodsReceipt = (updatedGoodsReceipt: GoodsReceipt) => {
    setGoodsReceipts(
      goodsReceipts.map((gr) =>
        gr.id === updatedGoodsReceipt.id ? updatedGoodsReceipt : gr
      )
    );
  };

  const addInvoice = (invoice: Invoice) => {
    setInvoices([...invoices, invoice]);
  };

  const updateInvoice = (updatedInvoice: Invoice) => {
    setInvoices(
      invoices.map((inv) =>
        inv.id === updatedInvoice.id ? updatedInvoice : inv
      )
    );
  };
  
  // Add functions for advance requests
  const addAdvanceRequest = (advanceRequest: AdvanceRequest) => {
    setAdvanceRequests([...advanceRequests, advanceRequest]);
  };

  const updateAdvanceRequest = (updatedAdvanceRequest: AdvanceRequest) => {
    setAdvanceRequests(
      advanceRequests.map((ar) =>
        ar.id === updatedAdvanceRequest.id ? updatedAdvanceRequest : ar
      )
    );
  };

  // Add functions for advance payments
  const addAdvancePayment = (advancePayment: AdvancePayment) => {
    setAdvancePayments([...advancePayments, advancePayment]);
    
    // Update the status of the related advance request to 'Paid'
    const relatedRequest = advanceRequests.find(req => req.id === advancePayment.advanceRequestId);
    if (relatedRequest) {
      updateAdvanceRequest({
        ...relatedRequest,
        status: 'Paid'
      });
    }
  };

  const updateAdvancePayment = (updatedAdvancePayment: AdvancePayment) => {
    setAdvancePayments(
      advancePayments.map((ap) =>
        ap.id === updatedAdvancePayment.id ? updatedAdvancePayment : ap
      )
    );
  };

  // Add functions for advance adjustments
  const addAdvanceAdjustment = (advanceAdjustment: AdvanceAdjustment) => {
    setAdvanceAdjustments([...advanceAdjustments, advanceAdjustment]);
    
    // Update the remaining amount in the related advance payment
    const relatedPayment = advancePayments.find(payment => payment.id === advanceAdjustment.advancePaymentId);
    if (relatedPayment) {
      updateAdvancePayment({
        ...relatedPayment,
        remainingAmount: relatedPayment.remainingAmount - advanceAdjustment.adjustedAmount
      });
    }
  };

  const updateAdvanceAdjustment = (updatedAdvanceAdjustment: AdvanceAdjustment) => {
    setAdvanceAdjustments(
      advanceAdjustments.map((adj) =>
        adj.id === updatedAdvanceAdjustment.id ? updatedAdvanceAdjustment : adj
      )
    );
  };

  const value = useMemo(
    () => ({
      projects,
      budgetItems,
      purchaseRequests,
      purchaseOrders,
      vendors,
      goodsReceipts,
      invoices,
      advanceRequests,
      advancePayments,
      advanceAdjustments,
      selectedProject,
      setSelectedProject,
      addProject,
      updateProject,
      addBudgetItem,
      updateBudgetItem,
      addPurchaseRequest,
      updatePurchaseRequest,
      addPurchaseOrder,
      updatePurchaseOrder,
      addGoodsReceipt,
      updateGoodsReceipt,
      addInvoice,
      updateInvoice,
      addAdvanceRequest,
      updateAdvanceRequest,
      addAdvancePayment,
      updateAdvancePayment,
      addAdvanceAdjustment,
      updateAdvanceAdjustment,
    }),
    [
      projects,
      budgetItems,
      purchaseRequests,
      purchaseOrders,
      vendors,
      goodsReceipts,
      invoices,
      advanceRequests,
      advancePayments,
      advanceAdjustments,
      selectedProject,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
