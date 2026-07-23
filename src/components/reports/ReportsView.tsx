/**
 * @license
 * Version 1.0.0
 * Jamavat Masala ERP - Reports & Analytics Engine
 */

import React from 'react';
import { FileBarChart, Download, Printer, PieChart as PieIcon, TrendingUp, IndianRupee } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/formatters';
import { exportToCSV } from '../../utils/exporter';
import { Toolbar } from '../common/Toolbar';
import { JamavatLogo } from '../../utils/logo';

export const ReportsView: React.FC = () => {
  const { orders, expenses, shops, products } = useApp();

  const totalSales = orders.reduce((acc, o) => acc + o.netTotal, 0);
  const totalExpense = expenses.reduce((acc, e) => acc + e.amount, 0);
  const totalOutstanding = shops.reduce((acc, s) => acc + s.outstandingAmount, 0);
  const netProfit = totalSales - totalExpense;

  const handleExportFullReport = () => {
    const summary = [
      { Metric: 'Total Gross Sales', Value: totalSales },
      { Metric: 'Total Operating Expenses', Value: totalExpense },
      { Metric: 'Net Operational Profit', Value: netProfit },
      { Metric: 'Total Dealer Outstanding', Value: totalOutstanding }
    ];
    exportToCSV('Jamavat_Masala_Executive_Financial_Report', summary);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <JamavatLogo size="sm" className="h-10 w-auto shrink-0" />
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <FileBarChart className="text-[#800000] dark:text-amber-400" size={18} />
              <span>Jamavat Masala Reports & Financial Analytics</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Comprehensive P&L analysis, GST sales summaries, product turnover & customer ledger statements
            </p>
          </div>
        </div>
        <button
          onClick={handleExportFullReport}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#800000] text-amber-300 font-bold text-xs shadow-md"
        >
          <Download size={16} />
          <span>Export Financial CSV</span>
        </button>
      </div>

      {/* Summary KPI Financial Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Gross Sales Revenue</p>
          <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-1">
            {formatCurrency(totalSales)}
          </h3>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Factory Expenses</p>
          <h3 className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
            {formatCurrency(totalExpense)}
          </h3>
        </div>

        <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 shadow-sm">
          <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300">Estimated Net Profit</p>
          <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {formatCurrency(netProfit)}
          </h3>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Dealers Credit Outstanding</p>
          <h3 className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {formatCurrency(totalOutstanding)}
          </h3>
        </div>
      </div>

      {/* Report Module Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center justify-between">
            <span>Sales & GST Tax Report</span>
            <button onClick={() => exportToCSV('GST_Sales_Report', orders)} className="text-xs text-[#800000] dark:text-amber-400 font-bold hover:underline">
              Download CSV
            </button>
          </h3>
          <p className="text-xs text-slate-500">Itemized breakdown of all orders, CGST, SGST, taxable totals & invoice numbers.</p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center justify-between">
            <span>Customer Outstanding Aging Report</span>
            <button onClick={() => exportToCSV('Shops_Outstanding_Report', shops)} className="text-xs text-[#800000] dark:text-amber-400 font-bold hover:underline">
              Download CSV
            </button>
          </h3>
          <p className="text-xs text-slate-500">Shop-wise ledger outstanding balances, phone numbers & credit limits.</p>
        </div>
      </div>
    </div>
  );
};
