
import React from "react";
import PageHeader from "@/components/shared/PageHeader";
import BudgetSummary from "@/components/dashboard/BudgetSummary";
import ProjectsOverview from "@/components/dashboard/ProjectsOverview";
import RecentActivity from "@/components/dashboard/RecentActivity";
import ProcurementStatus from "@/components/dashboard/ProcurementStatus";

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="Overview of your construction projects and budget status."
      />

      <BudgetSummary />

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
        <ProjectsOverview />
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
        <RecentActivity />
        <ProcurementStatus />
      </div>
    </div>
  );
};

export default Dashboard;
