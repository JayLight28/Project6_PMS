import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { LucideIcon } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentView: string;
  setView: (view: any) => void;
  mode: 'mother' | 'child';
  
  // Header / Sidebar Props
  title?: string;
  vesselName?: string;
  vessels?: any[];
  selectedVessel?: any;
  onSelectVessel?: (vessel: any) => void;
  onAddVessel?: () => void;
  user?: any;
  onLogout?: () => void;
  
  // Navigation Items
  mainModules?: { id: string; label: string; icon: LucideIcon }[];
  menuItems?: { id: string; label: string; icon: LucideIcon }[];
  viewTitleMap?: Record<string, string>;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  currentView, 
  setView, 
  mode,
  title,
  vesselName,
  vessels = [],
  selectedVessel,
  onSelectVessel,
  onAddVessel,
  user,
  onLogout,
  mainModules = [],
  menuItems = [],
  viewTitleMap = {}
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // Determine Title logic
  const displayTitle = selectedVessel 
    ? selectedVessel.vessel_name 
    : (title || viewTitleMap[currentView] || currentView);

  return (
    <div className="app-shell">
      <Sidebar 
        mode={mode}
        currentView={currentView} 
        setView={setView} 
        isOpen={isSidebarOpen}
        vessels={vessels}
        selectedVessel={selectedVessel}
        onSelectVessel={onSelectVessel}
        onAddVessel={onAddVessel}
        mainModules={mainModules}
        user={user}
        onLogout={onLogout}
        menuItems={menuItems}
      />
      
      <main className="content-area">
        <Header 
          mode={mode}
          title={displayTitle} 
          vesselCount={vessels.length}
          vesselName={vesselName}
          onToggleSidebar={toggleSidebar}
        />
        
        <section className="main-scroll fade-in">
          {children}
        </section>
      </main>
    </div>
  );
};

export default Layout;
