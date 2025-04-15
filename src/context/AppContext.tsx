
import React, { createContext, useContext, useState, useMemo } from 'react';
import { 
  Project, 
  BudgetItem, 
  PurchaseRequest, 
  PurchaseOrder,
  Vendor
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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>(initialBudgetItems);
  const [purchaseRequests, setPurchaseRequests] = useState<PurchaseRequest[]>(initialPurchaseRequests);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(initialPurchaseOrders);
  const [vendors] = useState<Vendor[]>(initialVendors);
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

  const value = useMemo(
    () => ({
      projects,
      budgetItems,
      purchaseRequests,
      purchaseOrders,
      vendors,
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
    }),
    [
      projects,
      budgetItems,
      purchaseRequests,
      purchaseOrders,
      vendors,
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
