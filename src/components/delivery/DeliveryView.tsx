/**
 * @license
 * Version 1.0.0
 * Jamavat Masala ERP - Comprehensive Delivery Module View
 */

import React, { useState } from 'react';
import {
  Truck,
  PackageCheck,
  UserCheck,
  CheckCircle2,
  FileCheck2,
  Radio,
  FileBarChart,
  LayoutDashboard,
  ShieldCheck,
  Layers,
  Smartphone
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { DeliveryDashboard } from './DeliveryDashboard';
import { ReadyForDelivery } from './ReadyForDelivery';
import { AssignedOrders } from './AssignedOrders';
import { OutForDelivery } from './OutForDelivery';
import { DeliveredOrders } from './DeliveredOrders';
import { DeliveryHistory } from './DeliveryHistory';
import { RoutePlanner } from './RoutePlanner';
import { DeliveryReports } from './DeliveryReports';
import { DeliveryStaffPortal } from './DeliveryStaffPortal';

export type DeliverySubTab =
  | 'dashboard'
  | 'ready-for-delivery'
  | 'assigned-orders'
  | 'out-for-delivery'
  | 'delivered-orders'
  | 'delivery-history'
  | 'route-planner'
  | 'delivery-reports'
  | 'staff-app';

export interface DeliveryViewProps {
  initialSubPage?: string;
}

export const DeliveryView: React.FC<DeliveryViewProps> = ({ initialSubPage }) => {
  const { user } = useAuth();
  const { orders, employees } = useApp();

  const [activeTab, setActiveTab] = useState<DeliverySubTab>(
    (initialSubPage as DeliverySubTab) || 'dashboard'
  );

  const deliveryStaffList = employees.filter(
    e => !e.isDeleted && (e.role === 'Delivery Staff' || e.department === 'Logistics & Dispatch')
  );

  const isOwnerOrMD =
    user?.role === 'Owner' ||
    user?.role === 'MD' ||
    user?.role === 'Managing Director' ||
    user?.role === 'Admin';

  const readyCount = orders.filter(
    o => o.status === 'Packed' || (o.status === 'Confirmed' && (!o.deliveryStatus || o.deliveryStatus === 'Unassigned'))
  ).length;

  const assignedCount = orders.filter(o => o.deliveryStatus === 'Assigned').length;
  const outCount = orders.filter(o => o.deliveryStatus === 'Out for Delivery').length;
  const deliveredCount = orders.filter(o => o.status === 'Delivered' || o.deliveryStatus === 'Delivered').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Delivery Header Banner */}
      <div className="bg-gradient-to-r from-[#800000] via-[#990000] to-[#550000] text-white p-6 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-400/20 via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950">
                Logistics & Dispatch Engine
              </span>
              {isOwnerOrMD && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/20 text-amber-200 flex items-center gap-1">
                  <ShieldCheck size={12} /> Owner / Delivery Manager Override
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-amber-300 tracking-tight">
              Jamavat Spice Delivery Hub
            </h1>
            <p className="text-xs text-amber-100/90 max-w-2xl font-medium">
              Manage spice dispatches, assign delivery carriers, optimize multi-stop GPS routes, and capture proof of delivery.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-black/20 p-2 rounded-2xl border border-white/10 shrink-0">
            <button
              onClick={() => setActiveTab('staff-app')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'staff-app'
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <Smartphone size={15} />
              <span>Mobile Driver View</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-extrabold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'dashboard'
              ? 'bg-[#800000] text-amber-300 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
          }`}
        >
          <LayoutDashboard size={15} />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => setActiveTab('ready-for-delivery')}
          className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-extrabold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'ready-for-delivery'
              ? 'bg-[#800000] text-amber-300 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
          }`}
        >
          <PackageCheck size={15} />
          <span>Ready for Delivery</span>
          <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-amber-400 text-[#800000]">
            {readyCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('assigned-orders')}
          className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-extrabold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'assigned-orders'
              ? 'bg-[#800000] text-amber-300 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
          }`}
        >
          <UserCheck size={15} />
          <span>Assigned Orders</span>
          <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-blue-500 text-white">
            {assignedCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('out-for-delivery')}
          className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-extrabold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'out-for-delivery'
              ? 'bg-[#800000] text-amber-300 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
          }`}
        >
          <Truck size={15} />
          <span>Out for Delivery</span>
          <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-purple-500 text-white">
            {outCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('delivered-orders')}
          className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-extrabold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'delivered-orders'
              ? 'bg-[#800000] text-amber-300 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
          }`}
        >
          <CheckCircle2 size={15} />
          <span>Delivered Orders</span>
          <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-emerald-500 text-white">
            {deliveredCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('delivery-history')}
          className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-extrabold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'delivery-history'
              ? 'bg-[#800000] text-amber-300 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
          }`}
        >
          <FileCheck2 size={15} />
          <span>Delivery History</span>
        </button>

        <button
          onClick={() => setActiveTab('route-planner')}
          className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-extrabold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'route-planner'
              ? 'bg-[#800000] text-amber-300 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
          }`}
        >
          <Radio size={15} className="animate-pulse text-emerald-400" />
          <span>Route Planner</span>
        </button>

        <button
          onClick={() => setActiveTab('delivery-reports')}
          className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-extrabold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'delivery-reports'
              ? 'bg-[#800000] text-amber-300 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
          }`}
        >
          <FileBarChart size={15} />
          <span>Delivery Reports</span>
        </button>
      </div>

      {/* Tab Renderers */}
      {activeTab === 'dashboard' && <DeliveryDashboard onNavigateSubPage={page => setActiveTab(page as DeliverySubTab)} />}
      {activeTab === 'ready-for-delivery' && <ReadyForDelivery />}
      {activeTab === 'assigned-orders' && <AssignedOrders />}
      {activeTab === 'out-for-delivery' && <OutForDelivery />}
      {activeTab === 'delivered-orders' && <DeliveredOrders />}
      {activeTab === 'delivery-history' && <DeliveryHistory />}
      {activeTab === 'route-planner' && <RoutePlanner />}
      {activeTab === 'delivery-reports' && <DeliveryReports />}
      {activeTab === 'staff-app' && <DeliveryStaffPortal />}
    </div>
  );
};

export default DeliveryView;
