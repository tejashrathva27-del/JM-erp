/**
 * @license
 * Version 1.0.0
 * Jamavat Masala ERP - Complete Product Management Module
 */

import React, { useState } from 'react';
import {
  Package,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  Edit3,
  Trash2,
  Eye,
  Boxes,
  Tag,
  IndianRupee,
  Layers,
  FileSpreadsheet,
  Printer,
  TrendingUp,
  XCircle,
  CheckCircle,
  PlusCircle,
  MinusCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Product, ProductStatus } from '../../types/erp';
import { formatCurrency, getStatusBadgeClass } from '../../utils/formatters';
import { Toolbar } from '../common/Toolbar';
import { JamavatLogo, JAMAVAT_LOGO_DATA_URL } from '../../utils/logo';
import { ProductModal } from './ProductModal';
import { ProductViewModal } from './ProductViewModal';
import { DeleteProductModal } from './DeleteProductModal';
import { exportToCSV } from '../../utils/exporter';

export const ProductsView: React.FC = () => {
  const { products, categories, deleteProduct, adjustStock, openNewModal } = useApp();

  // Active non-deleted products
  const activeProductsList = products.filter(p => !p.isDeleted);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedWeight, setSelectedWeight] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  // Modals state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  // Quick Stock Adjustment Modal
  const [stockModalProduct, setStockModalProduct] = useState<Product | null>(null);
  const [stockDelta, setStockDelta] = useState<number>(50);

  // Dashboard Cards Metrics
  const totalProducts = activeProductsList.length;
  const activeProducts = activeProductsList.filter(p => p.status === 'Active').length;
  const outOfStockCount = activeProductsList.filter(
    p => p.currentStock === 0 || p.status === 'Out of Stock'
  ).length;
  const lowStockCount = activeProductsList.filter(
    p => p.currentStock > 0 && p.currentStock <= p.reorderLevel
  ).length;

  const totalMfgValue = activeProductsList.reduce((acc, p) => {
    if (p.variants && p.variants.length > 0) {
      return acc + p.variants.reduce((vAcc, v) => vAcc + ((v.manufacturingPrice || 0) * (v.stockQuantity || 0)), 0);
    }
    return acc + ((p.purchasePrice || 0) * (p.currentStock || 0));
  }, 0);

  const totalSellingValue = activeProductsList.reduce((acc, p) => {
    if (p.variants && p.variants.length > 0) {
      return acc + p.variants.reduce((vAcc, v) => vAcc + ((v.sellingPrice || 0) * (v.stockQuantity || 0)), 0);
    }
    return acc + ((p.dealerPrice || 0) * (p.currentStock || 0));
  }, 0);

  // Filtered Products
  const filteredProducts = activeProductsList.filter(p => {
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !term ||
      p.name.toLowerCase().includes(term) ||
      p.code.toLowerCase().includes(term) ||
      (p.sku && p.sku.toLowerCase().includes(term)) ||
      (p.barcode && p.barcode.toLowerCase().includes(term)) ||
      p.categoryName.toLowerCase().includes(term);

    const matchesCategory =
      selectedCategory === 'All' ||
      p.categoryId === selectedCategory ||
      p.categoryName === selectedCategory;

    const matchesWeight =
      selectedWeight === 'All' ||
      (p.unit && p.unit.toLowerCase().includes(selectedWeight.toLowerCase())) ||
      (p.variants && p.variants.some(v => v.weight.toLowerCase().includes(selectedWeight.toLowerCase())));

    const matchesStatus = selectedStatus === 'All' || p.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesWeight && matchesStatus;
  });

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setIsProductModalOpen(true);
  };

  const handleOpenEditModal = (p: Product) => {
    setEditingProduct(p);
    setIsProductModalOpen(true);
  };

  const handleApplyStockAdjustment = (isAddition: boolean) => {
    if (!stockModalProduct) return;
    const delta = isAddition ? Math.abs(stockDelta) : -Math.abs(stockDelta);
    adjustStock(stockModalProduct.id, delta);
    setStockModalProduct(null);
  };

  // Export & Print
  const handleExportCSV = () => {
    const exportRows = filteredProducts.map(p => ({
      'Product Code': p.code,
      'Product Name': p.name,
      Category: p.categoryName,
      SKU: p.sku || p.code,
      Barcode: p.barcode || 'N/A',
      'HSN Code': p.hsnCode || '0910.30',
      'Available Sizes': p.unit,
      'Manufacturing Price (₹)': p.purchasePrice,
      'Selling Price (₹)': p.dealerPrice,
      'MRP (₹)': p.mrp,
      'GST %': p.gstRate,
      'Current Stock': p.currentStock,
      Status: p.status
    }));

    exportToCSV(`Jamavat_Masala_Products_${new Date().toISOString().slice(0, 10)}`, exportRows);
  };

  const handlePrintCatalog = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Jamavat Masala - Product Master Directory</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; color: #1e293b; }
          .header { text-align: center; border-bottom: 2px solid #800000; padding-bottom: 12px; margin-bottom: 20px; }
          .logo { height: 45px; width: auto; margin-bottom: 6px; }
          .title { font-size: 20px; font-weight: 900; color: #800000; letter-spacing: -0.5px; }
          .subtitle { font-size: 11px; color: #64748b; font-weight: 600; margin-top: 2px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px; }
          th { bg-color: #800000; background: #800000; color: #fff; text-align: left; padding: 8px 10px; font-weight: bold; }
          td { padding: 8px 10px; border-bottom: 1px solid #e2e8f0; }
          tr:nth-child(even) { background: #f8fafc; }
          .price { font-weight: bold; color: #0f172a; }
          .badge { padding: 3px 8px; border-radius: 6px; font-size: 10px; font-weight: bold; display: inline-block; }
          .active { background: #dcfce7; color: #15803d; }
          .out { background: #ffe4e6; color: #be123c; }
          .footer { margin-top: 25px; text-align: center; font-size: 10px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="${JAMAVAT_LOGO_DATA_URL}" alt="Jamavat Masala" class="logo" />
          <div class="title">JAMAVAT MASALA - PRODUCT MASTER CATALOG</div>
          <div class="subtitle">Official Manufacturing & Wholesale Price List • Generated on ${new Date().toLocaleDateString('en-IN')}</div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Product Code</th>
              <th>Product Name</th>
              <th>Category</th>
              <th>SKU / Barcode</th>
              <th>Pack Sizes</th>
              <th>Mfg Price</th>
              <th>Selling Price</th>
              <th>MRP</th>
              <th>GST</th>
              <th>Stock</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${filteredProducts.map(p => `
              <tr>
                <td style="font-weight: bold; color: #800000;">${p.code}</td>
                <td style="font-weight: bold;">${p.name}</td>
                <td>${p.categoryName}</td>
                <td style="font-family: monospace;">${p.sku || p.code}<br/><small style="color:#64748b">${p.barcode || ''}</small></td>
                <td style="font-weight: bold; color: #b45309;">${p.unit}</td>
                <td class="price">₹${p.purchasePrice}</td>
                <td class="price">₹${p.dealerPrice}</td>
                <td style="text-decoration: line-through; color: #94a3b8;">₹${p.mrp}</td>
                <td>${p.gstRate}%</td>
                <td style="font-weight: bold;">${p.currentStock} units</td>
                <td><span class="badge ${p.status === 'Active' ? 'active' : 'out'}">${p.status}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          Jamavat Masala ERP • An authentic spice enterprise by Jamavat Industries • Anand, Gujarat
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 300);
  };

  return (
    <div className="space-y-6 font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* Top Title & Quick Actions Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3.5">
          <JamavatLogo size="md" className="h-11 w-auto shrink-0 drop-shadow-sm" />
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
              <span>Jamavat Masala Product Master</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Spice Catalog, Multiple Weight Pack Sizes, Manufacturing Costs, Wholesale Dealer Rates & Inventory
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center gap-1.5 transition-all"
            title="Export Product Catalog to CSV"
          >
            <FileSpreadsheet size={15} className="text-emerald-600" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          <button
            onClick={handlePrintCatalog}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center gap-1.5 transition-all"
            title="Print Product Catalog"
          >
            <Printer size={15} className="text-[#800000] dark:text-amber-400" />
            <span className="hidden sm:inline">Print Catalog</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 rounded-xl bg-[#800000] hover:bg-[#660000] text-amber-300 font-black text-xs shadow-md flex items-center gap-1.5 transition-all"
          >
            <Plus size={16} />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Dashboard Stats Cards Grid (5 Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        
        {/* Card 1: Total Products */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Products</span>
            <div className="w-8 h-8 rounded-xl bg-[#800000]/10 text-[#800000] dark:text-amber-400 flex items-center justify-center font-bold">
              <Package size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-800 dark:text-white">{totalProducts}</p>
          <p className="text-[10px] font-semibold text-slate-400">All Master Catalog SKUs</p>
        </div>

        {/* Card 2: Active Products */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Products</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 flex items-center justify-center font-bold">
              <CheckCircle size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{activeProducts}</p>
          <p className="text-[10px] font-semibold text-slate-400">Available for Ordering</p>
        </div>

        {/* Card 3: Out of Stock */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Out of Stock</span>
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 flex items-center justify-center font-bold">
              <XCircle size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-rose-600 dark:text-rose-400">{outOfStockCount}</p>
          <p className="text-[10px] font-semibold text-slate-400">Requires Immediate Production</p>
        </div>

        {/* Card 4: Low Stock Alert */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Low Stock</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 flex items-center justify-center font-bold">
              <AlertTriangle size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-700 dark:text-amber-400">{lowStockCount}</p>
          <p className="text-[10px] font-semibold text-slate-400">Below Reorder Trigger Level</p>
        </div>

        {/* Card 5: Total Product Valuation */}
        <div className="col-span-2 lg:col-span-1 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Stock Value</span>
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 flex items-center justify-center font-bold">
              <TrendingUp size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-[#800000] dark:text-amber-400">{formatCurrency(totalSellingValue)}</p>
          <p className="text-[10px] font-semibold text-slate-400">Mfg Cost: {formatCurrency(totalMfgValue)}</p>
        </div>

      </div>

      {/* Search Bar & Multi-Filter Options */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Search Box */}
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Product Name, SKU, Barcode, Category..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-[#800000]/30"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-bold focus:outline-none focus:ring-2 focus:ring-[#800000]/30"
            >
              <option value="All">All Categories ({categories.length})</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Weight / Pack Size Filter */}
          <div>
            <select
              value={selectedWeight}
              onChange={e => setSelectedWeight(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-bold focus:outline-none focus:ring-2 focus:ring-[#800000]/30"
            >
              <option value="All">All Weight Pack Sizes</option>
              <option value="10g">10 g Pack</option>
              <option value="20g">20 g Pack</option>
              <option value="50g">50 g Pack</option>
              <option value="100g">100 g Pack</option>
              <option value="200g">200 g Pack</option>
              <option value="500g">500 g Pack</option>
              <option value="1kg">1 kg Pack</option>
              <option value="5kg">5 kg Bulk</option>
              <option value="10kg">10 kg Bulk</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-bold focus:outline-none focus:ring-2 focus:ring-[#800000]/30"
            >
              <option value="All">All Product Statuses</option>
              <option value="Active">Active Only</option>
              <option value="Inactive">Inactive</option>
              <option value="Out of Stock">Out of Stock</option>
              <option value="Discontinued">Discontinued</option>
            </select>
          </div>

        </div>

        {/* Quick Filter Reset Tag */}
        {(searchTerm || selectedCategory !== 'All' || selectedWeight !== 'All' || selectedStatus !== 'All') && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            <span className="text-slate-500 font-medium">
              Showing <strong className="text-slate-800 dark:text-white">{filteredProducts.length}</strong> of {totalProducts} products
            </span>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('All');
                setSelectedWeight('All');
                setSelectedStatus('All');
              }}
              className="text-[#800000] dark:text-amber-400 font-extrabold hover:underline"
            >
              Reset Filters ✕
            </button>
          </div>
        )}
      </div>

      {/* Products Table Container */}
      <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        
        {/* Mobile View: Stacked Responsive Cards */}
        <div className="grid grid-cols-1 gap-3.5 sm:hidden">
          {filteredProducts.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <Package size={32} className="mx-auto text-slate-300" />
              <p className="text-slate-500 font-bold text-xs">No Products match your filter criteria.</p>
            </div>
          ) : (
            filteredProducts.map(p => {
              const isLowStock = p.currentStock <= p.reorderLevel;

              return (
                <div
                  key={p.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-3"
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={p.imageUrl || 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=100'}
                      alt={p.name}
                      className="w-14 h-14 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shrink-0 shadow-xs"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-[#800000] dark:text-amber-400 text-xs">{p.code}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getStatusBadgeClass(p.status)}`}>
                          {p.status}
                        </span>
                      </div>
                      <h4 className="font-extrabold text-slate-800 dark:text-white text-xs mt-0.5 truncate">{p.name}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">{p.categoryName} • SKU: <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{p.sku || p.code}</span></p>
                    </div>
                  </div>

                  {/* Pack Sizes Badges */}
                  <div className="flex items-center gap-1 overflow-x-auto pb-1">
                    <span className="text-[10px] font-bold text-slate-400 shrink-0">Sizes:</span>
                    {p.variants && p.variants.length > 0 ? (
                      p.variants.map(v => (
                        <span key={v.id} className="px-2 py-0.5 rounded-md bg-amber-100/80 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 font-extrabold text-[10px] shrink-0">
                          {v.weight}
                        </span>
                      ))
                    ) : (
                      <span className="px-2 py-0.5 rounded-md bg-amber-100/80 text-amber-900 font-bold text-[10px] shrink-0">
                        {p.unit}
                      </span>
                    )}
                  </div>

                  {/* Prices & Stock */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/40 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Mfg Price</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">{formatCurrency(p.purchasePrice)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Selling Price</span>
                      <span className="font-black text-slate-800 dark:text-white">{formatCurrency(p.dealerPrice)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Current Stock</span>
                      <span className={`font-black ${isLowStock ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {p.currentStock} units
                      </span>
                    </div>
                  </div>

                  {/* Mobile Actions */}
                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/40 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setViewingProduct(p)}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1"
                      >
                        <Eye size={14} />
                        <span>View</span>
                      </button>
                      <button
                        onClick={() => handleOpenEditModal(p)}
                        className="px-2.5 py-1.5 rounded-xl bg-amber-400 text-[#800000] font-bold text-xs flex items-center gap-1"
                      >
                        <Edit3 size={14} />
                        <span>Edit</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setStockModalProduct(p)}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-800 text-amber-300 font-bold text-xs"
                      >
                        Stock +/-
                      </button>
                      <button
                        onClick={() => setDeletingProduct(p)}
                        className="p-1.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100"
                        title="Delete Product"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                </div>
              );
            })
          )}
        </div>

        {/* Desktop Table View */}
        <div className="overflow-x-auto hidden sm:block">
          <table className="w-full text-left border-collapse text-xs min-w-[950px]">
            <thead>
              <tr className="bg-[#800000] text-white font-bold">
                <th className="py-3 px-3.5 rounded-l-xl">Product ID</th>
                <th className="py-3 px-3.5">Product Details</th>
                <th className="py-3 px-3.5">Category</th>
                <th className="py-3 px-3.5">SKU / HSN</th>
                <th className="py-3 px-3.5">Pack Sizes</th>
                <th className="py-3 px-3.5">Mfg Price</th>
                <th className="py-3 px-3.5">Selling Price</th>
                <th className="py-3 px-3.5">GST</th>
                <th className="py-3 px-3.5">Current Stock</th>
                <th className="py-3 px-3.5">Status</th>
                <th className="py-3 px-3.5 rounded-r-xl text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400 font-semibold">
                    No products found matching search and filter criteria.
                  </td>
                </tr>
              ) : (
                filteredProducts.map(p => {
                  const isLowStock = p.currentStock <= p.reorderLevel;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      
                      {/* Product Code */}
                      <td className="py-3.5 px-3.5 font-extrabold text-[#800000] dark:text-amber-400">
                        {p.code}
                      </td>

                      {/* Product Name & Image */}
                      <td className="py-3.5 px-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.imageUrl || 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=100'}
                            alt={p.name}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0 shadow-2xs"
                          />
                          <div>
                            <p className="font-bold text-slate-800 dark:text-slate-100">{p.name}</p>
                            {p.barcode && <p className="text-[10px] text-slate-400 font-mono">Barcode: {p.barcode}</p>}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-3.5 font-semibold text-slate-600 dark:text-slate-300">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                          {p.categoryName}
                        </span>
                      </td>

                      {/* SKU & HSN */}
                      <td className="py-3.5 px-3.5 font-mono">
                        <p className="font-bold text-slate-800 dark:text-slate-200">{p.sku || p.code}</p>
                        <p className="text-[10px] text-slate-400">HSN: {p.hsnCode || '0910.30'}</p>
                      </td>

                      {/* Weight / Pack Sizes */}
                      <td className="py-3.5 px-3.5">
                        <div className="flex items-center gap-1 flex-wrap max-w-[150px]">
                          {p.variants && p.variants.length > 0 ? (
                            p.variants.map(v => (
                              <span key={v.id} className="px-1.5 py-0.5 rounded-md bg-amber-100/80 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 font-extrabold text-[10px]">
                                {v.weight}
                              </span>
                            ))
                          ) : (
                            <span className="px-2 py-0.5 rounded-md bg-amber-100/80 text-amber-900 font-bold text-[10px]">
                              {p.unit}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Mfg Price */}
                      <td className="py-3.5 px-3.5 font-semibold text-slate-600 dark:text-slate-300">
                        {formatCurrency(p.purchasePrice)}
                      </td>

                      {/* Selling Price */}
                      <td className="py-3.5 px-3.5 font-black text-slate-800 dark:text-white">
                        {formatCurrency(p.dealerPrice)}
                        <span className="block text-[10px] text-slate-400 font-normal line-through">MRP: {formatCurrency(p.mrp)}</span>
                      </td>

                      {/* GST */}
                      <td className="py-3.5 px-3.5 font-bold text-slate-500">
                        {p.gstRate}%
                      </td>

                      {/* Current Stock */}
                      <td className="py-3.5 px-3.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-1 rounded-lg text-xs font-black ${
                              isLowStock
                                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200'
                                : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                            }`}
                          >
                            {p.currentStock} units
                          </span>
                          {isLowStock && (
                            <AlertTriangle size={14} className="text-rose-500 animate-bounce" />
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${getStatusBadgeClass(p.status)}`}>
                          {p.status}
                        </span>
                      </td>

                      {/* Action Buttons: View, Edit, Delete */}
                      <td className="py-3.5 px-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          
                          {/* View Button */}
                          <button
                            onClick={() => setViewingProduct(p)}
                            className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                            title="View Product Specs & Variants"
                          >
                            <Eye size={15} />
                          </button>

                          {/* Edit Button */}
                          <button
                            onClick={() => handleOpenEditModal(p)}
                            className="p-1.5 rounded-lg bg-amber-100 text-amber-900 hover:bg-amber-200 dark:bg-amber-950/60 dark:text-amber-300"
                            title="Edit Product Master & Variants"
                          >
                            <Edit3 size={15} />
                          </button>

                          {/* Quick Stock Adjust Button */}
                          <button
                            onClick={() => setStockModalProduct(p)}
                            className="px-2 py-1 rounded-lg bg-slate-800 text-amber-300 font-bold text-[10px] hover:bg-slate-700"
                            title="Stock Balance Adjustment"
                          >
                            Stock +/-
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => setDeletingProduct(p)}
                            className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/60 dark:text-rose-400"
                            title="Delete Product"
                          >
                            <Trash2 size={15} />
                          </button>

                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* Add / Edit Product Modal */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        productToEdit={editingProduct}
      />

      {/* View Product Details Modal */}
      {viewingProduct && (
        <ProductViewModal
          product={viewingProduct}
          onClose={() => setViewingProduct(null)}
          onEdit={(prod) => handleOpenEditModal(prod)}
        />
      )}

      {/* Delete Confirmation Popup Modal */}
      {deletingProduct && (
        <DeleteProductModal
          product={deletingProduct}
          onClose={() => setDeletingProduct(null)}
          onConfirm={(id) => deleteProduct(id)}
        />
      )}

      {/* Quick Stock Balance Adjustment Modal */}
      {stockModalProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-800 dark:text-white">
                Adjust Inventory Stock - {stockModalProduct.name}
              </h3>
              <button
                onClick={() => setStockModalProduct(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400 font-medium">Current Stock</span>
                <p className="text-xl font-black text-[#800000] dark:text-amber-400">
                  {stockModalProduct.currentStock} units
                </p>
              </div>
              <div>
                <span className="text-slate-400 font-medium font-sans">Reorder Trigger</span>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                  {stockModalProduct.reorderLevel} units
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Quantity to Adjust
              </label>
              <input
                type="number"
                min="1"
                value={stockDelta}
                onChange={e => setStockDelta(Number(e.target.value))}
                className="w-full px-4 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => handleApplyStockAdjustment(true)}
                className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md"
              >
                <PlusCircle size={16} />
                <span>+ Add Stock</span>
              </button>
              <button
                onClick={() => handleApplyStockAdjustment(false)}
                className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md"
              >
                <MinusCircle size={16} />
                <span>- Deduct Stock</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
