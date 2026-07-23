import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Order, CompanySettings, Shop } from '../types/erp';
import { JAMAVAT_LOGO_DATA_URL } from './logo';

// Helper to convert number to Indian Currency Words
function numberToWords(num: number): string {
  const a = [
    '', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ',
    'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const numStr = Math.floor(num).toString();
  if (numStr.length > 9) return 'Amount Exceeds Limit';

  const n = ('000000000' + numStr).substr(-9);
  const crores = parseInt(n.substr(0, 2));
  const lakhs = parseInt(n.substr(2, 2));
  const thousands = parseInt(n.substr(4, 2));
  const hundreds = parseInt(n.substr(6, 1));
  const tens = parseInt(n.substr(7, 2));

  let str = '';
  if (crores > 0) {
    str += (a[crores] || (b[Math.floor(crores / 10)] + ' ' + a[crores % 10])) + 'Crore ';
  }
  if (lakhs > 0) {
    str += (a[lakhs] || (b[Math.floor(lakhs / 10)] + ' ' + a[lakhs % 10])) + 'Lakh ';
  }
  if (thousands > 0) {
    str += (a[thousands] || (b[Math.floor(thousands / 10)] + ' ' + a[thousands % 10])) + 'Thousand ';
  }
  if (hundreds > 0) {
    str += a[hundreds] + 'Hundred ';
  }
  if (tens > 0) {
    if (str !== '') str += 'and ';
    str += (a[tens] || (b[Math.floor(tens / 10)] + ' ' + a[tens % 10]));
  }

  return (str.trim() || 'Zero') + ' Rupees Only';
}

export function generateInvoicePDF(order: Order, settings: CompanySettings, shop?: Shop) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const primaryColor = '#800000'; // Deep Maroon
  const goldColor = '#D4AF37'; // Gold Accent
  const darkTextColor = '#1E293B';

  // 1. Top Decorative Bar
  doc.setFillColor(128, 0, 0); // Maroon
  doc.rect(0, 0, 210, 8, 'F');

  doc.setFillColor(212, 175, 55); // Gold accent
  doc.rect(0, 8, 210, 2, 'F');

  // 2. Company Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(128, 0, 0);
  doc.text('JAMAVAT MASALA INDUSTRIES', 14, 22);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text('Manufacturer of Premium Ground Spices & Authentic Blended Masalas', 14, 27);
  doc.text(`${settings.address}, ${settings.cityState}`, 14, 32);
  doc.text(`GSTIN: ${settings.gstin} | Phone: ${settings.phone} | Email: ${settings.email}`, 14, 37);

  // 3. Right Header Title
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(135, 15, 61, 24, 2, 2, 'FD');
  doc.setDrawColor(226, 232, 240);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(128, 0, 0);
  doc.text('TAX INVOICE', 140, 23);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  doc.text(`INV #: ${order.invoiceNumber || order.orderNumber}`, 140, 29);

  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  const formattedTime = new Date(order.createdAt).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit'
  });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`Date: ${formattedDate} ${formattedTime}`, 140, 34);

  // Divider line
  doc.setDrawColor(226, 232, 240);
  doc.line(14, 43, 196, 43);

  // 4. Customer Details Box
  let startY = 48;
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14, startY, 182, 32, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(128, 0, 0);
  doc.text('BILLED TO (DEALER / SHOP DETAILS):', 18, startY + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(order.shopName, 18, startY + 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);

  const fullAddress = shop
    ? `${shop.address}${shop.village ? ', ' + shop.village : ''}${shop.taluka ? ', ' + shop.taluka : ''}, ${shop.district || shop.city}, ${shop.state || 'Gujarat'} - ${shop.pinCode || ''}`
    : order.shopAddress;

  doc.text(`Address: ${fullAddress}`, 18, startY + 17);
  doc.text(`Contact: ${order.shopPhone} | GSTIN: ${order.shopGst || shop?.gstNumber || 'URP (Unregistered)'}`, 18, startY + 22);
  if (shop?.ownerName) {
    doc.text(`Proprietor: ${shop.ownerName} | Dealer Type: ${shop.dealerType || 'Retailer'}`, 18, startY + 27);
  } else {
    doc.text(`Order Reference: ${order.orderNumber} | Payment Status: ${order.paymentStatus}`, 18, startY + 27);
  }

  // 5. Product Table
  const tableData = order.items.map((item, index) => {
    const itemTotal = item.quantity * item.unitPrice;
    return [
      index + 1,
      `${item.productName} (${item.unit})`,
      item.productCode || 'JM-MSL',
      item.unit,
      item.quantity,
      `₹${item.unitPrice.toFixed(2)}`,
      `₹${((item.mrp - item.unitPrice) * item.quantity).toFixed(2)}`,
      `${item.gstRate}%`,
      `₹${item.totalPrice.toFixed(2)}`
    ];
  });

  autoTable(doc, {
    startY: startY + 36,
    head: [['#', 'Item Description', 'Code', 'Pack', 'Qty', 'Rate', 'Discount', 'GST', 'Total Amount']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [128, 0, 0],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'center'
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59]
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { cellWidth: 58 },
      2: { halign: 'center', cellWidth: 22 },
      3: { halign: 'center', cellWidth: 16 },
      4: { halign: 'center', cellWidth: 14 },
      5: { halign: 'right', cellWidth: 18 },
      6: { halign: 'right', cellWidth: 18 },
      7: { halign: 'center', cellWidth: 12 },
      8: { halign: 'right', cellWidth: 24 }
    },
    margin: { left: 14, right: 14 }
  });

  // @ts-ignore
  const finalTableY = doc.lastAutoTable.finalY + 6;

  // 6. Summary Totals Box
  const summaryX = 120;
  const summaryWidth = 76;

  doc.setFillColor(248, 250, 252);
  doc.roundedRect(summaryX, finalTableY, summaryWidth, 38, 2, 2, 'FD');
  doc.setDrawColor(226, 232, 240);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);

  doc.text('Subtotal:', summaryX + 4, finalTableY + 6);
  doc.text(`₹${order.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, summaryX + summaryWidth - 4, finalTableY + 6, { align: 'right' });

  doc.text('Discount (-):', summaryX + 4, finalTableY + 12);
  doc.text(`₹${order.discountAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, summaryX + summaryWidth - 4, finalTableY + 12, { align: 'right' });

  doc.text('Total GST (5%/12%):', summaryX + 4, finalTableY + 18);
  doc.text(`₹${order.gstTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, summaryX + summaryWidth - 4, finalTableY + 18, { align: 'right' });

  doc.setFillColor(128, 0, 0);
  doc.rect(summaryX, finalTableY + 23, summaryWidth, 15, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text('GRAND TOTAL:', summaryX + 4, finalTableY + 32);
  doc.text(`₹${order.netTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, summaryX + summaryWidth - 4, finalTableY + 32, { align: 'right' });

  // Left side: Amount in words & Terms
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(128, 0, 0);
  doc.text('Amount in Words:', 14, finalTableY + 6);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  const words = numberToWords(order.netTotal);
  doc.text(words, 14, finalTableY + 11);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(128, 0, 0);
  doc.text('Terms & Conditions:', 14, finalTableY + 22);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('1. Goods once sold will not be returned or exchanged.', 14, finalTableY + 27);
  doc.text('2. All disputes subject to Anand, Gujarat jurisdiction.', 14, finalTableY + 31);
  doc.text('3. Interest @18% p.a. will be charged if bill is unpaid beyond credit terms.', 14, finalTableY + 35);

  // 7. Signature Box & Stamp
  const sigY = finalTableY + 45;
  doc.setDrawColor(203, 213, 225);
  doc.line(135, sigY + 15, 196, sigY + 15);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(128, 0, 0);
  doc.text('For JAMAVAT MASALA INDUSTRIES', 135, sigY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Authorized Signatory Stamp', 135, sigY + 19);

  // 8. Footer Message
  doc.setFillColor(254, 243, 199); // Soft Gold tint
  doc.rect(0, 282, 210, 15, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(128, 0, 0);
  doc.text('Thank you for choosing Jamavat Masala - Pure & Authentic Spices!', 105, 289, { align: 'center' });

  // Save the PDF
  const filename = `${order.invoiceNumber || order.orderNumber}_Invoice.pdf`;
  doc.save(filename);
}

export function printInvoiceHTML(order: Order, settings: CompanySettings, shop?: Shop) {
  const fullAddress = shop
    ? `${shop.address}${shop.village ? ', ' + shop.village : ''}${shop.taluka ? ', ' + shop.taluka : ''}, ${shop.district || shop.city}, ${shop.state || 'Gujarat'} - ${shop.pinCode || ''}`
    : order.shopAddress;

  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  const printWindow = window.open('', '_blank', 'width=800,height=900');
  if (!printWindow) {
    alert('Please allow popups to print invoices.');
    return;
  }

  const itemsHtml = order.items.map((item, idx) => `
    <tr>
      <td style="text-align: center; padding: 6px; border: 1px solid #e2e8f0;">${idx + 1}</td>
      <td style="padding: 6px; border: 1px solid #e2e8f0; font-weight: bold;">${item.productName} <span style="font-weight: normal; color: #64748b;">(${item.unit})</span></td>
      <td style="text-align: center; padding: 6px; border: 1px solid #e2e8f0;">${item.productCode || 'JM-MSL'}</td>
      <td style="text-align: center; padding: 6px; border: 1px solid #e2e8f0;">${item.unit}</td>
      <td style="text-align: center; padding: 6px; border: 1px solid #e2e8f0; font-weight: bold;">${item.quantity}</td>
      <td style="text-align: right; padding: 6px; border: 1px solid #e2e8f0;">₹${item.unitPrice.toFixed(2)}</td>
      <td style="text-align: right; padding: 6px; border: 1px solid #e2e8f0; color: #047857;">₹${((item.mrp - item.unitPrice) * item.quantity).toFixed(2)}</td>
      <td style="text-align: center; padding: 6px; border: 1px solid #e2e8f0;">${item.gstRate}%</td>
      <td style="text-align: right; padding: 6px; border: 1px solid #e2e8f0; font-weight: bold;">₹${item.totalPrice.toFixed(2)}</td>
    </tr>
  `).join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Invoice #${order.invoiceNumber || order.orderNumber}</title>
      <style>
        @page { size: A4; margin: 10mm; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b; margin: 0; padding: 20px; font-size: 12px; }
        .header { display: flex; justify-content: space-between; border-bottom: 2px solid #800000; padding-bottom: 12px; margin-bottom: 15px; }
        .logo-title { color: #800000; font-size: 22px; font-weight: bold; margin: 0; }
        .subtitle { font-size: 10px; color: #64748b; margin-top: 2px; }
        .inv-badge { background: #f8fafc; border: 1px solid #cbd5e1; padding: 10px 15px; border-radius: 8px; text-align: right; }
        .inv-title { font-size: 16px; font-weight: bold; color: #800000; }
        .billed-box { background: #f1f5f9; padding: 12px; border-radius: 8px; margin-bottom: 15px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 11px; }
        th { background: #800000; color: white; padding: 8px; border: 1px solid #800000; text-align: left; }
        .totals-table { width: 300px; margin-left: auto; margin-bottom: 20px; }
        .totals-table td { padding: 6px; }
        .grand-total { background: #800000; color: white; font-size: 14px; font-weight: bold; }
        .footer { margin-top: 30px; display: flex; justify-content: space-between; align-items: flex-end; }
        .sig-box { text-align: center; border-top: 1px solid #cbd5e1; width: 200px; padding-top: 5px; font-weight: bold; }
        @media print {
          body { padding: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="no-print" style="margin-bottom: 20px; text-align: right;">
        <button onclick="window.print()" style="background: #800000; color: white; padding: 10px 20px; border: none; border-radius: 8px; font-weight: bold; cursor: pointer;">🖨️ Print Invoice</button>
      </div>

      <div class="header">
        <div>
          <img src="${JAMAVAT_LOGO_DATA_URL}" alt="Jamavat Masala" style="width: 140px; height: auto; display: block; margin-bottom: 6px;" />
          <div class="logo-title">JAMAVAT MASALA INDUSTRIES</div>
          <div class="subtitle">Manufacturer of Premium Spices & Authentic Blended Masalas</div>
          <div style="font-size: 10px; color: #475569; margin-top: 4px;">
            ${settings.address}, ${settings.cityState}<br/>
            <strong>GSTIN:</strong> ${settings.gstin} | <strong>Phone:</strong> ${settings.phone} | <strong>Email:</strong> ${settings.email}
          </div>
        </div>
        <div class="inv-badge">
          <div class="inv-title">TAX INVOICE</div>
          <div style="font-weight: bold; font-size: 13px;">#${order.invoiceNumber || order.orderNumber}</div>
          <div style="color: #64748b; font-size: 10px;">Date: ${formattedDate}</div>
          <div style="font-size: 10px; font-weight: bold; color: #047857; margin-top: 3px;">Status: ${order.paymentStatus}</div>
        </div>
      </div>

      <div class="billed-box">
        <div style="color: #800000; font-weight: bold; font-size: 10px; margin-bottom: 4px;">BILLED TO (CUSTOMER DETAILS):</div>
        <div style="font-size: 14px; font-weight: bold;">${order.shopName}</div>
        <div style="color: #334155; margin-top: 3px;">Address: ${fullAddress}</div>
        <div style="color: #334155; margin-top: 3px;">Phone: ${order.shopPhone} | GSTIN: ${order.shopGst || shop?.gstNumber || 'URP (Unregistered)'}</div>
      </div>

      <table>
        <thead>
          <tr>
            <th style="width: 30px; text-align: center;">#</th>
            <th>Item Description</th>
            <th style="text-align: center;">Code</th>
            <th style="text-align: center;">Pack</th>
            <th style="text-align: center;">Qty</th>
            <th style="text-align: right;">Rate</th>
            <th style="text-align: right;">Discount</th>
            <th style="text-align: center;">GST</th>
            <th style="text-align: right;">Total Amount</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <table class="totals-table">
        <tr>
          <td>Subtotal:</td>
          <td style="text-align: right; font-weight: bold;">₹${order.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
        </tr>
        <tr>
          <td>Total Discount:</td>
          <td style="text-align: right; color: #047857;">-₹${order.discountAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
        </tr>
        <tr>
          <td>GST Amount:</td>
          <td style="text-align: right; font-weight: bold;">₹${order.gstTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
        </tr>
        <tr class="grand-total">
          <td style="padding: 10px;">GRAND TOTAL:</td>
          <td style="text-align: right; padding: 10px;">₹${order.netTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
        </tr>
      </table>

      <div style="margin-bottom: 20px;">
        <div style="font-weight: bold; color: #800000; font-size: 11px;">Amount in Words:</div>
        <div style="font-style: italic; color: #334155;">${numberToWords(order.netTotal)}</div>
      </div>

      <div class="footer">
        <div style="font-size: 10px; color: #64748b;">
          <strong>Terms & Conditions:</strong><br/>
          1. Goods once sold will not be taken back.<br/>
          2. Subject to Anand jurisdiction.<br/>
          3. E.&O.E.
        </div>
        <div class="sig-box">
          <div style="color: #800000; font-size: 10px; margin-bottom: 30px;">For JAMAVAT MASALA INDUSTRIES</div>
          <div style="font-size: 10px; color: #64748b;">Authorized Signatory</div>
        </div>
      </div>

      <div style="text-align: center; margin-top: 30px; border-top: 1px border #cbd5e1; padding-top: 10px; font-weight: bold; color: #800000;">
        Thank you for choosing Jamavat Masala - Pure & Authentic Spices!
      </div>

      <script>
        window.onload = function() {
          window.print();
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
}
