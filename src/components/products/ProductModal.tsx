/**
 * @license
 * Version 1.0.0
 * Jamavat Masala ERP - Add / Edit Product Modal with Multiple Weight Variants
 */

import React, { useState } from 'react';
import { X, Package, Plus, Trash2, Layers, IndianRupee, Image, Sparkles, Check, Info } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Product, ProductVariant, ProductStatus } from '../../types/erp';
import { formatCurrency } from '../../utils/formatters';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
}

const PRESET_WEIGHTS = ['10 g', '20 g', '50 g', '100 g', '200 g', '500 g', '1 kg', '5 kg', '10 kg'];

const SAMPLE_IMAGES = [
  'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1532336414038-cf19250c5757?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1509358271058-acd05cc93898?w=300&auto=format&fit=crop&q=80'
];

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  productToEdit
}) => {
  const { categories, products, addProduct, updateProduct } = useApp();

  // Next sequence auto ID
  const nextSeq = Math.max(...products.map(p => {
    const num = parseInt(p.code.replace('JM-MSL-', ''));
    return isNaN(num) ? 100 : num;
  }), 100) + 1;

  // Form State
  const [name, setName] = useState(productToEdit?.name || '');
  const [categoryId, setCategoryId] = useState(productToEdit?.categoryId || categories[0]?.id || '');
  const [sku, setSku] = useState(productToEdit?.sku || (productToEdit ? '' : `JM-SKU-${nextSeq}`));
  const [barcode, setBarcode] = useState(productToEdit?.barcode || `890600100${nextSeq}`);
  const [hsnCode, setHsnCode] = useState(productToEdit?.hsnCode || '0910.30');
  const [description, setDescription] = useState(productToEdit?.description || '');
  const [status, setStatus] = useState<ProductStatus>(productToEdit?.status || 'Active');
  const [imageUrl, setImageUrl] = useState(productToEdit?.imageUrl || SAMPLE_IMAGES[0]);
  const [reorderLevel, setReorderLevel] = useState(productToEdit?.reorderLevel || 100);

  // Multiple Pack Sizes State
  const initialVariants: ProductVariant[] = productToEdit?.variants && productToEdit.variants.length > 0
    ? productToEdit.variants
    : [
        {
          id: 'v-1',
          weight: '50 g',
          sku: `${sku || 'JM-SKU'}-50G`,
          barcode: `${barcode || '890600'}1`,
          manufacturingPrice: productToEdit?.purchasePrice || 15,
          sellingPrice: productToEdit?.dealerPrice || 25,
          mrp: productToEdit?.mrp || 30,
          gstRate: productToEdit?.gstRate || 5,
          stockQuantity: productToEdit?.currentStock || 200
        },
        {
          id: 'v-2',
          weight: '100 g',
          sku: `${sku || 'JM-SKU'}-100G`,
          barcode: `${barcode || '890600'}2`,
          manufacturingPrice: productToEdit ? Math.round(productToEdit.purchasePrice * 1.8) : 28,
          sellingPrice: productToEdit ? Math.round(productToEdit.dealerPrice * 1.8) : 48,
          mrp: productToEdit ? Math.round(productToEdit.mrp * 1.8) : 55,
          gstRate: productToEdit?.gstRate || 5,
          stockQuantity: productToEdit ? Math.round(productToEdit.currentStock * 0.8) : 300
        }
      ];

  const [variants, setVariants] = useState<ProductVariant[]>(initialVariants);
  const [customWeightInput, setCustomWeightInput] = useState('');

  if (!isOpen) return null;

  // Add a new pack size variant
  const handleAddWeightVariant = (selectedWeight: string) => {
    if (!selectedWeight) return;
    if (variants.some(v => v.weight.toLowerCase() === selectedWeight.toLowerCase())) {
      alert(`Pack size "${selectedWeight}" already exists for this product.`);
      return;
    }

    const newV: ProductVariant = {
      id: 'v-' + Date.now(),
      weight: selectedWeight,
      sku: `${sku || 'JM-SKU'}-${selectedWeight.replace(/\s+/g, '').toUpperCase()}`,
      barcode: `${barcode || '89060'}${variants.length + 1}`,
      manufacturingPrice: 20,
      sellingPrice: 32,
      mrp: 38,
      gstRate: 5,
      stockQuantity: 100
    };

    setVariants(prev => [...prev, newV]);
    setCustomWeightInput('');
  };

  const handleRemoveVariant = (id: string) => {
    if (variants.length <= 1) {
      alert('Product must have at least one weight/size variant.');
      return;
    }
    setVariants(prev => prev.filter(v => v.id !== id));
  };

  const handleUpdateVariant = (id: string, field: keyof ProductVariant, val: any) => {
    setVariants(prev => prev.map(v => {
      if (v.id === id) {
        return { ...v, [field]: val };
      }
      return v;
    }));
  };

  // Image Upload / URL change handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setImageUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter product name.');
      return;
    }

    if (variants.length === 0) {
      alert('Please add at least one weight/size variant.');
      return;
    }

    const categoryObj = categories.find(c => c.id === categoryId) || categories[0];
    const categoryName = categoryObj ? categoryObj.name : 'Ground Masalas';

    // Primary default pricing & stock from first variant
    const primaryV = variants[0];
    const totalCurrentStock = variants.reduce((acc, v) => acc + (Number(v.stockQuantity) || 0), 0);
    const weightSummary = variants.map(v => v.weight).join(', ');

    const productPayload = {
      code: productToEdit ? productToEdit.code : `JM-MSL-${nextSeq}`,
      name: name.trim(),
      categoryId: categoryObj?.id || categoryId,
      categoryName,
      sku: sku.trim() || `JM-SKU-${nextSeq}`,
      barcode: barcode.trim(),
      hsnCode: hsnCode.trim() || '0910.30',
      unit: weightSummary,
      mrp: primaryV.mrp,
      dealerPrice: primaryV.sellingPrice,
      purchasePrice: primaryV.manufacturingPrice,
      gstRate: primaryV.gstRate || 5,
      openingStock: totalCurrentStock,
      currentStock: totalCurrentStock,
      reorderLevel: Number(reorderLevel) || 100,
      imageUrl,
      description: description.trim() || `Pure authentic ${name} manufactured by Jamavat Masala.`,
      status,
      variants,
      isDeleted: false
    };

    if (productToEdit) {
      updateProduct(productToEdit.id, productPayload);
    } else {
      addProduct({
        ...productPayload,
        createdBy: 'MD Tejas Rathva'
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-6 max-w-4xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl my-auto relative max-h-[92vh] overflow-y-auto space-y-5">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#800000] text-amber-300 flex items-center justify-center font-black text-sm shadow-sm shrink-0">
              <Package size={20} />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-800 dark:text-white">
                {productToEdit ? `Edit Product Master - ${productToEdit.code}` : 'Add New Product Master'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Manage spice SKUs, multiple weight pack sizes, manufacturing prices, selling rates & GST
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 flex items-center justify-center font-bold text-sm shrink-0"
          >
            ✕
          </button>
        </div>

        {/* Product Master Form */}
        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          
          {/* Section 1: Basic Information */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-slate-200/60 dark:border-slate-700/40">
              <span className="font-extrabold text-[#800000] dark:text-amber-400 text-xs tracking-wider uppercase">
                1. Product Identity & Metadata
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Product Code: {productToEdit ? productToEdit.code : `JM-MSL-${nextSeq}`}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Product Image Selection */}
              <div className="sm:col-span-1 space-y-2">
                <label className="block font-bold text-slate-700 dark:text-slate-200">
                  Product Image
                </label>
                <div className="flex flex-col items-center gap-2">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="w-24 h-24 rounded-2xl object-cover border-2 border-[#800000]/20 shadow-sm"
                  />
                  <div className="w-full flex items-center justify-center gap-2">
                    <label className="px-3 py-1.5 rounded-xl bg-[#800000] hover:bg-[#660000] text-amber-300 font-bold text-[11px] cursor-pointer shadow-xs">
                      Upload Image
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  {/* Preset Quick Swatches */}
                  <div className="flex items-center gap-1.5 pt-1 overflow-x-auto w-full justify-center">
                    {SAMPLE_IMAGES.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setImageUrl(img)}
                        className={`w-6 h-6 rounded-lg overflow-hidden border ${imageUrl === img ? 'border-amber-400 ring-2 ring-[#800000]' : 'border-slate-300'}`}
                      >
                        <img src={img} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Product Name & Category */}
              <div className="sm:col-span-2 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                      Product Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="e.g. Jamavat Reshampatti Chilli Powder"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-[#800000]/30"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                      Category <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={categoryId}
                      onChange={e => setCategoryId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-[#800000]/30"
                    >
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">SKU</label>
                    <input
                      type="text"
                      value={sku}
                      onChange={e => setSku(e.target.value)}
                      placeholder="e.g. JM-CHILLI-02"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Barcode</label>
                    <input
                      type="text"
                      value={barcode}
                      onChange={e => setBarcode(e.target.value)}
                      placeholder="e.g. 8906001001025"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">HSN Code</label>
                    <input
                      type="text"
                      value={hsnCode}
                      onChange={e => setHsnCode(e.target.value)}
                      placeholder="e.g. 0910.30"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Status</label>
                    <select
                      value={status}
                      onChange={e => setStatus(e.target.value as ProductStatus)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-bold"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Out of Stock">Out of Stock</option>
                      <option value="Discontinued">Discontinued</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Reorder Level (Alert)</label>
                    <input
                      type="number"
                      min="0"
                      value={reorderLevel}
                      onChange={e => setReorderLevel(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-bold"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Description / Notes</label>
              <textarea
                rows={2}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Product characteristics, grinding details, origin notes..."
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white"
              />
            </div>
          </div>

          {/* Section 2: Weight / Size Pack Variants Manager */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200/60 dark:border-slate-700/40">
              <div>
                <span className="font-extrabold text-[#800000] dark:text-amber-400 text-xs tracking-wider uppercase flex items-center gap-1.5">
                  <Layers size={14} />
                  <span>2. Product Weight / Pack Size Variants ({variants.length})</span>
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Add multiple pack sizes. Each variant stores its own Manufacturing Price, Selling Price, MRP, GST & Stock.
                </p>
              </div>

              {/* Preset Buttons */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
                <span className="text-[10px] font-bold text-slate-400 mr-1 shrink-0">Add Size:</span>
                {PRESET_WEIGHTS.map(w => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => handleAddWeightVariant(w)}
                    className="px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-[10px] hover:bg-amber-100 hover:text-[#800000] dark:hover:bg-slate-700 transition-all shrink-0"
                  >
                    + {w}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Weight Adder Input */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Enter custom weight (e.g. 25 g, 250 g, 2 kg)..."
                value={customWeightInput}
                onChange={e => setCustomWeightInput(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold w-64"
              />
              <button
                type="button"
                onClick={() => handleAddWeightVariant(customWeightInput.trim())}
                className="px-3 py-1.5 rounded-xl bg-[#800000] text-amber-300 font-bold text-xs hover:bg-[#660000] shadow-xs"
              >
                + Add Custom Size
              </button>
            </div>

            {/* Variants Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <table className="w-full text-left text-xs min-w-[700px]">
                <thead>
                  <tr className="bg-[#800000] text-white font-bold">
                    <th className="py-2.5 px-3">Pack Size</th>
                    <th className="py-2.5 px-3">Mfg Price (₹)</th>
                    <th className="py-2.5 px-3">Selling Price (₹)</th>
                    <th className="py-2.5 px-3">MRP (₹)</th>
                    <th className="py-2.5 px-3">Profit & Margin %</th>
                    <th className="py-2.5 px-3">GST %</th>
                    <th className="py-2.5 px-3">Stock Qty</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {variants.map((v, index) => {
                    const mfg = Number(v.manufacturingPrice) || 0;
                    const sell = Number(v.sellingPrice) || 0;
                    const profitAmt = sell - mfg;
                    const profitPct = mfg > 0 ? ((profitAmt / mfg) * 100).toFixed(1) : '0.0';

                    return (
                      <tr key={v.id || index} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-2 px-3 font-extrabold text-[#800000] dark:text-amber-400">
                          <input
                            type="text"
                            value={v.weight}
                            onChange={e => handleUpdateVariant(v.id, 'weight', e.target.value)}
                            className="w-20 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-black text-xs"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="number"
                            min="0"
                            step="0.5"
                            value={v.manufacturingPrice}
                            onChange={e => handleUpdateVariant(v.id, 'manufacturingPrice', Number(e.target.value))}
                            className="w-20 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="number"
                            min="0"
                            step="0.5"
                            value={v.sellingPrice}
                            onChange={e => handleUpdateVariant(v.id, 'sellingPrice', Number(e.target.value))}
                            className="w-20 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="number"
                            min="0"
                            step="0.5"
                            value={v.mrp}
                            onChange={e => handleUpdateVariant(v.id, 'mrp', Number(e.target.value))}
                            className="w-20 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                          />
                        </td>
                        <td className="py-2 px-3 font-bold">
                          <div className="flex flex-col">
                            <span className="text-emerald-700 dark:text-emerald-400 font-black">
                              +{formatCurrency(profitAmt)}
                            </span>
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-300 font-extrabold">
                              ({profitPct}% margin)
                            </span>
                          </div>
                        </td>
                        <td className="py-2 px-3">
                          <select
                            value={v.gstRate || 5}
                            onChange={e => handleUpdateVariant(v.id, 'gstRate', Number(e.target.value))}
                            className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                          >
                            <option value={5}>5%</option>
                            <option value={12}>12%</option>
                            <option value={18}>18%</option>
                          </select>
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="number"
                            min="0"
                            value={v.stockQuantity}
                            onChange={e => handleUpdateVariant(v.id, 'stockQuantity', Number(e.target.value))}
                            className="w-20 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                          />
                        </td>
                        <td className="py-2 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveVariant(v.id)}
                            className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/60 dark:text-rose-400"
                            title="Remove Variant"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Form Bottom Action Bar */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#800000] hover:bg-[#660000] text-amber-300 font-extrabold text-xs shadow-lg shadow-[#800000]/20 flex items-center gap-2"
            >
              <Check size={16} />
              <span>{productToEdit ? 'Save Product Changes' : 'Create Product Master'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
