/**
 * @license
 * Version 1.0.0
 * Jamavat Masala ERP - WhatsApp Direct Integration Helper
 */

import { Order, Shop } from '../types/erp';
import { formatCurrency } from './formatters';

/**
 * Open WhatsApp with pre-filled message for an Invoice or Order
 */
export function sendOrderWhatsApp(order: Order, shopPhone?: string) {
  const phone = (shopPhone || order.shopPhone || '').replace(/[^0-9]/g, '');
  
  const text = `*JAMAVAT MASALA - INVOICE SUMMARY* 🌶️
---------------------------------
*Invoice No:* ${order.invoiceNumber || order.orderNumber}
*Shop:* ${order.shopName}
*Date:* ${order.createdAt.substring(0, 10)}
---------------------------------
*Items:*
${order.items.map(i => `• ${i.productName} (${i.unit}) x ${i.quantity} = ${formatCurrency(i.totalPrice)}`).join('\n')}

*Subtotal:* ${formatCurrency(order.subtotal)}
*GST:* ${formatCurrency(order.gstTotal)}
*Net Total:* *${formatCurrency(order.netTotal)}*
*Paid Amount:* ${formatCurrency(order.paidAmount)}
*Payment Status:* ${order.paymentStatus.toUpperCase()}

Thank you for your business with Jamavat Masala!
For queries, contact: +91 98765 43210`;

  const url = `https://wa.me/${phone.length === 10 ? '91' + phone : phone}?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}

/**
 * Send direct shop balance reminder
 */
export function sendShopBalanceWhatsApp(shop: Shop) {
  const phone = shop.phone.replace(/[^0-9]/g, '');
  const text = `*JAMAVAT MASALA - STATEMENT REMINDER* 🌶️
Dear ${shop.ownerName} (${shop.name}),

This is a gentle payment reminder from Jamavat Masala.
*Current Outstanding Balance:* ${formatCurrency(shop.outstandingAmount)}
*Credit Limit:* ${formatCurrency(shop.creditLimit)}

Please arrange payment via UPI / Bank Transfer at your earliest convenience.
Bank Details: Jamavat Masala, HDFC Bank, A/C: 50200012345678, IFSC: HDFC0001234

Thank you!`;

  const url = `https://wa.me/${phone.length === 10 ? '91' + phone : phone}?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}
