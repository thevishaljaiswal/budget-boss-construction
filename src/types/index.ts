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
  salutation?: string;
  firstName: string;
  lastName: string;
  name: string; // Full name (firstName + lastName)
  contactPerson: string;
  email: string;
  phone: string;
  mobile?: string;
  address: string;
  addressLine1?: string;
  addressLine2?: string;
  addressLine3?: string;
  city?: string;
  postalCode?: string;
  state?: string;
  country?: string;
  location?: string;
  taxId?: string;
  gstin?: string;
  pan?: string;
  bankName?: string;
  accountHolderName?: string;
  bankAccountNo?: string;
  bankBranch?: string;
  ifsc?: string;
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

// Advance Request Types
export interface AdvanceRequest {
  id: string;
  projectId: string;
  requestedBy: string;
  requestDate: string;
  advanceType: 'Vendor' | 'Employee' | 'Subcontractor' | 'Petty Cash';
  partyId: string; // Reference to vendor or employee ID
  partyName: string; // Name of vendor or employee
  purpose: string;
  costCodeReference: string;
  amountRequested: number;
  expectedSettlementDate: string;
  supportingDocs?: string[];
  approvers: {
    name: string;
    status: 'Pending' | 'Approved' | 'Rejected';
  }[];
  status: 'Draft' | 'Submitted' | 'Approved' | 'Rejected' | 'Paid';
}

// Advance Payment Types
export interface AdvancePayment {
  id: string;
  advanceRequestId: string;
  partyId: string;
  partyName: string;
  paymentMode: 'NEFT' | 'RTGS' | 'Cheque' | 'UPI';
  bankAccountDetails: string;
  paymentDate: string;
  amountPaid: number;
  referenceNo: string;
  tdsAmount?: number;
  otherDeductions?: number;
  paymentRemarks?: string;
  remainingAmount: number; // To track unused advance amount
}

// Advance Adjustment Types
export interface AdvanceAdjustment {
  id: string;
  invoiceId: string;
  advancePaymentId: string;
  adjustedAmount: number;
  adjustmentDate: string;
  remainingAdvance: number;
  remarks?: string;
}

// Invoice Payment Types
export interface InvoicePayment {
  id: string;
  invoiceId: string;
  vendorId: string;
  paymentDate: string;
  paymentMode: 'NEFT' | 'RTGS' | 'Cheque' | 'UPI';
  bankAccountDetails: string;
  amountPaid: number;
  referenceNo: string;
  tdsAmount?: number;
  otherDeductions?: number;
  adjustmentAmount: number; // Amount adjusted from advances
  netPaymentAmount: number; // Net amount paid after adjustments
  paymentRemarks?: string;
  status: 'Completed' | 'Pending' | 'Failed';
}

// Request for Quotation Types
export interface RequestForQuotation {
  id: string;
  projectId: string;
  rfqNumber: string;
  purchaseRequestIds: string[]; // Multiple PRs can be combined into one RFQ
  title: string;
  description?: string;
  issueDate: string;
  responseDeadline: string;
  deliveryLocation: string;
  paymentTerms: string;
  validityPeriod: number; // in days
  technicalSpecifications?: string;
  specialTerms?: string;
  status: 'Draft' | 'Sent' | 'Responses Received' | 'Evaluated' | 'Awarded' | 'Cancelled';
  createdBy: string;
  vendorIds: string[]; // Vendors invited to quote
}

export interface RFQLineItem {
  id: string;
  rfqId: string;
  purchaseRequestId: string;
  itemDescription: string;
  quantity: number;
  uom: string; // Unit of Measure
  technicalSpecs?: string;
  deliveryDate: string;
}

export interface VendorQuotation {
  id: string;
  rfqId: string;
  vendorId: string;
  quotationNumber: string;
  submissionDate: string;
  validUntil: string;
  totalAmount: number;
  currency: string;
  deliveryPeriod: string;
  paymentTerms: string;
  warranty?: string;
  notes?: string;
  status: 'Submitted' | 'Under Review' | 'Accepted' | 'Rejected';
}

export interface QuotationLineItem {
  id: string;
  quotationId: string;
  rfqLineItemId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  deliveryDate: string;
  brand?: string;
  model?: string;
  specifications?: string;
}
