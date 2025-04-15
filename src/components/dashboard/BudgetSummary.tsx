
import React from "react";
import { useAppContext } from "@/context/AppContext";
import BudgetProgressCard from "@/components/shared/BudgetProgressCard";
import { Building2, Briefcase, Building } from "lucide-react";

const BudgetSummary: React.FC = () => {
  const { projects } = useAppContext();
  
  // Calculate overall budget totals across all projects
  const overallTotalBudget = projects.reduce((sum, project) => sum + project.totalBudget, 0);
  const overallCommittedBudget = projects.reduce((sum, project) => sum + project.committedBudget, 0);
  const overallActualSpend = projects.reduce((sum, project) => sum + project.actualSpend, 0);
  
  // Get the active projects only
  const activeProjects = projects.filter(project => project.status === 'Active');
  
  // Calculate budget totals for active projects
  const activeTotalBudget = activeProjects.reduce((sum, project) => sum + project.totalBudget, 0);
  const activeCommittedBudget = activeProjects.reduce((sum, project) => sum + project.committedBudget, 0);
  const activeActualSpend = activeProjects.reduce((sum, project) => sum + project.actualSpend, 0);
  
  // Use the highest utilization project for the third card
  const highestUtilizationProject = [...projects].sort((a, b) => 
    (b.committedBudget / b.totalBudget) - (a.committedBudget / a.totalBudget)
  )[0];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <BudgetProgressCard
        title="Overall Budget"
        totalBudget={overallTotalBudget}
        committedBudget={overallCommittedBudget}
        actualSpend={overallActualSpend}
        icon={<Building2 />}
      />
      <BudgetProgressCard
        title="Active Projects"
        totalBudget={activeTotalBudget}
        committedBudget={activeCommittedBudget}
        actualSpend={activeActualSpend}
        icon={<Briefcase />}
      />
      {highestUtilizationProject && (
        <BudgetProgressCard
          title={`Highest Utilization: ${highestUtilizationProject.name}`}
          totalBudget={highestUtilizationProject.totalBudget}
          committedBudget={highestUtilizationProject.committedBudget}
          actualSpend={highestUtilizationProject.actualSpend}
          icon={<Building />}
        />
      )}
    </div>
  );
};

export default BudgetSummary;
