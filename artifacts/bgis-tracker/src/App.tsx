import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ProjectProvider } from "@/lib/project-context";
import { AppLayout } from "@/components/layout/app-layout";
import NotFound from "@/pages/not-found";

// Pages
import Dashboard from "@/pages/dashboard";
import ProjectSetup from "@/pages/project-setup";
import Workbook from "@/pages/workbook";
import Milestones from "@/pages/milestones";
import UatBoard from "@/pages/uat-board";

function Router() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/setup" component={ProjectSetup} />
        <Route path="/workbook" component={Workbook} />
        <Route path="/milestones" component={Milestones} />
        <Route path="/uat" component={UatBoard} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ProjectProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </ProjectProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
