import React from 'react';
import { X, Download, Printer, FileText, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { Order, CompanySettings, Shop } from '../../types/erp';
import { generateInvoicePDF, printInvoiceHTML } from '../../utils/pdfGenerator';

interface InvoiceModalProps {
  order: Order;
  settings: CompanySettings;
  shop?: Shop;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ order, settings, shop, onClose }) => {
  const fullAddress = shop
    ? `${shop.address}${shop.village ? ', ' + shop.village : ''}${shop.taluka ? ', ' + shop.taluka : ''}, ${shop.district || shop.city}, ${shop.state || 'Gujarat'} - ${shop.pinCode || ''}`
    : order.shopAddress;

  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300';
      case 'Partial':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300';
      default:
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl max-w-3xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl my-auto relative max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Modal Top Actions Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#800000] text-amber-400">
              <FileText size={18} />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-800 dark:text-white">
                Tax Invoice <span className="text-[#800000] dark:text-amber-400">#{order.invoiceNumber || order.orderNumber}</span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">{formattedDate}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => generateInvoicePDF(order, settings, shop)}
              className="px-3 py-1.5 rounded-xl bg-[#800000] hover:bg-[#660000] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
              title="Download PDF"
            >
              <Download size={15} />
              <span className="hidden sm:inline">Download PDF</span>
            </button>
            <button
              onClick={() => printInvoiceHTML(order, settings, shop)}
              className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-[#800000] text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
              title="Print Invoice"
            >
              <Printer size={15} />
              <span className="hidden sm:inline">Print</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Invoice Printable View Container */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6 text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900">
          
          {/* Company Branding & Header */}
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <div className="text-xl sm:text-2xl font-black text-[#800000] dark:text-amber-400 uppercase tracking-tight">
                {settings.companyName || 'Jamavat Masala'}
              </div>
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                Manufacturer of Premium Spices & Authentic Blended Masalas
              </p>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 max-w-md">
                {settings.address}, {settings.cityState}
              </p>
              <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-500 dark:text-slate-400 mt-1.5">
                <span><strong>GSTIN:</strong> {settings.gstin}</span>
                <span>•</span>
                <span><strong>Phone:</strong> {settings.phone}</span>
              </div>
            </div>

            <div className="text-left sm:text-right bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-700/60 w-full sm:w-auto shrink-0">
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#800000] text-amber-300 mb-1">
                TAX INVOICE
              </span>
              <div className="font-extrabold text-sm text-slate-800 dark:text-white">
                #{order.invoiceNumber || order.orderNumber}
              </div>
              <p className="text-[10px] text-slate-500">Order Ref: {order.orderNumber}</p>
              <div className="mt-2 flex items-center justify-start sm:justify-end gap-1.5">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getPaymentBadge(order.paymentStatus)}`}>
                  {order.paymentStatus}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                  {order.status}
                </span>
              </div>
            </div>
          </div>

          {/* Billed To Shop Information */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-black uppercase text-[#800000] dark:text-amber-400 tracking-wider block mb-1">
              BILLED TO (DEALER / SHOP DETAILS):
            </span>
            <div className="flex flex-col sm:flex-row justify-between gap-2">
              <div>
                <h4 className="font-extrabold text-slate-800 dark:text-white text-sm sm:text-base">
                  {order.shopName}
                </h4>
                <p className="text-slate-600 dark:text-slate-300 text-xs mt-0.5">{fullAddress}</p>
                <div className="flex flex-wrap gap-3 text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  <span><strong>Mobile:</strong> {order.shopPhone}</span>
                  {shop?.alternatePhone && <span>| <strong>Alt Phone:</strong> {shop.alternatePhone}</span>}
                  <span>| <strong>GSTIN:</strong> {order.shopGst || shop?.gstNumber || 'URP (Unregistered)'}</span>
                </div>
              </div>
              {shop?.ownerName && (
                <div className="text-left sm:text-right border-t sm:border-t-0 sm:border-l border-slate-200 dark:border-slate-700/60 pt-2 sm:pt-0 sm:pl-4">
                  <p className="text-[11px] text-slate-500">Proprietor: <strong className="text-slate-800 dark:text-slate-200">{shop.ownerName}</strong></p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Dealer Type: <span className="font-bold text-[#800000] dark:text-amber-400">{shop.dealerType || 'Retailer'}</span></p>
                </div>
              )}
            </div>
          </div>

          {/* Itemized Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#800000] text-white font-bold">
                  <th className="py-2.5 px-3 text-center">#</th>
                  <th className="py-2.5 px-3">Item Description</th>
                  <th className="py-2.5 px-3 text-center">Code</th>
                  <th className="py-2.5 px-3 text-center">Pack</th>
                  <th className="py-2.5 px-3 text-center">Qty</th>
                  <th className="py-2.5 px-3 text-right">Rate</th>
                  <th className="py-2.5 px-3 text-right">Discount</th>
                  <th className="py-2.5 px-3 text-center">GST</th>
                  <th className="py-2.5 px-3 text-right">Total (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {order.items.map((item, index) => (
                  <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-3 text-center text-slate-400">{index + 1}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-800 dark:text-white">
                      {item.productName}
                      <span className="text-[10px] font-normal text-slate-400 ml-1">({item.unit})</span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-semibold text-slate-500">{item.productCode || 'JM-MSL'}</td>
                    <td className="py-2.5 px-3 text-center">{item.unit}</td>
                    <td className="py-2.5 px-3 text-center font-bold">{item.quantity}</td>
                    <td className="py-2.5 px-3 text-right">₹{item.unitPrice.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-right text-emerald-600 font-medium">
                      -₹{((item.mrp - item.unitPrice) * item.quantity).toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-center font-medium">{item.gstRate}%</td>
                    <td className="py-2.5 px-3 text-right font-extrabold text-slate-800 dark:text-white">
                      ₹{item.totalPrice.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Subtotal & Summary Box */}
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4 pt-2">
            <div className="space-y-2 max-w-sm">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Amount in Words</span>
                <p className="text-xs font-semibold italic text-slate-700 dark:text-slate-300">
                  {order.netTotal ? 'Rupees ' + order.netTotal.toLocaleString('en-IN') + ' Only' : 'Zero Rupees'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
                <p className="font-bold text-slate-700 dark:text-slate-300">Terms & Conditions:</p>
                <p>1. Goods once dispatched cannot be returned.</p>
                <p>2. Payment subject to terms. All disputes subject to Anand Jurisdiction.</p>
              </div>
            </div>

            <div className="w-full sm:w-72 bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200 dark:border-slate-700/60 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                <span>Subtotal:</span>
                <span className="font-bold">₹{order.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400">
                <span>Discount (-):</span>
                <span className="font-bold">-₹{order.discountAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                <span>GST Tax Total:</span>
                <span className="font-bold">₹{order.gstTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-sm sm:text-base font-black text-[#800000] dark:text-amber-400">
                <span>Grand Total:</span>
                <span>₹{order.netTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {/* Footer Signature Box */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <p className="text-[11px] font-bold text-[#800000] dark:text-amber-400">
              Thank you for choosing Jamavat Masala - Pure & Authentic Spices!
            </p>

            <div className="text-right">
              <div className="text-[11px] font-extrabold text-slate-800 dark:text-white">
                For JAMAVAT MASALA INDUSTRIES
              </div>
              <div className="h-10 border-b border-slate-300 dark:border-slate-700 w-44 ml-auto my-1"></div>
              <p className="text-[10px] text-slate-400">Authorized Signatory</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
