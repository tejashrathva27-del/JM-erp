/**
 * @license
 * Version 1.0.0
 * Jamavat Masala ERP - Topbar Component
 */

import React, { useState } from 'react';
import {
  Search,
  Bell,
  Sun,
  Moon,
  Settings,
  UserCheck,
  ChevronDown,
  Maximize,
  CheckCircle2,
  X,
  Menu
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/formatters';
import { JamavatLogo } from '../../utils/logo';

export const Topbar: React.FC = () => {
  const {
    activeModule,
    setActiveModule,
    isDarkMode,
    toggleDarkMode,
    globalSearch,
    setGlobalSearch,
    notifications,
    markNotificationRead,
    clearAllNotifications,
    toggleMobileMenu
  } = useApp();
  const { user } = useAuth();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const unreadNotifs = notifications.filter(n => !n.read);

  const getModuleTitle = () => {
    switch (activeModule) {
      case 'dashboard': return 'Dashboard';
      case 'employees': return 'Employee Management';
      case 'products': return 'Products & Catalog';
      case 'production': return 'Factory Production Batch';
      case 'inventory': return 'Inventory & Stock Balance';
      case 'orders': return 'Orders Management';
      case 'dispatch': return 'Delivery & Dispatch Pipeline';
      case 'shops': return 'Shops & Wholesale Dealers';
      case 'payments': return 'Payment Collections & Receipts';
      case 'expenses': return 'Factory & Operational Expenses';
      case 'attendance': return 'Daily Attendance & Payroll';
      case 'reports': return 'Business Analytics & Reports';
      case 'notifications': return 'System Alerts & Notifications';
      case 'settings': return 'ERP System Settings';
      default: return 'Dashboard';
    }
  };

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <header className="sticky top-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-3 sm:px-6 py-2.5 sm:py-3 transition-colors shadow-xs">
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Mobile Hamburger & Breadcrumbs with Logo */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={toggleMobileMenu}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 md:hidden hover:bg-slate-200 dark:hover:bg-slate-700 transition-all shrink-0 active:scale-95"
            title="Open Menu"
            aria-label="Toggle navigation menu"
          >
            <Menu size={20} />
          </button>
          
          <div className="flex items-center gap-2">
            <JamavatLogo height={36} className="h-8 sm:h-9 w-auto shrink-0 md:hidden" />
            <div>
              <h1 className="text-sm sm:text-lg md:text-xl font-bold text-slate-800 dark:text-white capitalize leading-tight truncate max-w-[130px] xs:max-w-[180px] sm:max-w-none">
                {getModuleTitle()}
              </h1>
              <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                <span>Home</span>
                <span>/</span>
                <span className="text-[#800000] dark:text-amber-400 font-semibold capitalize truncate max-w-[80px] sm:max-w-none">
                  {activeModule}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Desktop Global Search Input */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search products, orders, employees, shops..."
              value={globalSearch}
              onChange={e => setGlobalSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#800000]/30 transition-all"
            />
            {globalSearch && (
              <button
                onClick={() => setGlobalSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Mobile Search Toggle Button */}
          <button
            onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all md:hidden"
            title="Search"
          >
            <Search size={18} />
          </button>
          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              title="Notifications"
            >
              <Bell size={18} />
              {unreadNotifs.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#800000] text-white text-[10px] font-extrabold flex items-center justify-center animate-pulse border-2 border-white dark:border-slate-900">
                  {unreadNotifs.length}
                </span>
              )}
            </button>

            {/* Notification Popover Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-3 z-50">
                <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <Bell size={14} className="text-[#800000] dark:text-amber-400" />
                    System Notifications
                  </h3>
                  {unreadNotifs.length > 0 && (
                    <button
                      onClick={clearAllNotifications}
                      className="text-[10px] text-[#800000] dark:text-amber-400 hover:underline font-semibold"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">No notifications</div>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => {
                          markNotificationRead(n.id);
                          if (n.linkModule) setActiveModule(n.linkModule as any);
                          setShowNotifications(false);
                        }}
                        className={`p-3 text-xs hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors ${
                          !n.read ? 'bg-amber-50/50 dark:bg-amber-900/10' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-semibold text-slate-800 dark:text-slate-200">{n.title}</p>
                          <span className="text-[10px] text-slate-400 whitespace-nowrap">{n.timestamp}</span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5 line-clamp-2">
                          {n.message}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={handleFullscreen}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all hidden sm:block"
            title="Toggle Fullscreen Mode"
          >
            <Maximize size={18} />
          </button>

          {/* Settings Shortcut */}
          <button
            onClick={() => setActiveModule('settings')}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
            title="System Settings"
          >
            <Settings size={18} />
          </button>

          {/* User Profile Pill (Matching Screenshot) */}
          <div className="relative ml-1">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#800000] text-white hover:bg-[#660000] transition-all shadow-sm"
            >
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs text-amber-300 shrink-0">
                {user?.role === 'Owner' ? 'O' : (user?.role === 'MD' || user?.role === 'Managing Director') ? 'MD' : user?.role === 'HR' ? 'HR' : user?.displayName?.charAt(0) || 'M'}
              </div>
              <span className="text-xs font-bold capitalize hidden sm:inline">{user?.displayName || 'Admin'}</span>
              <ChevronDown size={14} className="text-amber-300 shrink-0" />
            </button>

            {/* Profile Menu */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-2 z-50">
                <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-bold text-slate-800 dark:text-white">{user?.displayName}</p>
                  <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 dark:bg-amber-900/30 text-[#800000] dark:text-amber-300">
                    Role: {user?.role}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setActiveModule('settings');
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                >
                  <Settings size={14} /> Profile & ERP Settings
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Expandable Search Bar */}
      {isMobileSearchOpen && (
        <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-800 md:hidden">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search products, orders, employees..."
              value={globalSearch}
              onChange={e => setGlobalSearch(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#800000]/30"
              autoFocus
            />
            <button
              onClick={() => {
                setGlobalSearch('');
                setIsMobileSearchOpen(false);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
