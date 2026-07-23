/**
 * @license
 * Version 1.0.0
 * Jamavat Masala ERP - Product Details View Modal
 */

import React from 'react';
import { X, Package, Tag, Barcode, FileText, IndianRupee, Layers, CheckCircle2, AlertTriangle, Edit3 } from 'lucide-react';
import { Product, ProductVariant } from '../../types/erp';
import { formatCurrency, getStatusBadgeClass } from '../../utils/formatters';
import { JamavatLogo } from '../../utils/logo';

interface ProductViewModalProps {
  product: Product;
  onClose: () => void;
  onEdit: (product: Product) => void;
}

export const ProductViewModal: React.FC<ProductViewModalProps> = ({ product, onClose, onEdit }) => {
  const variants: ProductVariant[] = product.variants && product.variants.length > 0
    ? product.variants
    : [
        {
          id: 'default-v',
          weight: product.unit || 'Standard',
          sku: product.sku || product.code,
          barcode: product.barcode,
          manufacturingPrice: product.purchasePrice,
          sellingPrice: product.dealerPrice,
          mrp: product.mrp,
          gstRate: product.gstRate || 5,
          stockQuantity: product.currentStock
        }
      ];

  const totalVariantStock = variants.reduce((acc, v) => acc + (v.stockQuantity || 0), 0);
  const totalMfgValuation = variants.reduce((acc, v) => acc + ((v.manufacturingPrice || 0) * (v.stockQuantity || 0)), 0);
  const totalSellingValuation = variants.reduce((acc, v) => acc + ((v.sellingPrice || 0) * (v.stockQuantity || 0)), 0);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 max-w-3xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl my-auto relative max-h-[92vh] overflow-y-auto space-y-5">
        
        {/* Header Bar */}
        <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <JamavatLogo size="sm" className="h-10 w-auto shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-[#800000] dark:text-amber-400 text-xs tracking-wide">{product.code}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getStatusBadgeClass(product.status)}`}>
                  {product.status}
                </span>
              </div>
              <h2 className="text-lg font-black text-slate-800 dark:text-white leading-tight mt-0.5">
                {product.name}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 flex items-center justify-center font-bold text-sm shrink-0"
          >
            ✕
          </button>
        </div>

        {/* Product Spec Overview Card */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/60">
          <div className="flex items-center gap-3 sm:col-span-1">
            <img
              src={product.imageUrl || 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=200'}
              alt={product.name}
              className="w-20 h-20 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shrink-0 shadow-xs"
            />
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Category</span>
              <p className="font-extrabold text-slate-800 dark:text-slate-100 text-xs">{product.categoryName}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">{product.description || 'Pure authentic Jamavat spice blend.'}</p>
            </div>
          </div>

          <div className="sm:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
            <div>
              <span className="text-[10px] font-medium text-slate-400 block">SKU Code</span>
              <span className="font-bold text-slate-800 dark:text-slate-100 font-mono">{product.sku || product.code}</span>
            </div>
            <div>
              <span className="text-[10px] font-medium text-slate-400 block">Barcode</span>
              <span className="font-bold text-slate-800 dark:text-slate-100 font-mono">{product.barcode || 'N/A'}</span>
            </div>
            <div>
              <span className="text-[10px] font-medium text-slate-400 block">HSN Code</span>
              <span className="font-bold text-amber-700 dark:text-amber-400 font-mono">{product.hsnCode || '0910.30'}</span>
            </div>
            <div>
              <span className="text-[10px] font-medium text-slate-400 block">Total Stock</span>
              <span className="font-black text-slate-800 dark:text-white text-sm">{totalVariantStock} units</span>
            </div>
            <div>
              <span className="text-[10px] font-medium text-slate-400 block">Mfg Valuation</span>
              <span className="font-bold text-emerald-700 dark:text-emerald-400">{formatCurrency(totalMfgValuation)}</span>
            </div>
            <div>
              <span className="text-[10px] font-medium text-slate-400 block">Sales Valuation</span>
              <span className="font-bold text-[#800000] dark:text-amber-300">{formatCurrency(totalSellingValuation)}</span>
            </div>
          </div>
        </div>

        {/* Variants Breakdown Table */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Layers size={14} className="text-[#800000] dark:text-amber-400" />
              <span>Weight & Size Variants ({variants.length})</span>
            </h3>
            <span className="text-[11px] text-slate-400">Profit = Selling Price - Mfg Price</span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#800000] text-white font-bold">
                  <th className="py-2.5 px-3">Weight / Size</th>
                  <th className="py-2.5 px-3">Mfg Price</th>
                  <th className="py-2.5 px-3">Selling Price</th>
                  <th className="py-2.5 px-3">MRP</th>
                  <th className="py-2.5 px-3">Profit Amount</th>
                  <th className="py-2.5 px-3">Profit Margin %</th>
                  <th className="py-2.5 px-3">GST Rate</th>
                  <th className="py-2.5 px-3 text-right">Stock Qty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                {variants.map((v, i) => {
                  const mfg = v.manufacturingPrice || 0;
                  const sell = v.sellingPrice || 0;
                  const profitAmt = sell - mfg;
                  const profitPct = mfg > 0 ? ((profitAmt / mfg) * 100).toFixed(1) : '0.0';

                  return (
                    <tr key={v.id || i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-2.5 px-3 font-black text-amber-800 dark:text-amber-300">
                        {v.weight}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-600 dark:text-slate-300">
                        {formatCurrency(mfg)}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-800 dark:text-slate-100">
                        {formatCurrency(sell)}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-400 line-through">
                        {formatCurrency(v.mrp || 0)}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-emerald-600 dark:text-emerald-400">
                        +{formatCurrency(profitAmt)}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-extrabold text-[11px] border border-emerald-200/50 dark:border-emerald-800/40">
                          {profitPct}%
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-500">
                        {v.gstRate || product.gstRate || 5}% GST
                      </td>
                      <td className="py-2.5 px-3 text-right font-black text-slate-800 dark:text-white">
                        <span className={`px-2 py-0.5 rounded-lg ${v.stockQuantity <= (product.reorderLevel || 50) ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'}`}>
                          {v.stockQuantity} units
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-200"
          >
            Close Window
          </button>
          <button
            onClick={() => {
              onClose();
              onEdit(product);
            }}
            className="px-5 py-2 rounded-xl bg-[#800000] hover:bg-[#660000] text-amber-300 font-bold text-xs flex items-center gap-1.5 shadow-md"
          >
            <Edit3 size={14} />
            <span>Edit Product & Variants</span>
          </button>
        </div>

      </div>
    </div>
  );
};
