/**
 * @license
 * Version 1.0.0
 * Jamavat Masala ERP - Delete Product Soft Delete Confirmation Modal
 */

import React from 'react';
import { AlertTriangle, Trash2, X, ShieldAlert } from 'lucide-react';
import { Product } from '../../types/erp';

interface DeleteProductModalProps {
  product: Product;
  onClose: () => void;
  onConfirm: (productId: string) => void;
}

export const DeleteProductModal: React.FC<DeleteProductModalProps> = ({
  product,
  onClose,
  onConfirm
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 relative animate-in fade-in zoom-in-95 duration-150">
        
        {/* Top Warning Icon */}
        <div className="flex items-center justify-between">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <AlertTriangle size={24} />
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 flex items-center justify-center font-bold text-sm"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div>
          <h3 className="text-base font-black text-slate-800 dark:text-white">
            Confirm Soft Delete
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Are you sure you want to delete <span className="font-bold text-slate-800 dark:text-slate-200">{product.name}</span> ({product.code})?
          </p>
        </div>

        {/* Product Snapshot Card */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/60 flex items-center gap-3">
          <img
            src={product.imageUrl || 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=100'}
            alt={product.name}
            className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
          />
          <div className="min-w-0 flex-1 text-xs">
            <p className="font-bold text-slate-800 dark:text-slate-100 truncate">{product.name}</p>
            <p className="text-[11px] text-slate-500">{product.categoryName} • SKU: {product.sku || product.code}</p>
          </div>
        </div>

        {/* Soft Delete Safeguard Info */}
        <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200/60 dark:border-amber-800/40 text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-2">
          <ShieldAlert size={16} className="shrink-0 mt-0.5" />
          <span>
            <strong>Soft Delete Safety:</strong> This product will be hidden from catalog selections. All historic sales orders, invoice records, and tax filings will remain unaffected.
          </span>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={onClose}
            className="py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm(product.id);
              onClose();
            }}
            className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-rose-600/20 transition-colors"
          >
            <Trash2 size={16} />
            <span>Confirm Delete</span>
          </button>
        </div>

      </div>
    </div>
  );
};
