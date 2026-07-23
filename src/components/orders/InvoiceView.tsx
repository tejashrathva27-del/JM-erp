/**
 * @license
 * Version 1.0.0
 * Jamavat Masala ERP - Printable GST Tax Invoice Component
 */

import React from 'react';
import { Order } from '../../types/erp';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { sendOrderWhatsApp } from '../../utils/whatsapp';
import { Printer, MessageSquare, Download, ArrowLeft, Building2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { generateInvoicePDF, printInvoiceHTML } from '../../utils/pdfGenerator';
import { JamavatLogo } from '../../utils/logo';

interface InvoiceViewProps {
  order: Order;
  onBack: () => void;
}

export const InvoiceView: React.FC<InvoiceViewProps> = ({ order, onBack }) => {
  const { settings, shops } = useApp();
  const shopObj = shops.find(s => s.id === order.shopId);

  const handlePrint = () => {
    printInvoiceHTML(order, settings, shopObj);
  };

  const handleDownload = () => {
    generateInvoicePDF(order, settings, shopObj);
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar (hidden on print) */}
      <div className="no-print flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-200 cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>Back to Orders</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => sendOrderWhatsApp(order)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md cursor-pointer"
          >
            <MessageSquare size={16} />
            <span>WhatsApp</span>
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-[#800000] font-bold text-xs shadow-md cursor-pointer"
          >
            <Download size={16} />
            <span>Download PDF</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#800000] hover:bg-[#660000] text-white font-bold text-xs shadow-md cursor-pointer"
          >
            <Printer size={16} />
            <span>Print Invoice</span>
          </button>
        </div>
      </div>

      {/* Printable GST Tax Invoice Document Area */}
      <div
        id="printable-area"
        className="max-w-4xl mx-auto bg-white text-slate-900 p-8 rounded-2xl shadow-xl border border-slate-200 font-['Plus_Jakarta_Sans',sans-serif]"
      >
        {/* Invoice Header */}
        <div className="flex items-start justify-between border-b-2 border-[#800000] pb-6">
          <div className="flex items-center gap-4">
            <JamavatLogo width={140} className="w-32 sm:w-36 h-auto shrink-0 drop-shadow-sm" />
            <div>
              <h1 className="text-2xl font-black text-[#800000] tracking-tight">
                {settings.companyName}
              </h1>
              <p className="text-xs font-semibold text-slate-600">Pure Spices Manufacturing & Distribution</p>
              <p className="text-[11px] text-slate-500 max-w-sm mt-0.5">{settings.address}, {settings.cityState}</p>
              <p className="text-[11px] text-slate-500">GSTIN: <strong>{settings.gstin}</strong> • Phone: {settings.phone}</p>
            </div>
          </div>

          <div className="text-right">
            <span className="px-3 py-1 bg-[#800000] text-amber-300 text-xs font-extrabold rounded-lg inline-block uppercase tracking-wider">
              TAX INVOICE
            </span>
            <h3 className="text-lg font-extrabold text-[#800000] mt-2">
              {order.invoiceNumber || order.orderNumber}
            </h3>
            <p className="text-xs text-slate-500 mt-1">Date: <strong>{formatDate(order.createdAt)}</strong></p>
          </div>
        </div>

        {/* Billed To / Shop Details */}
        <div className="grid grid-cols-2 gap-6 py-6 border-b border-slate-200 text-xs">
          <div>
            <p className="text-[10px] font-bold uppercase text-slate-400">Billed To (Customer / Dealer):</p>
            <h4 className="text-sm font-black text-slate-800 mt-0.5">{order.shopName}</h4>
            <p className="text-slate-600">{order.shopAddress}</p>
            <p className="text-slate-600">Phone: <strong>{order.shopPhone}</strong></p>
            {order.shopGst && <p className="text-slate-600">GSTIN: <strong>{order.shopGst}</strong></p>}
          </div>

          <div className="text-right space-y-1">
            <p className="text-[10px] font-bold uppercase text-slate-400">Dispatch & Payment Terms:</p>
            <p className="text-slate-700">Payment Status: <strong className="uppercase text-[#800000]">{order.paymentStatus}</strong></p>
            <p className="text-slate-700">Order Status: <strong>{order.status}</strong></p>
            {order.dispatchVehicle && <p className="text-slate-700">Vehicle No: <strong>{order.dispatchVehicle}</strong></p>}
            {order.trackingCode && <p className="text-slate-700">Tracking Code: <strong>{order.trackingCode}</strong></p>}
          </div>
        </div>

        {/* Itemized Invoice Table */}
        <div className="py-6">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#800000] text-white font-bold">
                <th className="py-2.5 px-3 rounded-l-lg">#</th>
                <th className="py-2.5 px-3">Item Description</th>
                <th className="py-2.5 px-3 text-center">Unit</th>
                <th className="py-2.5 px-3 text-center">Qty</th>
                <th className="py-2.5 px-3 text-right">Unit Price</th>
                <th className="py-2.5 px-3 text-right">GST %</th>
                <th className="py-2.5 px-3 text-right rounded-r-lg">Total Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {order.items.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-bold text-slate-500">{idx + 1}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-800">{item.productName}</td>
                  <td className="py-2.5 px-3 text-center text-slate-600">{item.unit}</td>
                  <td className="py-2.5 px-3 text-center font-bold text-slate-800">{item.quantity}</td>
                  <td className="py-2.5 px-3 text-right font-semibold">{formatCurrency(item.unitPrice)}</td>
                  <td className="py-2.5 px-3 text-right">{item.gstRate}%</td>
                  <td className="py-2.5 px-3 text-right font-black text-slate-800">{formatCurrency(item.totalPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary Calculations */}
        <div className="flex justify-end pt-4 border-t-2 border-slate-200">
          <div className="w-64 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-bold">{formatCurrency(order.subtotal)}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-rose-600">
                <span>Trade Discount:</span>
                <span className="font-bold">- {formatCurrency(order.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600">
              <span>CGST + SGST Tax:</span>
              <span className="font-bold">{formatCurrency(order.gstTotal)}</span>
            </div>
            <div className="flex justify-between text-sm font-black text-[#800000] pt-2 border-t border-slate-300">
              <span>Net Invoice Total:</span>
              <span>{formatCurrency(order.netTotal)}</span>
            </div>
            <div className="flex justify-between text-emerald-700 font-bold pt-1">
              <span>Amount Paid:</span>
              <span>{formatCurrency(order.paidAmount)}</span>
            </div>
            <div className="flex justify-between text-rose-700 font-bold pt-1">
              <span>Balance Due:</span>
              <span>{formatCurrency(order.netTotal - order.paidAmount)}</span>
            </div>
          </div>
        </div>

        {/* Invoice Footer Signatures */}
        <div className="mt-12 pt-8 border-t border-slate-200 grid grid-cols-2 text-xs text-slate-500">
          <div>
            <p className="font-bold text-slate-700">Terms & Conditions:</p>
            <p className="text-[10px] mt-1">1. Goods once sold will not be taken back.<br/>2. Subject to Anand Jurisdiction.</p>
          </div>
          <div className="text-right">
            <p className="font-extrabold text-[#800000]">For JAMAVAT MASALA</p>
            <div className="h-12"></div>
            <p className="font-bold text-slate-700">Authorized Signatory</p>
          </div>
        </div>
      </div>
    </div>
  );
};
