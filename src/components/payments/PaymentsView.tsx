/**
 * @license
 * Version 1.0.0
 * Jamavat Masala ERP - Payments & Receipts Module
 */

import React, { useState } from 'react';
import { Receipt, Plus, Search, IndianRupee, Printer, FileCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Toolbar } from '../common/Toolbar';

export const PaymentsView: React.FC = () => {
  const { payments, openNewModal } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPayments = payments.filter(
    p =>
      p.shopName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.mode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalCollected = payments.reduce((acc, p) => acc + p.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Receipt className="text-[#800000] dark:text-amber-400" size={20} />
            <span>Dealer Payments & Receipts Log</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Record UPI, NEFT bank transfers, cash collections & print official payment vouchers
          </p>
        </div>
        <Toolbar
          newButtonLabel="Record New Payment"
          onNewClick={() => openNewModal('payment')}
          exportData={filteredPayments}
          exportFilename="JM_ERP_Payments"
        />
      </div>

      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500">Total Payment Receipts Collected</p>
          <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {formatCurrency(totalCollected)}
          </h3>
        </div>
        <div className="relative w-72">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search Shop, Receipt #, Payment Mode..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
          />
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#800000] text-white font-bold">
                <th className="py-3 px-4 rounded-l-xl">Receipt #</th>
                <th className="py-3 px-4">Dealer / Shop</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Payment Mode</th>
                <th className="py-3 px-4">Reference / Txn ID</th>
                <th className="py-3 px-4">Amount Paid</th>
                <th className="py-3 px-4 rounded-r-xl text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredPayments.map(p => (
                <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="py-3.5 px-4 font-bold text-[#800000] dark:text-amber-400">
                    {p.receiptNumber}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-100">
                    {p.shopName}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">{formatDate(p.createdAt)}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">
                    {p.mode}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-500">
                    {p.transactionReference || '-'}
                  </td>
                  <td className="py-3.5 px-4 font-black text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(p.amount)}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => alert(`Receipt #${p.receiptNumber} voucher print ready.`)}
                      className="p-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100"
                      title="Print Voucher"
                    >
                      <Printer size={14} />
                    </button>
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
