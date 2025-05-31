import { 
  Project, 
  BudgetCategory, 
  BudgetSubCategory, 
  BudgetItem, 
  PurchaseRequest, 
  PurchaseOrder,
  Vendor,
  RequestForQuotation,
  RFQLineItem,
  VendorQuotation,
  QuotationLineItem
} from '@/types';

// Mock Projects
export const projects: Project[] = [
  {
    id: '1',
    name: 'Harbor View Residences',
    code: 'HVR-2023',
    location: 'San Francisco, CA',
    clientName: 'Coastal Properties LLC',
    startDate: '2023-06-01',
    endDate: '2024-12-31',
    projectManager: 'Sarah Johnson',
    status: 'Active',
    budgetStatus: 'Approved',
    totalBudget: 2850000,
    committedBudget: 1456000,
    actualSpend: 876000,
  },
  {
    id: '2',
    name: 'Metro Commercial Tower',
    code: 'MCT-2023',
    location: 'Chicago, IL',
    clientName: 'Urban Development Corp',
    startDate: '2023-04-15',
    endDate: '2025-03-20',
    projectManager: 'Michael Chen',
    status: 'Active',
    budgetStatus: 'Approved',
    totalBudget: 5200000,
    committedBudget: 2100000,
    actualSpend: 1300000,
  },
  {
    id: '3',
    name: 'Riverside Community Hospital',
    code: 'RCH-2023',
    location: 'Austin, TX',
    clientName: 'HealthCare Partners',
    startDate: '2023-09-01',
    endDate: '2025-08-31',
    projectManager: 'Robert Martinez',
    status: 'Planning',
    budgetStatus: 'Pending Approval',
    totalBudget: 7500000,
    committedBudget: 0,
    actualSpend: 0,
  },
  {
    id: '4',
    name: 'Greenfield Industrial Park',
    code: 'GIP-2023',
    location: 'Seattle, WA',
    clientName: 'Northwest Industrial Inc',
    startDate: '2023-07-15',
    endDate: '2024-10-30',
    projectManager: 'Daniel Wilson',
    status: 'Active',
    budgetStatus: 'Locked',
    totalBudget: 3400000,
    committedBudget: 2800000,
    actualSpend: 1950000,
  },
];

// Budget Categories
export const budgetCategories: BudgetCategory[] = [
  { id: '1', name: 'Foundation', type: 'Civil' },
  { id: '2', name: 'Structural', type: 'Civil' },
  { id: '3', name: 'Electrical Systems', type: 'Electrical' },
  { id: '4', name: 'HVAC', type: 'Mechanical' },
  { id: '5', name: 'Plumbing Systems', type: 'Plumbing' },
  { id: '6', name: 'Interior Finishing', type: 'Finishing' },
  { id: '7', name: 'External Works', type: 'Civil' },
  { id: '8', name: 'Site Preparation', type: 'Civil' },
];

// Budget Sub-Categories
export const budgetSubCategories: BudgetSubCategory[] = [
  { id: '1', categoryId: '1', name: 'Excavation' },
  { id: '2', categoryId: '1', name: 'Concrete Work' },
  { id: '3', categoryId: '2', name: 'Rebar Installation' },
  { id: '4', categoryId: '2', name: 'Concrete Columns' },
  { id: '5', categoryId: '3', name: 'Main Distribution' },
  { id: '6', categoryId: '3', name: 'Lighting Systems' },
  { id: '7', categoryId: '4', name: 'Ductwork' },
  { id: '8', categoryId: '4', name: 'Equipment Installation' },
  { id: '9', categoryId: '5', name: 'Piping' },
  { id: '10', categoryId: '5', name: 'Fixtures' },
  { id: '11', categoryId: '6', name: 'Drywall' },
  { id: '12', categoryId: '6', name: 'Painting' },
  { id: '13', categoryId: '7', name: 'Landscaping' },
  { id: '14', categoryId: '8', name: 'Site Clearing' },
];

// Budget Items for Harbor View Residences (Project ID 1)
export const budgetItems: BudgetItem[] = [
  {
    id: '1',
    projectId: '1',
    categoryId: '1',
    subCategoryId: '1',
    description: 'Excavation for foundation',
    uom: 'cubic meter',
    quantity: 250,
    rate: 125,
    totalAmount: 31250,
    contingencyPercentage: 10,
    contingencyAmount: 3125,
    grandTotal: 34375,
    remarks: 'Includes debris removal'
  },
  {
    id: '2',
    projectId: '1',
    categoryId: '1',
    subCategoryId: '2',
    description: 'Foundation concrete work',
    uom: 'cubic meter',
    quantity: 180,
    rate: 310,
    totalAmount: 55800,
    contingencyPercentage: 10,
    contingencyAmount: 5580,
    grandTotal: 61380,
    remarks: 'C30 concrete specification'
  },
  {
    id: '3',
    projectId: '1',
    categoryId: '2',
    subCategoryId: '3',
    description: 'Rebar installation for columns',
    uom: 'ton',
    quantity: 45,
    rate: 1200,
    totalAmount: 54000,
    contingencyPercentage: 5,
    contingencyAmount: 2700,
    grandTotal: 56700,
    remarks: 'Grade 60 rebar'
  },
  {
    id: '4',
    projectId: '1',
    categoryId: '3',
    subCategoryId: '5',
    description: 'Main electrical distribution system',
    uom: 'lump sum',
    quantity: 1,
    rate: 95000,
    totalAmount: 95000,
    contingencyPercentage: 15,
    contingencyAmount: 14250,
    grandTotal: 109250,
    remarks: 'Includes panels and transformers'
  },
  {
    id: '5',
    projectId: '1',
    categoryId: '6',
    subCategoryId: '11',
    description: 'Drywall installation',
    uom: 'square meter',
    quantity: 3200,
    rate: 45,
    totalAmount: 144000,
    contingencyPercentage: 8,
    contingencyAmount: 11520,
    grandTotal: 155520,
    remarks: 'Fire-rated where required'
  },
];

// Vendors
export const vendors: Vendor[] = [
  {
    id: '1',
    firstName: 'James',
    lastName: 'Brown',
    name: 'BuildRight Materials Inc.',
    contactPerson: 'James Brown',
    email: 'james@buildright.com',
    phone: '555-123-4567',
    address: '123 Commerce Blvd, Seattle, WA 98101',
    taxId: '12-3456789'
  },
  {
    id: '2',
    firstName: 'Susan',
    lastName: 'Parker',
    name: 'Premium Electric Supplies',
    contactPerson: 'Susan Parker',
    email: 'susan@premiumelectric.com',
    phone: '555-234-5678',
    address: '456 Industrial Way, Portland, OR 97201',
    taxId: '23-4567890'
  },
  {
    id: '3',
    firstName: 'Miguel',
    lastName: 'Rodriguez',
    name: 'Pacific Concrete Solutions',
    contactPerson: 'Miguel Rodriguez',
    email: 'miguel@pacificconcrete.com',
    phone: '555-345-6789',
    address: '789 Mixer Lane, San Francisco, CA 94107',
    taxId: '34-5678901'
  },
  {
    id: '4',
    firstName: 'Thomas',
    lastName: 'Smith',
    name: 'Smith & Sons Plumbing',
    contactPerson: 'Thomas Smith',
    email: 'thomas@smithplumbing.com',
    phone: '555-456-7890',
    address: '234 Water Works Ave, Chicago, IL 60607',
    taxId: '45-6789012'
  },
];

// Purchase Requests
export const purchaseRequests: PurchaseRequest[] = [
  {
    id: '1',
    projectId: '1',
    requestType: 'Material',
    requesterName: 'David Wilson',
    requestDate: '2023-07-15',
    requiredByDate: '2023-07-30',
    costCodeReference: 'HVR-2023-CIVIL-001',
    budgetItemId: '2',
    quantity: 50,
    justification: 'Required for foundation pouring scheduled on Aug 5',
    attachments: ['foundation_specs.pdf'],
    status: 'Approved'
  },
  {
    id: '2',
    projectId: '1',
    requestType: 'Service',
    requesterName: 'Maria Garcia',
    requestDate: '2023-07-18',
    requiredByDate: '2023-08-10',
    costCodeReference: 'HVR-2023-ELEC-001',
    budgetItemId: '4',
    quantity: 1,
    justification: 'Electrical installation services for main distribution',
    attachments: ['electrical_drawings.pdf'],
    status: 'Pending Approval'
  },
  {
    id: '3',
    projectId: '1',
    requestType: 'Material',
    requesterName: 'Jason Lee',
    requestDate: '2023-07-20',
    requiredByDate: '2023-08-15',
    costCodeReference: 'HVR-2023-STRUCT-001',
    budgetItemId: '3',
    quantity: 15,
    justification: 'Rebar needed for structural columns',
    attachments: ['structural_specs.pdf'],
    status: 'Converted to PO'
  }
];

// Purchase Orders
export const purchaseOrders: PurchaseOrder[] = [
  {
    id: '1',
    projectId: '1',
    vendorId: '3',
    type: 'PO',
    prReference: '3',
    issueDate: '2023-07-25',
    deliveryDate: '2023-08-10',
    paymentTerms: 'Net 30',
    taxPercentage: 8.5,
    siteLocation: 'Harbor View Site, San Francisco',
    specialTerms: 'Delivery only during weekday mornings',
    status: 'Issued',
    totalAmount: 19500
  },
  {
    id: '2',
    projectId: '1',
    vendorId: '2',
    type: 'WO',
    prReference: '2',
    issueDate: '2023-07-30',
    deliveryDate: '2023-08-20',
    paymentTerms: 'Net 45',
    taxPercentage: 8.5,
    siteLocation: 'Harbor View Site, San Francisco',
    specialTerms: 'Must follow site safety protocols',
    status: 'Draft',
    totalAmount: 48000
  }
];

// Request for Quotations
export const requestForQuotations: RequestForQuotation[] = [
  {
    id: '1',
    projectId: '1',
    rfqNumber: 'RFQ-HVR-2023-001',
    purchaseRequestIds: ['1', '3'],
    title: 'Foundation Materials and Structural Steel',
    description: 'Request for quotation for concrete materials and rebar installation for Harbor View Residences foundation work',
    issueDate: '2023-07-26',
    responseDeadline: '2023-08-05',
    deliveryLocation: 'Harbor View Site, San Francisco, CA',
    paymentTerms: 'Net 30 days',
    validityPeriod: 30,
    technicalSpecifications: 'C30 concrete specification, Grade 60 rebar as per structural drawings',
    specialTerms: 'Delivery only during weekday mornings (7 AM - 11 AM)',
    status: 'Responses Received',
    createdBy: 'Sarah Johnson',
    vendorIds: ['1', '3']
  },
  {
    id: '2',
    projectId: '1',
    rfqNumber: 'RFQ-HVR-2023-002',
    purchaseRequestIds: ['2'],
    title: 'Electrical Installation Services',
    description: 'Request for quotation for main electrical distribution system installation',
    issueDate: '2023-07-28',
    responseDeadline: '2023-08-10',
    deliveryLocation: 'Harbor View Site, San Francisco, CA',
    paymentTerms: 'Net 45 days',
    validityPeriod: 45,
    technicalSpecifications: 'Installation of main distribution panels and transformers as per electrical drawings',
    specialTerms: 'Must follow site safety protocols and provide certified electricians',
    status: 'Sent',
    createdBy: 'Maria Garcia',
    vendorIds: ['2']
  }
];

// RFQ Line Items
export const rfqLineItems: RFQLineItem[] = [
  {
    id: '1',
    rfqId: '1',
    purchaseRequestId: '1',
    itemDescription: 'Foundation concrete work - C30 specification',
    quantity: 50,
    uom: 'cubic meter',
    technicalSpecs: 'C30 concrete with specified aggregate mix',
    deliveryDate: '2023-08-15'
  },
  {
    id: '2',
    rfqId: '1',
    purchaseRequestId: '3',
    itemDescription: 'Rebar installation for structural columns',
    quantity: 15,
    uom: 'ton',
    technicalSpecs: 'Grade 60 rebar, various sizes as per structural drawings',
    deliveryDate: '2023-08-20'
  },
  {
    id: '3',
    rfqId: '2',
    purchaseRequestId: '2',
    itemDescription: 'Main electrical distribution system installation',
    quantity: 1,
    uom: 'lump sum',
    technicalSpecs: 'Complete installation including panels, transformers, and connections',
    deliveryDate: '2023-08-25'
  }
];

// Vendor Quotations
export const vendorQuotations: VendorQuotation[] = [
  {
    id: '1',
    rfqId: '1',
    vendorId: '3',
    quotationNumber: 'QT-PCS-2023-001',
    submissionDate: '2023-08-02',
    validUntil: '2023-08-31',
    totalAmount: 68500,
    currency: 'USD',
    deliveryPeriod: '10 working days',
    paymentTerms: 'Net 30 days',
    warranty: '1 year structural warranty',
    notes: 'All materials meet specified standards. Free delivery included.',
    status: 'Submitted'
  },
  {
    id: '2',
    rfqId: '1',
    vendorId: '1',
    quotationNumber: 'QT-BR-2023-001',
    submissionDate: '2023-08-01',
    validUntil: '2023-08-30',
    totalAmount: 72000,
    currency: 'USD',
    deliveryPeriod: '12 working days',
    paymentTerms: 'Net 30 days',
    warranty: '2 year material warranty',
    notes: 'Premium quality materials with extended warranty coverage.',
    status: 'Under Review'
  }
];

// Quotation Line Items
export const quotationLineItems: QuotationLineItem[] = [
  {
    id: '1',
    quotationId: '1',
    rfqLineItemId: '1',
    description: 'C30 Concrete Supply and Pouring',
    quantity: 50,
    unitPrice: 315,
    totalPrice: 15750,
    deliveryDate: '2023-08-15',
    brand: 'Pacific Concrete',
    specifications: 'High-grade C30 mix with specified additives'
  },
  {
    id: '2',
    quotationId: '1',
    rfqLineItemId: '2',
    description: 'Grade 60 Rebar Supply and Installation',
    quantity: 15,
    unitPrice: 1250,
    totalPrice: 18750,
    deliveryDate: '2023-08-20',
    brand: 'SteelMax',
    specifications: 'Certified Grade 60 rebar with installation service'
  },
  {
    id: '3',
    quotationId: '2',
    rfqLineItemId: '1',
    description: 'Premium C30 Concrete with Fast Set',
    quantity: 50,
    unitPrice: 340,
    totalPrice: 17000,
    deliveryDate: '2023-08-14',
    brand: 'BuildRight Premium',
    specifications: 'Premium C30 mix with fast-setting additives'
  },
  {
    id: '4',
    quotationId: '2',
    rfqLineItemId: '2',
    description: 'Premium Grade 60 Rebar with Extended Warranty',
    quantity: 15,
    unitPrice: 1300,
    totalPrice: 19500,
    deliveryDate: '2023-08-18',
    brand: 'BuildRight Steel',
    specifications: 'Premium Grade 60 rebar with 2-year warranty'
  }
];
