/**
 * @license
 * Version 1.0.0
 * Jamavat Masala ERP - Factory Production Batch Manufacturing Module
 */

import React, { useState } from 'react';
import { Factory, Plus, CheckCircle2, Clock, Play, Pause, ArrowRight, ShieldCheck, Cpu } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ProductionBatch } from '../../types/erp';
import { formatDate, getStatusBadgeClass } from '../../utils/formatters';
import { Toolbar } from '../common/Toolbar';

export const ProductionView: React.FC = () => {
  const { productionBatches, updateBatchStage, openNewModal } = useApp();

  const stages: ProductionBatch['grindingStage'][] = [
    'Raw Inspection',
    'Roasting',
    'Grinding',
    'Sifting',
    'Packaging',
    'Quality Passed'
  ];

  return (
    <div className="space-y-6">
      {/* Header & Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Factory className="text-[#800000] dark:text-amber-400" size={20} />
            <span>Factory Production & Grinding Batches</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Track raw spice cleaning, roasting, cold pulverizer grinding & nitrogen pouch packaging
          </p>
        </div>
        <Toolbar
          newButtonLabel="New Manufacturing Batch"
          onNewClick={() => openNewModal('production')}
          exportData={productionBatches}
          exportFilename="JM_ERP_Production"
        />
      </div>

      {/* Production Batches List Cards */}
      <div className="space-y-4">
        {productionBatches.map(batch => (
          <div
            key={batch.id}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 hover:border-[#800000]/40 transition-all"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#800000] text-amber-300 flex items-center justify-center font-black text-xs shrink-0 shadow-sm">
                  {batch.batchNumber.split('-')[2] || 'BAT'}
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-800 dark:text-white">
                    {batch.productName}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Batch: <strong className="text-[#800000] dark:text-amber-400">{batch.batchNumber}</strong> • Raw: {batch.rawSpiceName} ({batch.rawQuantityKg} kg)
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusBadgeClass(batch.status)}`}>
                  {batch.status}
                </span>
              </div>
            </div>

            {/* Manufacturing Pipeline Stages Stepper */}
            <div>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                Manufacturing Workflow Progress:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                {stages.map((stg, idx) => {
                  const currentIdx = stages.indexOf(batch.grindingStage);
                  const isCompleted = idx < currentIdx || batch.status === 'Completed';
                  const isCurrent = idx === currentIdx && batch.status !== 'Completed';

                  return (
                    <button
                      key={stg}
                      onClick={() => {
                        const newStatus = idx === stages.length - 1 ? 'Completed' : 'In Progress';
                        updateBatchStage(batch.id, stg, newStatus);
                      }}
                      className={`p-2.5 rounded-xl border text-left transition-all relative ${
                        isCompleted
                          ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 text-emerald-800 dark:text-emerald-300'
                          : isCurrent
                          ? 'bg-amber-100 dark:bg-amber-950/40 border-amber-400 text-[#800000] dark:text-amber-300 font-bold shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-extrabold uppercase">Step 0{idx + 1}</span>
                        {isCompleted && <CheckCircle2 size={12} className="text-emerald-600" />}
                      </div>
                      <p className="text-[11px] font-bold truncate">{stg}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Batch Info Footer */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-3 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
              <div>
                <span>Plant Operator: <strong>{batch.operatorName}</strong></span>
              </div>
              <div>
                <span>Expected Yield: <strong>{batch.expectedYieldKg} kg</strong></span>
              </div>
              <div>
                <span>Started Date: <strong>{formatDate(batch.startDate)}</strong></span>
              </div>
              {batch.notes && (
                <div className="w-full text-[11px] text-slate-600 dark:text-slate-300 italic border-t border-slate-200 dark:border-slate-700 pt-1 mt-1">
                  Note: {batch.notes}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
