import React, { useState, useMemo } from 'react';
import {
  FileText,
  Search,
  Calendar,
  Filter,
  Download,
  Printer,
  Eye,
  Trash2,
  DollarSign,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building2,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Order, OrderStatus } from '../../types/erp';
import { generateInvoicePDF, printInvoiceHTML } from '../../utils/pdfGenerator';
import { InvoiceModal } from '../modals/InvoiceModal';

export const InvoiceHistoryView: React.FC = () => {
  const { orders, shops, settings, deleteOrder } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedShopId, setSelectedShopId] = useState('ALL');
  const [selectedDate, setSelectedDate] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);

  // Filtered Invoices logic
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      // Search term
      const matchesSearch =
        (o.invoiceNumber && o.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
        o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.shopName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (o.shopGst && o.shopGst.toLowerCase().includes(searchTerm.toLowerCase()));

      // Shop filter
      const matchesShop = selectedShopId === 'ALL' || o.shopId === selectedShopId;

      // Date filter (YYYY-MM-DD)
      const orderDate = o.createdAt.substring(0, 10);
      const matchesDate = !selectedDate || orderDate === selectedDate;

      // Status filter
      const matchesStatus =
        statusFilter === 'ALL' ||
        o.paymentStatus.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesShop && matchesDate && matchesStatus;
    });
  }, [orders, searchTerm, selectedShopId, selectedDate, statusFilter]);

  // Statistics calculation
  const totalInvoicedAmount = useMemo(() => {
    return orders.reduce((acc, o) => acc + o.netTotal, 0);
  }, [orders]);

  const totalPaidAmount = useMemo(() => {
    return orders.reduce((acc, o) => acc + o.paidAmount, 0);
  }, [orders]);

  const totalUnpaidAmount = useMemo(() => {
    return orders.reduce((acc, o) => acc + (o.netTotal - o.paidAmount), 0);
  }, [orders]);

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  };

  const formatDate = (isoStr: string) => {
    return new Date(isoStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300';
      case 'Partial':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300';
      default:
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300';
    }
  };

  const handleDelete = (order: Order) => {
    if (confirm(`Are you sure you want to delete Invoice #${order.invoiceNumber || order.orderNumber}?`)) {
      deleteOrder(order.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-[#800000] text-amber-400 shadow-md">
            <FileText size={24} />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-800 dark:text-white">
              GST Invoice History
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Manage, print, and download generated tax invoices for Jamavat Masala dealers
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <span className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-bold flex items-center gap-1.5">
            <Sparkles size={14} className="text-amber-500" />
            <span>Auto Incrementing Numbers</span>
          </span>
        </div>
      </div>

      {/* Stats Overview Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Total Invoices</span>
            <FileText size={18} className="text-[#800000] dark:text-amber-400" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white mt-2">
            {orders.length}
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">Generated in ERP</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Total Invoiced</span>
            <DollarSign size={18} className="text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white mt-2">
            {formatCurrency(totalInvoicedAmount)}
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">Gross Billed Value</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Total Collected</span>
            <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
            {formatCurrency(totalPaidAmount)}
          </p>
          <span className="text-[11px] text-emerald-600/80 font-medium mt-1 block">Realized Payments</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Pending Amount</span>
            <AlertCircle size={18} className="text-rose-600 dark:text-rose-400" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 mt-2">
            {formatCurrency(totalUnpaidAmount)}
          </p>
          <span className="text-[11px] text-rose-600/80 font-medium mt-1 block">Uncollected Balance</span>
        </div>
      </div>

      {/* Search & Filters Controls Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search Invoice #, Order #, Shop..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#800000]/30"
            />
          </div>

          {/* Shop Filter */}
          <div className="relative">
            <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={selectedShopId}
              onChange={e => setSelectedShopId(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#800000]/30 cursor-pointer"
            >
              <option value="ALL">All Shops & Dealers</option>
              {shops.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.city})
                </option>
              ))}
            </select>
          </div>

          {/* Date Filter */}
          <div className="relative">
            <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#800000]/30"
            />
          </div>

          {/* Payment Status Filter */}
          <div className="relative">
            <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#800000]/30 cursor-pointer"
            >
              <option value="ALL">All Payment Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Partial">Partial</option>
              <option value="Unpaid">Unpaid</option>
            </select>
          </div>
        </div>

        {/* Clear filters shortcut if active */}
        {(searchTerm || selectedShopId !== 'ALL' || selectedDate || statusFilter !== 'ALL') && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            <span className="text-slate-500">
              Showing <strong className="text-slate-800 dark:text-white">{filteredOrders.length}</strong> of {orders.length} invoices
            </span>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedShopId('ALL');
                setSelectedDate('');
                setStatusFilter('ALL');
              }}
              className="text-[#800000] dark:text-amber-400 font-bold hover:underline"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Invoices List / Table */}
      <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        
        {/* Mobile Stacked Cards View */}
        <div className="grid grid-cols-1 gap-3.5 sm:hidden">
          {filteredOrders.length === 0 ? (
            <div className="py-10 text-center text-slate-400 font-medium text-xs">
              No Invoices found matching the search criteria.
            </div>
          ) : (
            filteredOrders.map(o => {
              const shopObj = shops.find(s => s.id === o.shopId);

              return (
                <div
                  key={o.id}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-black text-[#800000] dark:text-amber-400 text-sm">
                        {o.invoiceNumber || o.orderNumber}
                      </span>
                      <span className="text-[10px] text-slate-400 block">Ref: {o.orderNumber}</span>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getPaymentBadge(o.paymentStatus)}`}>
                      {o.paymentStatus}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-white text-sm">{o.shopName}</h4>
                      <p className="text-[11px] text-slate-500">{formatDate(o.createdAt)} • {o.items.length} items</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">Net Total</span>
                      <span className="font-extrabold text-slate-800 dark:text-white text-sm">
                        {formatCurrency(o.netTotal)}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/40 flex items-center justify-between gap-1.5">
                    <button
                      onClick={() => setViewingOrder(o)}
                      className="px-2.5 py-1.5 rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 font-bold text-xs flex items-center gap-1"
                    >
                      <Eye size={14} /> View
                    </button>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => generateInvoicePDF(o, settings, shopObj)}
                        className="p-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-[#800000] font-bold"
                        title="Download PDF"
                      >
                        <Download size={15} />
                      </button>
                      <button
                        onClick={() => printInvoiceHTML(o, settings, shopObj)}
                        className="p-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold"
                        title="Print Invoice"
                      >
                        <Printer size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(o)}
                        className="p-1.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100"
                        title="Delete Invoice"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop & Tablet Table View */}
        <div className="overflow-x-auto hidden sm:block">
          <table className="w-full text-left border-collapse text-xs min-w-[800px]">
            <thead>
              <tr className="bg-[#800000] text-white font-bold">
                <th className="py-3 px-4 rounded-l-xl">Invoice #</th>
                <th className="py-3 px-4">Order Ref #</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Customer / Shop Name</th>
                <th className="py-3 px-4 text-right">Net Amount</th>
                <th className="py-3 px-4 text-center">Payment</th>
                <th className="py-3 px-4 text-center rounded-r-xl">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 font-semibold">
                    No Invoices found matching search filter.
                  </td>
                </tr>
              ) : (
                filteredOrders.map(o => {
                  const shopObj = shops.find(s => s.id === o.shopId);

                  return (
                    <tr key={o.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-black text-[#800000] dark:text-amber-400">
                        {o.invoiceNumber || o.orderNumber}
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-semibold">{o.orderNumber}</td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                        {formatDate(o.createdAt)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-800 dark:text-white block">{o.shopName}</span>
                        <span className="text-[10px] text-slate-400">GST: {o.shopGst || 'URP'}</span>
                      </td>
                      <td className="py-3 px-4 text-right font-black text-slate-800 dark:text-white">
                        {formatCurrency(o.netTotal)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getPaymentBadge(o.paymentStatus)}`}>
                          {o.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setViewingOrder(o)}
                            className="p-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 hover:bg-blue-100 transition-all cursor-pointer"
                            title="View Invoice Modal"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => generateInvoicePDF(o, settings, shopObj)}
                            className="p-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-[#800000] transition-all cursor-pointer"
                            title="Download PDF"
                          >
                            <Download size={16} />
                          </button>
                          <button
                            onClick={() => printInvoiceHTML(o, settings, shopObj)}
                            className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-all cursor-pointer"
                            title="Print Invoice"
                          >
                            <Printer size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(o)}
                            className="p-1.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/50 dark:text-rose-400 transition-all cursor-pointer"
                            title="Delete Invoice"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Viewing Modal */}
      {viewingOrder && (
        <InvoiceModal
          order={viewingOrder}
          settings={settings}
          shop={shops.find(s => s.id === viewingOrder.shopId)}
          onClose={() => setViewingOrder(null)}
        />
      )}
    </div>
  );
};
