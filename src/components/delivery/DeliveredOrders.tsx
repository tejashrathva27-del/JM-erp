/**
 * @license
 * Version 1.0.0
 * Jamavat Masala ERP - Delivered Orders Sub-Page
 */

import React, { useState } from 'react';
import {
  CheckCircle2,
  FileText,
  Search,
  Download,
  Receipt,
  UserCheck,
  Calendar,
  Check,
  MapPin,
  Eye
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { InvoiceModal } from '../modals/InvoiceModal';

export const DeliveredOrders: React.FC = () => {
  const { orders } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<any>(null);

  const deliveredOrders = orders.filter(
    o => o.status === 'Delivered' || o.deliveryStatus === 'Delivered'
  ).filter(
    o =>
      o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.shopName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h2 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
            <CheckCircle2 className="text-emerald-500" size={22} />
            <span>Delivered Orders & Proofs</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Completed shop deliveries with digital signatures, photos, and payment status
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search order #, shop, city..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#800000]/30"
          />
        </div>
      </div>

      {/* Table / List */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-extrabold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Order #</th>
                <th className="py-3.5 px-4">Shop & Location</th>
                <th className="py-3.5 px-4">Carrier Staff</th>
                <th className="py-3.5 px-4">Delivered Date</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Payment</th>
                <th className="py-3.5 px-4 text-right">Receipt & Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {deliveredOrders.map(o => (
                <tr key={o.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-extrabold text-[#800000] dark:text-amber-400">
                    {o.orderNumber}
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-extrabold text-slate-800 dark:text-white">{o.shopName}</p>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1">
                      <MapPin size={11} /> {o.city}
                    </p>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-700 dark:text-slate-300">
                    {o.deliveryStaffName || 'Delivery Staff'}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">
                    {o.deliveredAt ? formatDate(o.deliveredAt) : formatDate(o.createdAt)}
                  </td>
                  <td className="py-3.5 px-4 font-black text-slate-800 dark:text-white">
                    {formatCurrency(o.netTotal)}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1 w-fit">
                      <Check size={11} />
                      {o.paymentStatus || 'Paid'} ({o.paymentMethod || 'UPI/Cash'})
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setSelectedInvoiceOrder(o)}
                      className="px-3 py-1.5 rounded-xl bg-amber-500/10 text-[#800000] dark:text-amber-300 hover:bg-amber-500/20 font-bold text-xs inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Receipt size={14} />
                      <span>View Receipt</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {deliveredOrders.length === 0 && (
          <div className="p-12 text-center text-xs text-slate-400 space-y-2">
            <CheckCircle2 className="mx-auto text-slate-300 dark:text-slate-700" size={40} />
            <p className="font-extrabold">No Delivered Orders Found</p>
          </div>
        )}
      </div>

      {/* Invoice Modal */}
      {selectedInvoiceOrder && (
        <InvoiceModal order={selectedInvoiceOrder} onClose={() => setSelectedInvoiceOrder(null)} />
      )}
    </div>
  );
};

export default DeliveredOrders;
