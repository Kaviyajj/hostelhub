import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Bell, Search, AlertCircle, LogOut } from 'lucide-react';
import api from '../services/api';

const Topbar = ({ pageTitle }) => {
  const { user, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    if (user && user.role === 'student') {
      try {
        const res = await api.getNotifications();
        if (res.success) {
          setNotifications(res.notifications);
          setUnreadCount(res.notifications.filter(n => !n.isRead).length);
        }
      } catch (err) {
        console.error('Error fetching notifications:', err);
      }
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Refresh notifications every 60 seconds
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [user]);

  const handleMarkAsRead = async (id) => {
    try {
      const res = await api.markNotificationRead(id);
      if (res.success) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header className="h-20 bg-white dark:bg-[#1E293B] border-b border-slate-100 dark:border-slate-800 px-8 flex items-center justify-between sticky top-0 z-30">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-white capitalize">{pageTitle}</h2>
      </div>

      {/* Toggles, Notifications, and Search */}
      <div className="flex items-center gap-6">
        {/* Search bar mockup */}
        <div className="relative w-64 hidden md:block">
          <input
            type="text"
            placeholder="Search details..."
            className="w-full pl-10 pr-4 py-2 border border-slate-100 bg-slate-50 dark:bg-slate-800 dark:border-slate-700/60 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-xs"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        {/* Light/Dark Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
          title="Toggle Theme"
        >
          {darkMode ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Notifications Dropdown (Active for students, general notifications for others) */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors relative"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-800 animate-ping"></span>
            )}
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 py-2 z-50">
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                <span className="font-semibold text-xs text-slate-700 dark:text-white">Notifications</span>
                <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">{unreadCount} New</span>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-6 text-center text-slate-400 dark:text-slate-500 text-xs">
                    No new notifications.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => !n.isRead && handleMarkAsRead(n.id)}
                      className={`px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors border-b border-slate-50 dark:border-slate-700/30 ${
                        !n.isRead ? 'bg-blue-50/20 dark:bg-blue-900/10' : ''
                      }`}
                    >
                      <h4 className="text-xs font-semibold text-slate-800 dark:text-white flex items-center gap-1.5">
                        {!n.isRead && <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>}
                        {n.title}
                      </h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{n.message}</p>
                      <span className="text-[8px] text-slate-400 block mt-1">{new Date(n.createdAt).toLocaleDateString()}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Info Short Info */}
        <div className="flex items-center gap-3 border-l border-slate-100 dark:border-slate-800 pl-6">
          <div className="text-right">
            <h4 className="text-xs font-semibold text-slate-800 dark:text-white leading-none">{user?.name}</h4>
            <span className="text-[9px] text-slate-400 dark:text-slate-400 font-semibold tracking-wide uppercase mt-1 inline-block">{user?.role}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-primary text-sm uppercase shadow-sm">
            {user?.name.charAt(0)}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
