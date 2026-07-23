/**
 * @license
 * Version 1.0.0
 * Jamavat Masala ERP - Sidebar Navigation Component
 */

import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Package,
  Factory,
  Boxes,
  ShoppingCart,
  Truck,
  Store,
  Building2,
  FileBarChart,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Receipt,
  CreditCard,
  CalendarCheck,
  Bell,
  X,
  FileText
} from 'lucide-react';
import { useApp, NavModule } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types/erp';
import { JamavatLogo } from '../../utils/logo';

interface NavItem {
  id: NavModule;
  label: string;
  icon: React.ElementType;
  roles: UserRole[];
  badge?: number;
}

export const Sidebar: React.FC = () => {
  const { activeModule, setActiveModule, notifications, isMobileMenuOpen, setIsMobileMenuOpen } = useApp();
  const { user, logout, hasRole } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const unreadNotifCount = notifications.filter(n => !n.read).length;

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['Owner', 'Admin', 'MD', 'Managing Director', 'HR', 'Sales Manager', 'Production Manager', 'Marketing Head'] },
    { id: 'employees', label: 'Employees & HR', icon: Users, roles: ['Owner', 'Admin', 'MD', 'Managing Director', 'HR', 'Employee'] },
    { id: 'products', label: 'Products', icon: Package, roles: ['Owner', 'Admin', 'MD', 'Managing Director', 'Production Manager', 'Inventory Manager', 'Sales Manager'] },
    { id: 'production', label: 'Production', icon: Factory, roles: ['Owner', 'Admin', 'MD', 'Managing Director', 'Production Manager'] },
    { id: 'inventory', label: 'Inventory', icon: Boxes, roles: ['Owner', 'Admin', 'MD', 'Managing Director', 'Production Manager', 'Inventory Manager'] },
    { id: 'orders', label: 'Orders', icon: ShoppingCart, roles: ['Owner', 'Admin', 'MD', 'Managing Director', 'Sales Manager', 'Sales Executive', 'Delivery Staff', 'Marketing Head'] },
    { id: 'invoices', label: 'GST Invoices', icon: FileText, roles: ['Owner', 'Admin', 'MD', 'Managing Director', 'Sales Manager', 'Sales Executive', 'Accountant', 'Marketing Head'] },
    { id: 'delivery', label: 'Delivery', icon: Truck, roles: ['Owner', 'Admin', 'MD', 'Managing Director', 'Sales Manager', 'Delivery Staff', 'Dispatch Manager', 'Marketing Head'] },
    { id: 'shops', label: 'Shops & Dealers', icon: Store, roles: ['Owner', 'Admin', 'MD', 'Managing Director', 'Sales Manager', 'Sales Executive', 'Marketing Head'] },
    { id: 'payments', label: 'Payments', icon: Receipt, roles: ['Owner', 'Admin', 'MD', 'Managing Director', 'Sales Manager', 'Sales Executive', 'Accountant', 'Marketing Head'] },
    { id: 'expenses', label: 'Expenses', icon: CreditCard, roles: ['Owner', 'Admin', 'MD', 'Managing Director', 'Accountant'] },
    { id: 'attendance', label: 'Attendance', icon: CalendarCheck, roles: ['Owner', 'Admin', 'MD', 'Managing Director', 'HR', 'Employee'] },
    { id: 'reports', label: 'Reports', icon: FileBarChart, roles: ['Owner', 'Admin', 'MD', 'Managing Director', 'HR', 'Sales Manager', 'Accountant', 'Marketing Head'] },
    { id: 'notifications', label: 'Notifications', icon: Bell, roles: ['Owner', 'Admin', 'MD', 'Managing Director', 'HR', 'Sales Manager', 'Sales Executive', 'Production Manager', 'Inventory Manager', 'Accountant', 'Delivery Staff', 'Employee', 'Marketing Head'], badge: unreadNotifCount },
    { id: 'settings', label: 'Settings', icon: Settings, roles: ['Owner', 'Admin', 'MD', 'Managing Director'] },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-xs z-40 transition-opacity duration-300 md:hidden ${
          isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
        aria-hidden="true"
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[280px] h-full flex flex-col bg-[#800000] text-white transition-transform duration-300 ease-in-out shadow-2xl border-r border-[#660000] md:static md:translate-x-0 md:z-30 md:min-h-screen ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isCollapsed ? 'md:w-20' : 'md:w-64'}`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between p-3.5 border-b border-[#990000] bg-[#660000]/40">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="shrink-0 flex items-center justify-center p-0.5">
              <JamavatLogo height={44} className="h-11 w-auto drop-shadow-md" />
            </div>
            {(!isCollapsed || isMobileMenuOpen) && (
              <div className="leading-tight">
                <h1 className="font-extrabold text-base text-amber-300 tracking-wider">JM ERP</h1>
                <p className="text-[10px] text-amber-100/80 font-semibold">Jamavat Masala</p>
              </div>
            )}
          </div>

          {/* Close button for Mobile */}
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden p-1.5 rounded-lg bg-amber-400/20 text-amber-300 hover:bg-amber-400/30 transition-all"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>

          {/* Desktop/Tablet Collapse Toggle Button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex w-7 h-7 rounded-full bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 items-center justify-center transition-all absolute -right-3.5 top-5 shadow-md border border-amber-400/40 z-40"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Role Badge Indicator */}
        {(!isCollapsed || isMobileMenuOpen) && user && (
          <div className="mx-3 my-3 p-2.5 rounded-xl bg-black/20 border border-white/10 flex items-center gap-2.5">
            <img
              src={user.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
              alt={user.displayName}
              className="w-8 h-8 rounded-full object-cover border border-amber-400/50"
            />
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-white truncate">{user.displayName}</p>
              <span className="inline-block px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-400 text-[#660000]">
                {user.role}
              </span>
            </div>
          </div>
        )}

        {/* Navigation List */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            // Check role permissions
            if (!hasRole(item.roles)) return null;

            const isActive = activeModule === item.id || (item.id === 'delivery' && activeModule === 'dispatch');
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveModule(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-amber-400 text-[#660000] font-bold shadow-lg shadow-amber-900/30'
                    : 'text-amber-100/80 hover:bg-white/10 hover:text-white'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon
                  size={18}
                  className={`shrink-0 ${
                    isActive ? 'text-[#660000]' : 'text-amber-200/80 group-hover:text-amber-300'
                  }`}
                />

                {(!isCollapsed || isMobileMenuOpen) && (
                  <span className="truncate flex-1 text-left">{item.label}</span>
                )}

                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`px-1.5 py-0.5 text-[10px] font-extrabold rounded-full ${
                      isActive ? 'bg-[#660000] text-amber-300' : 'bg-amber-400 text-[#660000]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-3 border-t border-[#990000] bg-[#660000]/20">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-amber-400/90 hover:bg-amber-400 text-[#660000] font-bold text-xs transition-all shadow-md"
          >
            <LogOut size={16} />
            {(!isCollapsed || isMobileMenuOpen) && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
};
