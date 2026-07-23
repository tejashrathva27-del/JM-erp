/**
 * @license
 * Version 1.0.0
 * Jamavat Masala ERP - Delivery History Sub-Page
 */

import React, { useState } from 'react';
import {
  FileCheck2,
  Search,
  Filter,
  Calendar,
  MapPin,
  UserCheck,
  CheckCircle2,
  Clock,
  ArrowDownToLine
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const DeliveryHistory: React.FC = () => {
  const { orders } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const historyOrders = orders.filter(o => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.shopName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.deliveryStaffName && o.deliveryStaffName.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;
    if (statusFilter === 'Delivered') return o.status === 'Delivered';
    if (statusFilter === 'Dispatched') return o.deliveryStatus === 'Out for Delivery';
    if (statusFilter === 'Assigned') return o.deliveryStatus === 'Assigned';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h2 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
            <FileCheck2 className="text-[#800000] dark:text-amber-400" size={22} />
            <span>Delivery History & POD Archives</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit history logs for all dispatched and delivered spice orders
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search order, shop, driver..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#800000]/30"
            />
          </div>

          <div className="flex items-center gap-1">
            {['All', 'Delivered', 'Dispatched', 'Assigned'].map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
                  statusFilter === st
                    ? 'bg-[#800000] text-amber-300 shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* History Log Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-extrabold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Order #</th>
                <th className="py-3.5 px-4">Shop Name</th>
                <th className="py-3.5 px-4">City / Address</th>
                <th className="py-3.5 px-4">Driver / Staff</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Total Amount</th>
                <th className="py-3.5 px-4 text-right">Completion Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {historyOrders.map(o => (
                <tr key={o.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-extrabold text-[#800000] dark:text-amber-400">
                    {o.orderNumber}
                  </td>
                  <td className="py-3.5 px-4 font-extrabold text-slate-800 dark:text-white">
                    {o.shopName}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">
                    {o.city}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-700 dark:text-slate-300">
                    {o.deliveryStaffName || 'Unassigned / Depot'}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                        o.status === 'Delivered'
                          ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300'
                          : o.deliveryStatus === 'Out for Delivery'
                          ? 'bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-300'
                          : 'bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-300'
                      }`}
                    >
                      {o.deliveryStatus || o.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-black text-slate-800 dark:text-white">
                    {formatCurrency(o.netTotal)}
                  </td>
                  <td className="py-3.5 px-4 text-right text-slate-500 font-medium">
                    {o.deliveredAt ? formatDate(o.deliveredAt) : formatDate(o.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {historyOrders.length === 0 && (
          <div className="p-12 text-center text-xs text-slate-400 space-y-2">
            <FileCheck2 className="mx-auto text-slate-300 dark:text-slate-700" size={40} />
            <p className="font-extrabold">No History Logs Found Matching Criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryHistory;
