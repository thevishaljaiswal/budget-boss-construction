
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";
import PageHeader from "@/components/shared/PageHeader";
import ProjectCard from "@/components/shared/ProjectCard";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { generateUniqueId } from "@/utils/formatters";

type ProjectStatus = 'All' | 'Active' | 'Planning' | 'Completed' | 'On Hold';

const ProjectsPage: React.FC = () => {
  const { projects, addProject } = useAppContext();
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<ProjectStatus>('All');
  const [openDialog, setOpenDialog] = useState(false);
  
  // Form state for new project
  const [newProject, setNewProject] = useState({
    name: '',
    code: '',
    location: '',
    clientName: '',
    startDate: '',
    endDate: '',
    projectManager: '',
  });
  
  const filteredProjects = statusFilter === 'All' 
    ? projects 
    : projects.filter(project => project.status === statusFilter);
    
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewProject(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCreateProject = () => {
    // Create a new project with defaults
    const project = {
      id: generateUniqueId(),
      ...newProject,
      status: 'Planning' as const,
      budgetStatus: 'Draft' as const,
      totalBudget: 0,
      committedBudget: 0,
      actualSpend: 0,
    };
    
    addProject(project);
    setOpenDialog(false);
    
    // Reset the form
    setNewProject({
      name: '',
      code: '',
      location: '',
      clientName: '',
      startDate: '',
      endDate: '',
      projectManager: '',
    });
    
    // Navigate to the new project page
    navigate(`/projects/${project.id}`);
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Projects"
        description="Manage your construction projects."
        action={
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
                <DialogDescription>
                  Enter the details for your new construction project.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Project Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={newProject.name}
                    onChange={handleInputChange}
                    className="col-span-3"
                    placeholder="Harbor View Residences"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="code" className="text-right">
                    Project Code
                  </Label>
                  <Input
                    id="code"
                    name="code"
                    value={newProject.code}
                    onChange={handleInputChange}
                    className="col-span-3"
                    placeholder="HVR-2023"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="location" className="text-right">
                    Location
                  </Label>
                  <Input
                    id="location"
                    name="location"
                    value={newProject.location}
                    onChange={handleInputChange}
                    className="col-span-3"
                    placeholder="San Francisco, CA"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="clientName" className="text-right">
                    Client Name
                  </Label>
                  <Input
                    id="clientName"
                    name="clientName"
                    value={newProject.clientName}
                    onChange={handleInputChange}
                    className="col-span-3"
                    placeholder="Coastal Properties LLC"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="projectManager" className="text-right">
                    Project Manager
                  </Label>
                  <Input
                    id="projectManager"
                    name="projectManager"
                    value={newProject.projectManager}
                    onChange={handleInputChange}
                    className="col-span-3"
                    placeholder="Sarah Johnson"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="startDate" className="text-right">
                    Start Date
                  </Label>
                  <Input
                    id="startDate"
                    name="startDate"
                    type="date"
                    value={newProject.startDate}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="endDate" className="text-right">
                    End Date
                  </Label>
                  <Input
                    id="endDate"
                    name="endDate"
                    type="date"
                    value={newProject.endDate}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setOpenDialog(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateProject} 
                  disabled={!newProject.name || !newProject.code}
                >
                  Create Project
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="flex justify-end mb-4">
        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value as ProjectStatus)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Projects</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Planning">Planning</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
            <SelectItem value="On Hold">On Hold</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-60 bg-secondary/30 rounded-lg">
          <p className="text-muted-foreground mb-4">No projects found.</p>
          <Button onClick={() => setOpenDialog(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Project
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;
