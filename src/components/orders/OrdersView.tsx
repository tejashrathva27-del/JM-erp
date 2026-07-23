/**
 * @license
 * Version 1.0.0
 * Jamavat Masala ERP - Orders Management & Invoice Dispatch Module
 */

import React, { useState } from 'react';
import { ShoppingCart, Plus, Search, Filter, FileText, CheckCircle, Truck, Printer, Eye, MessageSquare, Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Order, OrderStatus } from '../../types/erp';
import { formatCurrency, formatDate, getStatusBadgeClass } from '../../utils/formatters';
import { InvoiceView } from './InvoiceView';
import { Toolbar } from '../common/Toolbar';

export const OrdersView: React.FC = () => {
  const { orders, updateOrderStatus, openNewModal } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [viewingInvoiceOrder, setViewingInvoiceOrder] = useState<Order | null>(null);

  const statuses = ['All', 'Pending', 'Confirmed', 'Processing', 'Packed', 'Dispatched', 'Delivered', 'Cancelled'];

  const filteredOrders = orders.filter(o => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.shopName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.invoiceNumber && o.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = selectedStatus === 'All' || o.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  if (viewingInvoiceOrder) {
    return <InvoiceView order={viewingInvoiceOrder} onBack={() => setViewingInvoiceOrder(null)} />;
  }

  return (
    <div className="space-y-6">
      {/* Header & Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <ShoppingCart className="text-[#800000] dark:text-amber-400" size={20} />
            <span>Customer & Wholesale Orders</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Process new sales orders, compute GST invoices, update dispatch statuses & print bills
          </p>
        </div>
        <Toolbar
          newButtonLabel="Create New Order"
          onNewClick={() => openNewModal('order')}
          exportData={filteredOrders}
          exportFilename="JM_ERP_Orders"
        />
      </div>

      {/* Filter Tabs & Search */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search Order #, Invoice #, Shop Name..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#800000]/30"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {statuses.map(st => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedStatus === st
                  ? 'bg-[#800000] text-amber-300 shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table Container */}
      <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Mobile Stacked Cards View */}
        <div className="grid grid-cols-1 gap-3 sm:hidden">
          {filteredOrders.length === 0 ? (
            <div className="py-8 text-center text-slate-400 font-semibold text-xs">
              No Orders found. Click "Create New Order" to generate one!
            </div>
          ) : (
            filteredOrders.map(o => (
              <div
                key={o.id}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-[#800000] dark:text-amber-400 text-xs">
                    {o.orderNumber}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500">
                    {o.invoiceNumber || '-'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 dark:text-white text-sm">{o.shopName}</span>
                  <span className="font-black text-slate-800 dark:text-white text-sm">
                    {formatCurrency(o.netTotal)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200/60 dark:border-slate-700/40">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-slate-400">Status:</span>
                    <select
                      value={o.status}
                      onChange={e => updateOrderStatus(o.id, e.target.value as OrderStatus)}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border-none outline-none cursor-pointer ${getStatusBadgeClass(o.status)}`}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Processing">Processing</option>
                      <option value="Packed">Packed</option>
                      <option value="Dispatched">Dispatched</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getStatusBadgeClass(o.paymentStatus)}`}>
                    {o.paymentStatus}
                  </span>
                </div>
                <div className="pt-1 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-slate-400">{formatDate(o.createdAt)} • {o.items.length} items</span>
                  <button
                    onClick={() => setViewingInvoiceOrder(o)}
                    className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-[#800000] font-bold text-xs flex items-center gap-1 shadow-xs"
                  >
                    <FileText size={14} />
                    <span>Invoice</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop & Tablet Table View */}
        <div className="overflow-x-auto hidden sm:block">
          <table className="w-full text-left border-collapse text-xs min-w-[750px]">
            <thead>
              <tr className="bg-[#800000] text-white font-bold">
                <th className="py-3 px-4 rounded-l-xl">Order #</th>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Shop / Customer</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Items Count</th>
                <th className="py-3 px-4">Net Total</th>
                <th className="py-3 px-4">Dispatch Status</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4 rounded-r-xl text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400 font-semibold">
                    No Orders found. Click "Create New Order" to generate one!
                  </td>
                </tr>
              ) : (
                filteredOrders.map(o => (
                  <tr key={o.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-black text-[#800000] dark:text-amber-400">
                      {o.orderNumber}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-700 dark:text-slate-300">
                      {o.invoiceNumber || '-'}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-100">
                      {o.shopName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{formatDate(o.createdAt)}</td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      {o.items.length} items
                    </td>
                    <td className="py-3.5 px-4 font-black text-slate-800 dark:text-white">
                      {formatCurrency(o.netTotal)}
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={o.status}
                        onChange={e => updateOrderStatus(o.id, e.target.value as OrderStatus)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold border-none outline-none cursor-pointer ${getStatusBadgeClass(o.status)}`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Processing">Processing</option>
                        <option value="Packed">Packed</option>
                        <option value="Dispatched">Dispatched</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${getStatusBadgeClass(o.paymentStatus)}`}>
                        {o.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setViewingInvoiceOrder(o)}
                        className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-[#800000] font-bold text-xs flex items-center gap-1 ml-auto shadow-xs"
                      >
                        <FileText size={14} />
                        <span>View Invoice</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
