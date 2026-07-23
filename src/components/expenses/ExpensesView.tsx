/**
 * @license
 * Version 1.0.0
 * Jamavat Masala ERP - Expenses Module
 */

import React, { useState } from 'react';
import { CreditCard, Plus, Search, IndianRupee } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Toolbar } from '../common/Toolbar';

export const ExpensesView: React.FC = () => {
  const { expenses, openNewModal } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredExpenses = expenses.filter(
    e =>
      e.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.vendorName && e.vendorName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalExpense = expenses.reduce((acc, e) => acc + e.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <CreditCard className="text-[#800000] dark:text-amber-400" size={20} />
            <span>Factory & Operational Expenses</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Track raw spice vendor purchases, factory electric power, freight & machinery upkeep
          </p>
        </div>
        <Toolbar
          newButtonLabel="Log New Expense"
          onNewClick={() => openNewModal('expense')}
          exportData={filteredExpenses}
          exportFilename="JM_ERP_Expenses"
        />
      </div>

      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500">Total Operational Expenditure</p>
          <h3 className="text-2xl font-black text-rose-600 dark:text-rose-400">
            {formatCurrency(totalExpense)}
          </h3>
        </div>
        <div className="relative w-72">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search Category, Vendor, Notes..."
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
                <th className="py-3 px-4 rounded-l-xl">Expense #</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Vendor / Paid To</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Payment Mode</th>
                <th className="py-3 px-4 rounded-r-xl text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredExpenses.map(e => (
                <tr key={e.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="py-3.5 px-4 font-bold text-[#800000] dark:text-amber-400">
                    {e.expenseNumber}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-100">
                    {e.category}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">{e.title}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">{e.vendorName || '-'}</td>
                  <td className="py-3.5 px-4 text-slate-500">{formatDate(e.createdAt)}</td>
                  <td className="py-3.5 px-4 text-slate-600">{e.paymentMode}</td>
                  <td className="py-3.5 px-4 font-black text-rose-600 dark:text-rose-400 text-right">
                    {formatCurrency(e.amount)}
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
