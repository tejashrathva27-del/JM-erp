/**
 * @license
 * Version 1.0.0
 * Jamavat Masala ERP - Realtime Dashboard Module
 */

import React from 'react';
import {
  IndianRupee,
  ShoppingCart,
  Package,
  Users,
  Truck,
  AlertTriangle,
  Gift,
  ArrowUpRight,
  TrendingUp,
  Clock,
  ChevronRight,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDate, getStatusBadgeClass } from '../../utils/formatters';
import { Toolbar } from '../common/Toolbar';
import { JamavatLogo } from '../../utils/logo';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

export const DashboardView: React.FC = () => {
  const {
    dashboardStats,
    orders,
    products,
    employees,
    shops,
    setActiveModule,
    openNewModal
  } = useApp();

  // Monthly Revenue Chart Data
  const chartData = [
    { month: 'Feb', sales: 120000, expenses: 65000 },
    { month: 'Mar', sales: 185000, expenses: 82000 },
    { month: 'Apr', sales: 210000, expenses: 95000 },
    { month: 'May', sales: 195000, expenses: 90000 },
    { month: 'Jun', sales: 240000, expenses: 105000 },
    { month: 'Jul', sales: 298000, expenses: 128000 },
  ];

  // Low stock items
  const lowStockProducts = products.filter(p => p.currentStock <= p.reorderLevel);

  // Today's Employee Reminders (Birthdays or Anniversaries)
  const todayBirthdays = employees.filter(e => {
    if (!e.dateOfBirth) return false;
    const dob = e.dateOfBirth.substring(5); // MM-DD
    return dob === '07-23'; // matches current simulated date
  });

  return (
    <div className="space-y-6">
      {/* Quick Action Toolbar & Brand Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3.5">
          <JamavatLogo size="md" className="h-11 sm:h-12 w-auto shrink-0 drop-shadow-sm" />
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-800 dark:text-white">
              Jamavat Masala Executive Overview
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Realtime Manufacturing, Stock, Sales & Operational Metrics
            </p>
          </div>
        </div>
        <Toolbar newButtonLabel="Create New Order" onNewClick={() => openNewModal('order')} />
      </div>

      {/* Birthday / Work Anniversary Banner if present */}
      {todayBirthdays.length > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-[#800000] text-white shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <Gift size={20} className="text-amber-200 animate-bounce" />
            </div>
            <div>
              <p className="text-xs font-semibold text-amber-200 uppercase tracking-wider">
                🎂 Birthday Alert Today!
              </p>
              <p className="text-sm font-bold">
                {todayBirthdays.map(e => `${e.name} (${e.designation})`).join(', ')} celebrates a birthday today!
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveModule('employees')}
            className="px-3 py-1.5 rounded-xl bg-white text-[#800000] text-xs font-bold hover:bg-amber-100 transition-all shadow-xs"
          >
            Wish Employee
          </button>
        </div>
      )}

      {/* Primary KPI Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sales Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-[#800000]/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Total Revenue Sales
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-[#800000] dark:text-amber-400 flex items-center justify-center">
              <IndianRupee size={18} />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-slate-800 dark:text-white">
              {formatCurrency(dashboardStats.totalSales)}
            </h3>
            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              <TrendingUp size={12} />
              <span>+18.4% from last month</span>
            </div>
          </div>
        </div>

        {/* Total Orders Card */}
        <div
          onClick={() => setActiveModule('orders')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm cursor-pointer hover:border-[#800000]/40 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Orders Placed
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <ShoppingCart size={18} />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-slate-800 dark:text-white">
              {dashboardStats.totalOrders}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">
              {dashboardStats.pendingDispatchCount} pending dispatch
            </p>
          </div>
        </div>

        {/* Active Products Card */}
        <div
          onClick={() => setActiveModule('products')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm cursor-pointer hover:border-[#800000]/40 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Catalog Masala SKUs
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Package size={18} />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-slate-800 dark:text-white">
              {dashboardStats.activeProducts}
            </h3>
            <p className="text-[11px] text-rose-500 font-semibold mt-1">
              {dashboardStats.lowStockCount} low stock alerts
            </p>
          </div>
        </div>

        {/* Employees Active Card */}
        <div
          onClick={() => setActiveModule('employees')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm cursor-pointer hover:border-[#800000]/40 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Registered Employees
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Users size={18} />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-slate-800 dark:text-white">
              {dashboardStats.totalEmployees}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">
              Across Factory, Sales, HR & Logistics
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Split Grid: Analytics Chart + Low Stock Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Trend Chart (2 Columns) */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                Monthly Sales & Expense Performance (₹)
              </h3>
              <p className="text-xs text-slate-400">2026 Financial Revenue Trajectory</p>
            </div>
            <span className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              Monthly
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#800000" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#800000" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d4af37" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#d4af37" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Amount']}
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="sales" name="Sales Revenue" stroke="#800000" fillOpacity={1} fill="url(#colorSales)" />
                <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#d4af37" fillOpacity={1} fill="url(#colorExp)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Low Stock Warning & Shop Outstanding Panel (1 Column) */}
        <div className="space-y-6">
          {/* Low Stock Card */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} className="text-amber-500" />
                <h3 className="text-xs font-bold text-slate-800 dark:text-white">
                  Low Stock Inventory Alerts
                </h3>
              </div>
              <button
                onClick={() => setActiveModule('products')}
                className="text-[11px] text-[#800000] dark:text-amber-400 font-bold hover:underline"
              >
                View All
              </button>
            </div>

            <div className="space-y-2.5">
              {lowStockProducts.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400">
                  <CheckCircle2 size={24} className="mx-auto text-emerald-500 mb-1" />
                  All stock levels are optimal.
                </div>
              ) : (
                lowStockProducts.map(p => (
                  <div
                    key={p.id}
                    className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[160px]">
                        {p.name}
                      </p>
                      <p className="text-[10px] text-slate-500">Unit: {p.unit} • SKU: {p.code}</p>
                    </div>
                    <span className="px-2 py-1 text-[11px] font-extrabold rounded-lg bg-rose-500 text-white shadow-xs">
                      {p.currentStock} left
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Total Shop Outstanding Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#800000] to-[#5c0000] text-white shadow-md">
            <p className="text-xs font-semibold text-amber-200">Total Dealers Outstanding</p>
            <h4 className="text-2xl font-black mt-1 text-white">
              {formatCurrency(dashboardStats.outstandingPaymentsTotal)}
            </h4>
            <p className="text-[11px] text-amber-100/70 mt-1">
              Across {shops.length} registered wholesale distribution shops
            </p>
            <button
              onClick={() => setActiveModule('shops')}
              className="mt-3 w-full py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#800000] font-bold text-xs transition-all shadow-sm"
            >
              Collect Payments
            </button>
          </div>
        </div>
      </div>

      {/* Recent Orders Realtime Table */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">Recent Orders Log</h3>
            <p className="text-xs text-slate-400">Live order status and fulfillment tracking</p>
          </div>
          <button
            onClick={() => setActiveModule('orders')}
            className="text-xs text-[#800000] dark:text-amber-400 font-bold hover:underline flex items-center gap-1"
          >
            <span>View All Orders</span>
            <ChevronRight size={14} />
          </button>
        </div>

        {/* Mobile Stacked Cards View */}
        <div className="grid grid-cols-1 gap-3 sm:hidden">
          {orders.slice(0, 5).map(o => (
            <div
              key={o.id}
              className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-[#800000] dark:text-amber-400 text-xs">
                  {o.orderNumber}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getStatusBadgeClass(o.status)}`}>
                  {o.status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 dark:text-white text-xs">{o.shopName}</span>
                <span className="font-extrabold text-slate-800 dark:text-white text-xs">
                  {formatCurrency(o.netTotal)}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-200/60 dark:border-slate-700/40 pt-2">
                <span>{formatDate(o.createdAt)} • {o.items.length} items</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getStatusBadgeClass(o.paymentStatus)}`}>
                  {o.paymentStatus}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop & Tablet Table View */}
        <div className="overflow-x-auto hidden sm:block">
          <table className="w-full text-left border-collapse text-xs min-w-[600px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                <th className="py-3 px-4 rounded-l-xl">Order #</th>
                <th className="py-3 px-4">Shop Name</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Items</th>
                <th className="py-3 px-4">Net Total</th>
                <th className="py-3 px-4">Dispatch Status</th>
                <th className="py-3 px-4 rounded-r-xl text-right">Payment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {orders.slice(0, 5).map(o => (
                <tr key={o.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-extrabold text-[#800000] dark:text-amber-400">
                    {o.orderNumber}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                    {o.shopName}
                  </td>
                  <td className="py-3 px-4 text-slate-500">{formatDate(o.createdAt)}</td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                    {o.items.length} items
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-800 dark:text-white">
                    {formatCurrency(o.netTotal)}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${getStatusBadgeClass(o.status)}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${getStatusBadgeClass(o.paymentStatus)}`}>
                      {o.paymentStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
