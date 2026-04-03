import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface LayoutProps {
  children: React.ReactNode;
  currentView: string;
  setView: (view: any) => void;
  selectedVessel: any;
  onSelectVessel: (vessel: any) => void;
  vessels: any[];
  onAddVessel: () => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  currentView, 
  setView, 
  selectedVessel,
  onSelectVessel,
  vessels,
  onAddVessel
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const viewTitleMap: Record<string, string> = {
    dashboard: 'Fleet Overview',
    sms: 'SMS Master Admin',
    pms: 'Global PMS Master',
    sync: 'Data Sync Console'
  };

  return (
    <div className="app-shell">
      <Sidebar 
        currentView={currentView} 
        setView={setView} 
        selectedVessel={selectedVessel}
        onSelectVessel={onSelectVessel}
        vessels={vessels}
        isOpen={isSidebarOpen}
        onAddVessel={onAddVessel}
      />
      
      <main className="content-area">
        <Header 
          title={selectedVessel ? selectedVessel.vessel_name : (viewTitleMap[currentView] || currentView)} 
          vesselCount={vessels.length}
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
