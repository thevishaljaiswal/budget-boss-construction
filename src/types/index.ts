// Project Types
export interface Project {
  id: string;
  name: string;
  code: string;
  location: string;
  clientName: string;
  startDate: string;
  endDate: string;
  projectManager: string;
  status: 'Planning' | 'Active' | 'Completed' | 'On Hold';
  budgetStatus: 'Draft' | 'Pending Approval' | 'Approved' | 'Locked';
  totalBudget: number;
  committedBudget: number;
  actualSpend: number;
}

// Budget Types
export interface BudgetCategory {
  id: string;
  name: string;
  type: 'Civil' | 'Electrical' | 'Mechanical' | 'Plumbing' | 'Finishing' | 'Other';
}

export interface BudgetSubCategory {
  id: string;
  categoryId: string;
  name: string;
}

export interface BudgetItem {
  id: string;
  projectId: string;
  categoryId: string;
  subCategoryId: string;
  description: string;
  uom: string; // Unit of Measure
  quantity: number;
  rate: number;
  totalAmount: number;
  contingencyPercentage: number;
  contingencyAmount: number;
  grandTotal: number;
  remarks?: string;
}

export interface BudgetVersion {
  id: string;
  projectId: string;
  versionNumber: number;
  lockedDate: string;
  approvedBy: string;
  revisionNotes?: string;
}

// Procurement Types
export interface PurchaseRequest {
  id: string;
  projectId: string;
  requestType: 'Material' | 'Service';
  requesterName: string;
  requestDate: string;
  requiredByDate: string;
  costCodeReference: string;
  budgetItemId: string;
  quantity: number;
  justification: string;
  attachments?: string[];
  status: 'Draft' | 'Pending Approval' | 'Approved' | 'Rejected' | 'Converted to PO';
}

export interface PurchaseOrder {
  id: string;
  projectId: string;
  vendorId: string;
  type: 'PO' | 'WO';
  prReference: string;
  issueDate: string;
  deliveryDate: string;
  paymentTerms: string;
  taxPercentage: number;
  siteLocation: string;
  specialTerms?: string;
  status: 'Draft' | 'Issued' | 'Partially Received' | 'Completed' | 'Cancelled';
  totalAmount: number;
}

export interface POLineItem {
  id: string;
  poId: string;
  description: string;
  quantity: number;
  rate: number;
  total: number;
}

export interface Vendor {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  taxId?: string;
}

export interface GoodsReceipt {
  id: string;
  poId: string;
  receiptDate: string;
  receivedBy: string;
  remarks?: string;
  attachments?: {
    photos: boolean;
    dsr: boolean;
  };
}

export interface GoodsReceiptLine {
  id: string;
  grnId: string;
  poLineItemId: string;
  quantityReceived: number;
}

export interface Invoice {
  id: string;
  poId: string;
  vendorId: string;
  invoiceNumber: string;
  invoiceDate: string;
  amountClaimed: number;
  amountApproved: number;
  retention: number;
  taxDeducted: number;
  paymentDueDate: string;
  status: 'Pending' | 'Approved' | 'Paid' | 'Disputed';
}
