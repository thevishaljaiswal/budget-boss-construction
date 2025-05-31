
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Briefcase,
  ClipboardList,
  FileText,
  Home,
  LayoutDashboard,
  ShoppingCart,
  Users,
  Package,
  Receipt,
  CreditCard,
  ArrowUpDown,
  FileUp,
  Landmark,
  FileSearch
} from "lucide-react";

interface NavItemProps {
  href: string;
  icon: React.ElementType;
  label: string;
}

const NavItem: React.FC<NavItemProps> = ({ href, icon: Icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname === href;

  return (
    <Link
      to={href}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        isActive
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
      )}
    >
      <Icon className="h-5 w-5" />
      <span>{label}</span>
    </Link>
  );
};

const Sidebar = () => {
  return (
    <div className="hidden md:flex md:w-64 md:flex-col bg-sidebar">
      <div className="flex flex-col flex-1 overflow-y-auto">
        <div className="flex h-16 items-center justify-center bg-sidebar-primary">
          <h1 className="text-xl font-bold text-white">Budget Boss</h1>
        </div>
        <nav className="flex-1 space-y-1 px-2 py-4">
          <div className="mb-4">
            <h2 className="px-3 text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wider">
              Main
            </h2>
            <div className="mt-3 space-y-1">
              <NavItem href="/" icon={LayoutDashboard} label="Dashboard" />
              <NavItem href="/projects" icon={Briefcase} label="Projects" />
              <NavItem href="/budget" icon={BarChart3} label="Budget" />
            </div>
          </div>
          <div className="mb-4">
            <h2 className="px-3 text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wider">
              Procurement
            </h2>
            <div className="mt-3 space-y-1">
              <NavItem href="/purchase-requests" icon={ClipboardList} label="Purchase Requests" />
              <NavItem href="/rfq" icon={FileSearch} label="Request for Quotations" />
              <NavItem href="/purchase-orders" icon={ShoppingCart} label="Purchase Orders" />
              <NavItem href="/work-orders" icon={FileText} label="Work Orders" />
              <NavItem href="/goods-receipts" icon={Package} label="Goods Receipts" />
              <NavItem href="/invoices" icon={Receipt} label="Invoices" />
            </div>
          </div>
          <div className="mb-4">
            <h2 className="px-3 text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wider">
              Advances
            </h2>
            <div className="mt-3 space-y-1">
              <NavItem href="/advance-requests" icon={FileUp} label="Advance Requests" />
              <NavItem href="/advance-payments" icon={CreditCard} label="Advance Payments" />
              <NavItem href="/advance-adjustments" icon={ArrowUpDown} label="Adjustments" />
            </div>
          </div>
          <div className="mb-4">
            <h2 className="px-3 text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wider">
              Payments
            </h2>
            <div className="mt-3 space-y-1">
              <NavItem href="/invoice-payments" icon={Landmark} label="Invoice Payments" />
            </div>
          </div>
          <div className="mb-4">
            <h2 className="px-3 text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wider">
              Management
            </h2>
            <div className="mt-3 space-y-1">
              <NavItem href="/vendors" icon={Users} label="Vendors" />
              <NavItem href="/reports" icon={FileText} label="Reports" />
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
