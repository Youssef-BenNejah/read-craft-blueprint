import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useProjectStore } from '../../store/projectStore';
import { useIsMobile } from '../../hooks/use-mobile';

const AppLayout: React.FC = () => {
  const { sidebarCollapsed } = useProjectStore();
  const isMobile = useIsMobile();

  const marginClass = isMobile
    ? 'ml-0'
    : sidebarCollapsed ? 'md:ml-16' : 'md:ml-56';

  return (
    <div className="min-h-screen bg-surface-primary">
      <Sidebar />
      <main className={`transition-all duration-300 ${marginClass}`}>
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
