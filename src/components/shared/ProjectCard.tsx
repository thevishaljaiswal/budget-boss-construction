
import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Project } from "@/types";
import { formatCurrency, formatPercentage, getBudgetStatusColor, calculateBudgetUtilization } from "@/utils/formatters";
import { Calendar, MapPin, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const budgetUtilization = calculateBudgetUtilization(
    project.committedBudget,
    project.totalBudget
  );
  
  const statusColor = getBudgetStatusColor(
    project.committedBudget,
    project.totalBudget
  );

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-bold">
            <Link to={`/projects/${project.id}`} className="hover:text-primary">
              {project.name}
            </Link>
          </CardTitle>
          <Badge
            variant={
              project.status === "Active"
                ? "default"
                : project.status === "Planning"
                ? "outline"
                : project.status === "Completed"
                ? "success"
                : "secondary"
            }
          >
            {project.status}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{project.code}</p>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="flex flex-col gap-2 text-sm mb-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{project.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span>{project.projectManager}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{project.startDate} — {project.endDate}</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Budget Utilization</span>
            <span className="text-sm">{formatPercentage(budgetUtilization)}</span>
          </div>
          <div className="budget-progress">
            <div 
              className={`budget-progress-bar ${statusColor}`} 
              style={{ width: `${Math.min(budgetUtilization, 100)}%` }}
            ></div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4 flex justify-between">
        <div>
          <p className="text-xs text-muted-foreground">Total Budget</p>
          <p className="font-medium">{formatCurrency(project.totalBudget)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Committed</p>
          <p className="font-medium">{formatCurrency(project.committedBudget)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Actual</p>
          <p className="font-medium">{formatCurrency(project.actualSpend)}</p>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ProjectCard;
