import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface LayoutProps {
  children: React.ReactNode;
  currentView: string;
  setView: (view: any) => void;
  user: any;
  onLogout: () => void;
  vesselName?: string;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  currentView, 
  setView, 
  user, 
  onLogout,
  vesselName = "MV PACIFIC GLORY"
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="app-shell">
      <Sidebar 
        currentView={currentView} 
        setView={setView} 
        user={user} 
        onLogout={onLogout} 
        isOpen={isSidebarOpen}
      />
      
      <main className="content-area">
        <Header 
          title={currentView} 
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
