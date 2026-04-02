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
  user: any;
  onLogout: () => void;
  onAddVessel: () => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  currentView, 
  setView, 
  selectedVessel,
  onSelectVessel,
  vessels,
  user, 
  onLogout,
  onAddVessel
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="app-shell">
      <Sidebar 
        currentView={currentView} 
        setView={setView} 
        selectedVessel={selectedVessel}
        onSelectVessel={onSelectVessel}
        vessels={vessels}
        user={user} 
        onLogout={onLogout} 
        isOpen={isSidebarOpen}
        onAddVessel={onAddVessel}
      />
      
      <main className="content-area">
        <Header 
          title={selectedVessel ? selectedVessel.vessel_name : currentView} 
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
