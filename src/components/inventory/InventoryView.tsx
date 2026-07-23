/**
 * @license
 * Version 1.0.0
 * Jamavat Masala ERP - Inventory & Finished Stock Module
 */

import React from 'react';
import { Boxes, AlertTriangle, IndianRupee, Package, ArrowUpRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/formatters';
import { Toolbar } from '../common/Toolbar';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const InventoryView: React.FC = () => {
  const { products, openNewModal } = useApp();

  const totalStockUnits = products.reduce((acc, p) => acc + p.currentStock, 0);
  const totalStockValuationDealer = products.reduce((acc, p) => acc + (p.currentStock * p.dealerPrice), 0);
  const totalStockValuationCost = products.reduce((acc, p) => acc + (p.currentStock * p.purchasePrice), 0);
  const lowStockProducts = products.filter(p => p.currentStock <= p.reorderLevel);

  // Stock Distribution Chart Data
  const chartData = products.map(p => ({
    name: p.name.replace('Jamavat ', '').substring(0, 15),
    stock: p.currentStock,
    reorder: p.reorderLevel
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Boxes className="text-[#800000] dark:text-amber-400" size={20} />
            <span>Finished Goods Inventory Valuation</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Realtime stock balances, warehouse valuation & reorder triggers
          </p>
        </div>
        <Toolbar exportData={products} exportFilename="JM_ERP_Inventory" />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Total Units in Stock</p>
          <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-1">
            {totalStockUnits.toLocaleString('en-IN')} units
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">Across {products.length} catalog items</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Warehouse Stock Value (Dealer Rate)</p>
          <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {formatCurrency(totalStockValuationDealer)}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">Cost basis: {formatCurrency(totalStockValuationCost)}</p>
        </div>

        <div className="p-5 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 shadow-sm">
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
            <AlertTriangle size={18} />
            <span className="text-xs font-bold uppercase">Low Stock Trigger Alerts</span>
          </div>
          <h3 className="text-2xl font-black text-rose-700 dark:text-rose-300 mt-1">
            {lowStockProducts.length} Items Below Reorder
          </h3>
        </div>
      </div>

      {/* Stock Balance Chart */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4">Stock Balance Comparison</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
              <Bar dataKey="stock" name="Current Stock" fill="#800000" radius={[6, 6, 0, 0]} />
              <Bar dataKey="reorder" name="Reorder Trigger" fill="#d4af37" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
