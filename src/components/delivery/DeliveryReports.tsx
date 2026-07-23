/**
 * @license
 * Version 1.0.0
 * Jamavat Masala ERP - Delivery Reports Sub-Page
 */

import React from 'react';
import { FileBarChart, TrendingUp, CheckCircle2, Clock, Users, MapPin } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/formatters';

export const DeliveryReports: React.FC = () => {
  const { orders, employees } = useApp();

  const totalOrders = orders.length;
  const deliveredOrders = orders.filter(o => o.status === 'Delivered' || o.deliveryStatus === 'Delivered');
  const outForDeliveryOrders = orders.filter(o => o.deliveryStatus === 'Out for Delivery');
  const readyOrders = orders.filter(
    o => o.status === 'Packed' || (o.status === 'Confirmed' && (!o.deliveryStatus || o.deliveryStatus === 'Unassigned'))
  );

  const deliveryStaffList = employees.filter(
    e => !e.isDeleted && (e.role === 'Delivery Staff' || e.department === 'Logistics & Dispatch')
  );

  // Calculate city-wise breakdown
  const cityBreakdown = orders.reduce((acc, order) => {
    const city = order.city || 'Vadodara';
    acc[city] = (acc[city] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h2 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
            <FileBarChart className="text-[#800000] dark:text-amber-400" size={22} />
            <span>Delivery Performance & Dispatch Analytics</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Key logistics metrics, SLA fulfillment rates, carrier efficiency, and geographic distribution
          </p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-bold text-slate-500">Total Logistics Orders</p>
          <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-1">{totalOrders}</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">100% catalogued</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-bold text-slate-500">Delivered Success Rate</p>
          <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {totalOrders > 0 ? Math.round((deliveredOrders.length / totalOrders) * 100) : 0}%
          </h3>
          <p className="text-[11px] text-emerald-600 mt-0.5">{deliveredOrders.length} completed</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-bold text-slate-500">In-Transit Active</p>
          <h3 className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">{outForDeliveryOrders.length}</h3>
          <p className="text-[11px] text-purple-500 mt-0.5">Live on road</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-bold text-slate-500">Average Fulfillment Time</p>
          <h3 className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">4.2 Hours</h3>
          <p className="text-[11px] text-amber-500 mt-0.5">Depot to shop</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Carrier Efficiency */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="font-extrabold text-sm text-slate-800 dark:text-white flex items-center gap-2">
            <Users size={18} className="text-[#800000] dark:text-amber-400" />
            <span>Carrier Staff Performance</span>
          </h3>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {deliveryStaffList.map(staff => {
              const staffDelivered = orders.filter(
                o => o.deliveryStaffId === staff.id && (o.status === 'Delivered' || o.deliveryStatus === 'Delivered')
              ).length;
              const staffActive = orders.filter(
                o => o.deliveryStaffId === staff.id && o.deliveryStatus === 'Out for Delivery'
              ).length;

              return (
                <div key={staff.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-extrabold text-slate-800 dark:text-white">{staff.name}</h4>
                    <p className="text-[11px] text-slate-400">{staff.vehicleType || 'Motorcycle'} • {staff.city || 'Vadodara'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-emerald-600">{staffDelivered} Delivered</p>
                    <p className="text-[10px] text-purple-600 font-bold">{staffActive} In-Transit</p>
                  </div>
                </div>
              );
            })}
            {deliveryStaffList.length === 0 && (
              <div className="py-6 text-center text-xs text-slate-400">
                Owner / MD acting as primary delivery managers.
              </div>
            )}
          </div>
        </div>

        {/* Geographic Distribution */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="font-extrabold text-sm text-slate-800 dark:text-white flex items-center gap-2">
            <MapPin size={18} className="text-blue-500" />
            <span>City & Territory Dispatch Share</span>
          </h3>

          <div className="space-y-3">
            {Object.entries(cityBreakdown).map(([city, count]) => {
              const percentage = Math.round((count / (totalOrders || 1)) * 100);
              return (
                <div key={city} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-800 dark:text-white">{city}</span>
                    <span className="text-slate-500">{count} orders ({percentage}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#800000] to-amber-400 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryReports;
