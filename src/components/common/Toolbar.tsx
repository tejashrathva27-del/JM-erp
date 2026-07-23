/**
 * @license
 * Version 1.0.0
 * Jamavat Masala ERP - Quick Toolbar Actions Component
 */

import React from 'react';
import { Filter, RefreshCw, Download, Plus } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { exportToCSV } from '../../utils/exporter';

interface ToolbarProps {
  onFilterClick?: () => void;
  onRefreshClick?: () => void;
  exportData?: object[];
  exportFilename?: string;
  newButtonLabel?: string;
  onNewClick?: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  onFilterClick,
  onRefreshClick,
  exportData,
  exportFilename = 'JM_ERP_Data',
  newButtonLabel = 'New Record',
  onNewClick
}) => {
  const { openNewModal, activeModule } = useApp();

  const handleDefaultNew = () => {
    if (onNewClick) {
      onNewClick();
      return;
    }

    switch (activeModule) {
      case 'employees': openNewModal('employee'); break;
      case 'shops': openNewModal('shop'); break;
      case 'products': openNewModal('product'); break;
      case 'orders': openNewModal('order'); break;
      case 'payments': openNewModal('payment'); break;
      case 'expenses': openNewModal('expense'); break;
      case 'production': openNewModal('production'); break;
      default: openNewModal('order'); break;
    }
  };

  const handleExport = () => {
    if (exportData && exportData.length) {
      exportToCSV(exportFilename, exportData);
    } else {
      alert('Export feature ready. No rows selected or present.');
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-end gap-2.5 my-2">
      {/* Filter Button */}
      <button
        onClick={onFilterClick}
        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold transition-all shadow-xs"
      >
        <Filter size={14} className="text-slate-500 dark:text-slate-400" />
        <span>Filter</span>
      </button>

      {/* Refresh Button */}
      <button
        onClick={onRefreshClick || (() => window.location.reload())}
        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold transition-all shadow-xs"
      >
        <RefreshCw size={14} className="text-slate-500 dark:text-slate-400" />
        <span>Refresh</span>
      </button>

      {/* Export CSV Button */}
      <button
        onClick={handleExport}
        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold transition-all shadow-xs"
      >
        <Download size={14} className="text-slate-500 dark:text-slate-400" />
        <span>Export</span>
      </button>

      {/* + New Button */}
      <button
        onClick={handleDefaultNew}
        className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#800000] hover:bg-[#660000] text-amber-300 hover:text-white text-xs font-bold transition-all shadow-md active:scale-95"
      >
        <Plus size={16} />
        <span>{newButtonLabel}</span>
      </button>
    </div>
  );
};
