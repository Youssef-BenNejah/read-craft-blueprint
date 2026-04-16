import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppLayout from "./components/layout/AppLayout";
import DashboardView from "./components/dashboard/DashboardView";
import AllProjectsView from "./components/pages/AllProjectsView";
import TeamOverviewView from "./components/pages/TeamOverviewView";
import ProjectView from "./components/project/ProjectView";
import NotFound from "./pages/NotFound";
import { useProjectStore } from "./store/projectStore";
import { useEffect } from "react";

const queryClient = new QueryClient();

const AppInitializer = ({ children }: { children: React.ReactNode }) => {
  const { loadProjects, initialized } = useProjectStore();

  useEffect(() => {
    if (!initialized) loadProjects();
  }, [initialized, loadProjects]);

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <BrowserRouter>
        <AppInitializer>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<DashboardView />} />
              <Route path="/projects" element={<AllProjectsView />} />
              <Route path="/team" element={<TeamOverviewView />} />
              <Route path="/project/:projectId" element={<ProjectView />} />
              <Route path="/project/:projectId/list" element={<ProjectView />} />
              <Route path="/project/:projectId/docs" element={<ProjectView />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </AppInitializer>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
