
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import ProjectCard from "@/components/shared/ProjectCard";

const ProjectsOverview: React.FC = () => {
  const { projects } = useAppContext();
  const navigate = useNavigate();
  
  // Show only active projects, limited to 3
  const activeProjects = projects
    .filter(project => project.status === 'Active')
    .slice(0, 3);

  return (
    <Card className="col-span-3">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-md font-medium">Active Projects</CardTitle>
        <Button 
          variant="outline" 
          size="sm"
          className="h-8"
          onClick={() => navigate('/projects')}
        >
          View All
        </Button>
      </CardHeader>
      <CardContent>
        {activeProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 space-y-3">
            <p className="text-muted-foreground">No active projects yet.</p>
            <Button onClick={() => navigate('/projects')}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Project
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {activeProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectsOverview;
