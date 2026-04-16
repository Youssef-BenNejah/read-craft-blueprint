import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useProjectStore } from '../../store/projectStore';

const AppLayout: React.FC = () => {
  const { sidebarCollapsed } = useProjectStore();

  return (
    <div className="min-h-screen bg-surface-primary">
      <Sidebar />
      <main className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-56'}`}>
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
