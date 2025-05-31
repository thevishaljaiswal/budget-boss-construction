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
  AdvanceAdjustment,
  InvoicePayment,
  RequestForQuotation,
  RFQLineItem,
  VendorQuotation,
  QuotationLineItem
} from '@/types';
import { 
  projects as initialProjects,
  budgetItems as initialBudgetItems,
  purchaseRequests as initialPurchaseRequests,
  purchaseOrders as initialPurchaseOrders,
  vendors as initialVendors,
  requestForQuotations as initialRFQs,
  rfqLineItems as initialRFQLineItems,
  vendorQuotations as initialVendorQuotations,
  quotationLineItems as initialQuotationLineItems
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
  invoicePayments: InvoicePayment[];
  requestForQuotations: RequestForQuotation[];
  rfqLineItems: RFQLineItem[];
  vendorQuotations: VendorQuotation[];
  quotationLineItems: QuotationLineItem[];
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
  addInvoicePayment: (invoicePayment: InvoicePayment) => void;
  updateInvoicePayment: (updatedInvoicePayment: InvoicePayment) => void;
  addVendor: (vendor: Vendor) => void;
  updateVendor: (updatedVendor: Vendor) => void;
  addRequestForQuotation: (rfq: RequestForQuotation) => void;
  updateRequestForQuotation: (updatedRfq: RequestForQuotation) => void;
  addRFQLineItem: (lineItem: RFQLineItem) => void;
  addVendorQuotation: (quotation: VendorQuotation) => void;
  updateVendorQuotation: (updatedQuotation: VendorQuotation) => void;
  addQuotationLineItem: (lineItem: QuotationLineItem) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>(initialBudgetItems);
  const [purchaseRequests, setPurchaseRequests] = useState<PurchaseRequest[]>(initialPurchaseRequests);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(initialPurchaseOrders);
  const [vendors, setVendors] = useState<Vendor[]>(initialVendors);
  const [goodsReceipts, setGoodsReceipts] = useState<GoodsReceipt[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [advanceRequests, setAdvanceRequests] = useState<AdvanceRequest[]>([]);
  const [advancePayments, setAdvancePayments] = useState<AdvancePayment[]>([]);
  const [advanceAdjustments, setAdvanceAdjustments] = useState<AdvanceAdjustment[]>([]);
  const [invoicePayments, setInvoicePayments] = useState<InvoicePayment[]>([]);
  const [requestForQuotations, setRequestForQuotations] = useState<RequestForQuotation[]>(initialRFQs);
  const [rfqLineItems, setRFQLineItems] = useState<RFQLineItem[]>(initialRFQLineItems);
  const [vendorQuotations, setVendorQuotations] = useState<VendorQuotation[]>(initialVendorQuotations);
  const [quotationLineItems, setQuotationLineItems] = useState<QuotationLineItem[]>(initialQuotationLineItems);
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

  const addAdvancePayment = (advancePayment: AdvancePayment) => {
    setAdvancePayments([...advancePayments, advancePayment]);
    
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

  const addAdvanceAdjustment = (advanceAdjustment: AdvanceAdjustment) => {
    setAdvanceAdjustments([...advanceAdjustments, advanceAdjustment]);
    
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

  const addInvoicePayment = (invoicePayment: InvoicePayment) => {
    setInvoicePayments([...invoicePayments, invoicePayment]);
    
    const relatedInvoice = invoices.find(inv => inv.id === invoicePayment.invoiceId);
    if (relatedInvoice) {
      updateInvoice({
        ...relatedInvoice,
        status: 'Paid'
      });
    }
  };

  const updateInvoicePayment = (updatedInvoicePayment: InvoicePayment) => {
    setInvoicePayments(
      invoicePayments.map((ip) =>
        ip.id === updatedInvoicePayment.id ? updatedInvoicePayment : ip
      )
    );
  };

  const addVendor = (vendor: Vendor) => {
    setVendors([...vendors, vendor]);
  };

  const updateVendor = (updatedVendor: Vendor) => {
    setVendors(
      vendors.map((vendor) =>
        vendor.id === updatedVendor.id ? updatedVendor : vendor
      )
    );
  };

  const addRequestForQuotation = (rfq: RequestForQuotation) => {
    setRequestForQuotations([...requestForQuotations, rfq]);
  };

  const updateRequestForQuotation = (updatedRfq: RequestForQuotation) => {
    setRequestForQuotations(
      requestForQuotations.map((rfq) =>
        rfq.id === updatedRfq.id ? updatedRfq : rfq
      )
    );
  };

  const addRFQLineItem = (lineItem: RFQLineItem) => {
    setRFQLineItems([...rfqLineItems, lineItem]);
  };

  const addVendorQuotation = (quotation: VendorQuotation) => {
    setVendorQuotations([...vendorQuotations, quotation]);
  };

  const updateVendorQuotation = (updatedQuotation: VendorQuotation) => {
    setVendorQuotations(
      vendorQuotations.map((q) =>
        q.id === updatedQuotation.id ? updatedQuotation : q
      )
    );
  };

  const addQuotationLineItem = (lineItem: QuotationLineItem) => {
    setQuotationLineItems([...quotationLineItems, lineItem]);
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
      invoicePayments,
      requestForQuotations,
      rfqLineItems,
      vendorQuotations,
      quotationLineItems,
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
      addInvoicePayment,
      updateInvoicePayment,
      addVendor,
      updateVendor,
      addRequestForQuotation,
      updateRequestForQuotation,
      addRFQLineItem,
      addVendorQuotation,
      updateVendorQuotation,
      addQuotationLineItem,
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
      invoicePayments,
      requestForQuotations,
      rfqLineItems,
      vendorQuotations,
      quotationLineItems,
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
