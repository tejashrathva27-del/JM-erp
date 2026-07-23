/**
 * @license
 * Version 1.0.0
 * Jamavat Masala ERP - Delivery Dashboard Sub-Page
 */

import React from 'react';
import {
  Truck,
  PackageCheck,
  UserCheck,
  CheckCircle2,
  Clock,
  ShieldCheck,
  TrendingUp,
  MapPin,
  Navigation,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const DeliveryDashboard: React.FC<{ onNavigateSubPage?: (page: string) => void }> = ({ onNavigateSubPage }) => {
  const { orders, employees } = useApp();
  const { user } = useAuth();

  const isOwnerOrMD =
    user?.role === 'Owner' ||
    user?.role === 'MD' ||
    user?.role === 'Managing Director' ||
    user?.role === 'Admin';

  const readyOrders = orders.filter(
    o => o.status === 'Packed' || (o.status === 'Confirmed' && (!o.deliveryStatus || o.deliveryStatus === 'Unassigned'))
  );
  const assignedOrders = orders.filter(o => o.deliveryStatus === 'Assigned');
  const outForDeliveryOrders = orders.filter(o => o.deliveryStatus === 'Out for Delivery');
  const deliveredOrders = orders.filter(o => o.status === 'Delivered' || o.deliveryStatus === 'Delivered');

  const deliveryStaffList = employees.filter(
    e => !e.isDeleted && (e.role === 'Delivery Staff' || e.department === 'Logistics & Dispatch')
  );

  return (
    <div className="space-y-6">
      {/* Banner / Role Indicator */}
      {isOwnerOrMD && deliveryStaffList.length === 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4 text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
              <ShieldCheck size={22} className="text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm">Delivery Manager Mode Active</h4>
              <p className="text-xs opacity-90">
                No active Delivery Staff registered. Owner & MD can directly manage, accept, assign, and mark orders as delivered.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateSubPage?.('ready-for-delivery')}
            className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-black text-xs hover:bg-amber-400 transition-all cursor-pointer whitespace-nowrap"
          >
            Manage Ready Orders
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div
          onClick={() => onNavigateSubPage?.('ready-for-delivery')}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-[#800000] transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Ready for Delivery</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <PackageCheck size={18} />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-2">{readyOrders.length}</h3>
          <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-1 flex items-center gap-1">
            <span>Awaiting dispatch</span>
            <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
          </p>
        </div>

        <div
          onClick={() => onNavigateSubPage?.('assigned-orders')}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-[#800000] transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Assigned</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <UserCheck size={18} />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-2">{assignedOrders.length}</h3>
          <p className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold mt-1 flex items-center gap-1">
            <span>Carriers assigned</span>
            <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
          </p>
        </div>

        <div
          onClick={() => onNavigateSubPage?.('out-for-delivery')}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-[#800000] transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Out for Delivery</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center">
              <Truck size={18} />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-2">{outForDeliveryOrders.length}</h3>
          <p className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold mt-1 flex items-center gap-1">
            <span>In-transit now</span>
            <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
          </p>
        </div>

        <div
          onClick={() => onNavigateSubPage?.('delivered-orders')}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-[#800000] transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Delivered</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-2">{deliveredOrders.length}</h3>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 flex items-center gap-1">
            <span>Completed orders</span>
            <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
          </p>
        </div>
      </div>

      {/* Active Deliveries List Preview */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
              <Truck size={20} className="text-[#800000] dark:text-amber-400" />
              <span>Active Delivery Queue</span>
            </h3>
            <p className="text-xs text-slate-500">Overview of pending and live in-transit dispatches</p>
          </div>
          <button
            onClick={() => onNavigateSubPage?.('ready-for-delivery')}
            className="text-xs font-bold text-[#800000] dark:text-amber-400 hover:underline"
          >
            View All Pending
          </button>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {[...outForDeliveryOrders, ...readyOrders, ...assignedOrders].slice(0, 5).map(o => (
            <div key={o.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-[#800000] dark:text-amber-400">{o.orderNumber}</span>
                  <span className="font-bold text-slate-800 dark:text-white">{o.shopName}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-extrabold bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300">
                    {o.deliveryStatus || o.status}
                  </span>
                </div>
                <p className="text-slate-500 flex items-center gap-1">
                  <MapPin size={12} /> {o.deliveryAddress || 'Shop Location'}, {o.city}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-extrabold text-slate-800 dark:text-white">{formatCurrency(o.netTotal)}</span>
                <button
                  onClick={() => onNavigateSubPage?.('ready-for-delivery')}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-[11px]"
                >
                  Manage Order
                </button>
              </div>
            </div>
          ))}
          {[...outForDeliveryOrders, ...readyOrders, ...assignedOrders].length === 0 && (
            <div className="py-8 text-center text-xs text-slate-400">
              No active orders currently queued for delivery.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeliveryDashboard;
