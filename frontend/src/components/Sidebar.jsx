import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Users, UserCog, Hotel, ShieldAlert,
  CalendarCheck, ClipboardList, BookOpen, AlertCircle, FileText,
  Database, LogOut, FileSpreadsheet, BellRing
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();

  if (!user) return null;

  // Navigation Items Config based on Roles
  const adminNavItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'students', name: 'Students', icon: Users },
    { id: 'wardens', name: 'Wardens', icon: UserCog },
    { id: 'rooms', name: 'Rooms & Blocks', icon: Hotel },
    { id: 'complaints', name: 'Complaints', icon: ShieldAlert },
    { id: 'leaves', name: 'Leave Requests', icon: CalendarCheck },
    { id: 'fees', name: 'Fee & Payments', icon: ClipboardList },
    { id: 'visitors', name: 'Visitors', icon: BookOpen },
    { id: 'notices', name: 'Notice Board', icon: BellRing },
    { id: 'reports', name: 'Reports', icon: FileSpreadsheet },
    { id: 'backup', name: 'System Utilities', icon: Database }
  ];

  const wardenNavItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'my-block', name: 'Block Management', icon: Hotel },
    { id: 'attendance', name: 'Mark Attendance', icon: CalendarCheck },
    { id: 'complaints', name: 'Complaints', icon: ShieldAlert },
    { id: 'leaves', name: 'Leave Requests', icon: CalendarCheck },
    { id: 'visitors', name: 'Visitor Log', icon: BookOpen },
    { id: 'notices', name: 'Notices', icon: BellRing }
  ];

  const studentNavItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'my-room', name: 'My Room Details', icon: Hotel },
    { id: 'leaves', name: 'Leave Requests', icon: CalendarCheck },
    { id: 'complaints', name: 'My Complaints', icon: ShieldAlert },
    { id: 'fees', name: 'Fees & Invoices', icon: ClipboardList },
    { id: 'notices', name: 'Notice Board', icon: BellRing }
  ];

  const getNavItems = () => {
    switch (user.role) {
      case 'admin': return adminNavItems;
      case 'warden': return wardenNavItems;
      case 'student': return studentNavItems;
      default: return [];
    }
  };

  const navItems = getNavItems();

  return (
    <aside className="w-64 bg-white dark:bg-[#1E293B] border-r border-slate-100 dark:border-slate-800 flex flex-col h-screen sticky top-0">
      {/* Brand Logo */}
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-bold text-lg shadow-sm shadow-primary/20">
          HH
        </div>
        <div>
          <h1 className="font-bold text-base leading-none text-slate-800 dark:text-white">HostelHub</h1>
          <span className="text-[10px] text-slate-400 dark:text-slate-400 font-semibold tracking-wider uppercase">Management System</span>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-primary text-white shadow-sm shadow-primary/20'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-400'}`} />
              {item.name}
            </button>
          );
        })}
      </nav>

      {/* Footer Info / Logout */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-700 dark:text-slate-300 uppercase">
            {user.name.charAt(0)}
          </div>
          <div className="overflow-hidden">
            <h4 className="text-xs font-semibold text-slate-700 dark:text-white truncate">{user.name}</h4>
            <p className="text-[10px] text-slate-400 dark:text-slate-400 uppercase font-semibold">{user.role}</p>
          </div>
        </div>
        
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all duration-200 active:scale-95"
        >
          <LogOut className="w-5 h-5 text-rose-500" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
