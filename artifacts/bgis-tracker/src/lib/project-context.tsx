import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useListProjects } from "@workspace/api-client-react";

interface ProjectContextType {
  currentProjectId: number | null;
  setCurrentProjectId: (id: number | null) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
  // Initialize synchronously from localStorage to avoid flash of "No Active Project"
  const [currentProjectId, setCurrentProjectId] = useState<number | null>(() => {
    const saved = localStorage.getItem("bgis_current_project_id");
    return saved ? parseInt(saved, 10) : null;
  });

  // Sync to localStorage whenever selection changes
  useEffect(() => {
    if (currentProjectId) {
      localStorage.setItem("bgis_current_project_id", currentProjectId.toString());
    } else {
      localStorage.removeItem("bgis_current_project_id");
    }
  }, [currentProjectId]);

  // If no project is selected but we have projects, auto-select the first one
  const { data: projects } = useListProjects();

  useEffect(() => {
    if (!currentProjectId && projects && projects.length > 0) {
      setCurrentProjectId(projects[0].id);
    }
  }, [projects, currentProjectId]);

  return (
    <ProjectContext.Provider value={{ currentProjectId, setCurrentProjectId }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  return context;
}
