import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import AdminDashboard from './pages/AdminDashboard';
import WardenDashboard from './pages/WardenDashboard';
import StudentDashboard from './pages/StudentDashboard';

function App() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Reset active tab to 'dashboard' when user login state changes
  useEffect(() => {
    setActiveTab('dashboard');
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0F172A] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-semibold text-slate-400 dark:text-slate-500 animate-pulse">Loading HostelHub...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  // Render correct dashboard based on role
  const renderDashboardByRole = () => {
    switch (user.role) {
      case 'admin':
        return <AdminDashboard activeTab={activeTab} setActiveTab={setActiveTab} />;
      case 'warden':
        return <WardenDashboard activeTab={activeTab} setActiveTab={setActiveTab} />;
      case 'student':
        return <StudentDashboard activeTab={activeTab} setActiveTab={setActiveTab} />;
      default:
        return (
          <div className="p-8 text-center text-slate-500">
            Invalid role configuration. Please contact the administrator.
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-[#0F172A] text-slate-800 dark:text-slate-100 transition-colors duration-250">
      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <Topbar pageTitle={activeTab} />
        
        {/* Scrollable Subpages */}
        {renderDashboardByRole()}
      </div>
    </div>
  );
}

export default App;
