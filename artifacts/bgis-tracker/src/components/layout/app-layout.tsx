import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, Settings, BookOpen, Clock, CheckSquare, PlusCircle } from "lucide-react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useProject } from "@/lib/project-context";
import { useListProjects } from "@workspace/api-client-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export function AppLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { currentProjectId, setCurrentProjectId } = useProject();
  const { data: projects, isLoading: isProjectsLoading } = useListProjects();

  const navItems = [
    { title: "Executive Dashboard", href: "/", icon: LayoutDashboard },
    { title: "Implementation Workbook", href: "/workbook", icon: BookOpen },
    { title: "Milestone Tracker", href: "/milestones", icon: Clock },
    { title: "UAT Sign-Off", href: "/uat", icon: CheckSquare },
    { title: "Project Setup", href: "/setup", icon: Settings },
  ];

  return (
    <SidebarProvider style={{ "--sidebar-width": "16rem", "--sidebar-width-icon": "4rem" } as React.CSSProperties}>
      <div className="flex h-screen w-full bg-background overflow-hidden">
        
        {/* Sidebar */}
        <aside className="w-64 flex-shrink-0 bg-sidebar flex flex-col shadow-xl z-20">
          <div className="h-16 flex items-center px-6 border-b border-sidebar-border bg-sidebar">
            <div className="flex items-center gap-3">
              <div className="font-bold text-2xl tracking-tight text-white">BGIS</div>
              <div className="h-6 w-px bg-white/20"></div>
              <div className="text-xs font-medium text-sidebar-primary leading-tight tracking-wider uppercase mt-1">
                Tracker
              </div>
            </div>
          </div>
          
          <nav className="flex-1 py-6 px-3 flex flex-col gap-1 overflow-y-auto custom-scrollbar">
            {navItems.map((item) => {
              const isActive = location === item.href;
              return (
                <Link key={item.href} href={item.href} className="block">
                  <div className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 cursor-pointer
                    ${isActive 
                      ? 'bg-sidebar-accent text-white border-l-4 border-sidebar-primary shadow-sm' 
                      : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-white border-l-4 border-transparent'}
                  `}>
                    <item.icon className={`w-5 h-5 ${isActive ? 'text-sidebar-primary' : ''}`} />
                    <span className="font-medium text-sm">{item.title}</span>
                  </div>
                </Link>
              );
            })}
          </nav>
          
          <div className="p-4 border-t border-sidebar-border text-center">
            <p className="text-[10px] text-sidebar-foreground/40 font-medium">
              © 2026 BGIS Canada.<br/>Internal Use Only.
            </p>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex flex-col flex-1 w-full min-w-0">
          {/* Header */}
          <header className="h-16 flex items-center justify-between px-8 bg-card border-b border-border shadow-sm z-10 flex-shrink-0">
            <h1 className="text-xl font-bold text-foreground tracking-tight">
              {navItems.find(item => item.href === location)?.title || "Dashboard"}
            </h1>
            
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-muted-foreground">Active Project:</span>
              {isProjectsLoading ? (
                <div className="h-9 w-[240px] bg-muted animate-pulse rounded-md" />
              ) : (
                <div className="flex items-center gap-2">
                  <Select 
                    value={currentProjectId?.toString() || ""} 
                    onValueChange={(val) => setCurrentProjectId(parseInt(val, 10))}
                  >
                    <SelectTrigger className="w-[240px] bg-background font-medium hover-elevate">
                      <SelectValue placeholder="Select a project..." />
                    </SelectTrigger>
                    <SelectContent>
                      {projects?.length === 0 ? (
                        <SelectItem value="none" disabled>No projects found</SelectItem>
                      ) : (
                        projects?.map(p => (
                          <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  
                  {location !== '/setup' && (
                    <Link href="/setup">
                      <Button variant="outline" size="icon" className="hover-elevate" title="Create New Project">
                        <PlusCircle className="h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </div>
          </header>
          
          {/* Page Content */}
          <main className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-background">
            <div className="max-w-7xl mx-auto h-full flex flex-col">
              {!currentProjectId && location !== '/setup' ? (
                <div className="flex flex-col items-center justify-center flex-1 text-center max-w-md mx-auto fade-in">
                  <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6 shadow-inner">
                    <Settings className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">No Active Project</h2>
                  <p className="text-muted-foreground mb-8">
                    Please select a project from the dropdown in the header, or create a new one to get started.
                  </p>
                  <Link href="/setup">
                    <Button className="hover-elevate shadow-md px-8 py-5 text-base">
                      <PlusCircle className="mr-2 h-5 w-5" />
                      Create New Project
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="fade-in animate-in slide-in-from-bottom-4 duration-500 ease-out h-full flex flex-col">
                  {children}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
