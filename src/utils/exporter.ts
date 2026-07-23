/**
 * @license
 * Version 1.0.0
 * Jamavat Masala ERP - Data Exporter (CSV & Print PDF)
 */

import { JAMAVAT_LOGO_DATA_URL } from './logo';

/**
 * Export any array of objects to downloadable CSV / Excel file
 */
export function exportToCSV(filename: string, rows: object[]) {
  if (!rows || !rows.length) {
    alert("No data available to export.");
    return;
  }

  const headers = Object.keys(rows[0]);
  const csvContent = [
    headers.join(','),
    ...rows.map(row => 
      headers.map(field => {
        const val = (row as any)[field];
        if (val === null || val === undefined) return '""';
        if (typeof val === 'object') return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
        return `"${String(val).replace(/"/g, '""')}"`;
      }).join(',')
    )
  ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export Employee List to Printable PDF Document
 */
export function exportEmployeesToPDF(employees: any[]) {
  const printWin = window.open('', '_blank');
  if (!printWin) return;

  const rowsHtml = employees.map(emp => `
    <tr>
      <td>${emp.code}</td>
      <td><strong>${emp.name}</strong><br/><small style="color:#64748b">${emp.email || ''}</small></td>
      <td>${emp.role || ''}</td>
      <td>${emp.department || ''}</td>
      <td>${emp.phone || ''}</td>
      <td>${emp.joiningDate || ''}</td>
      <td>${emp.status || ''}</td>
    </tr>
  `).join('');

  printWin.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>JM ERP - Employee List</title>
        <style>
          body { font-family: system-ui, sans-serif; padding: 20px; color: #1e293b; }
          .header { text-align: center; border-b: 2px solid #800000; padding-bottom: 12px; margin-bottom: 20px; }
          h2 { color: #800000; margin: 0; }
          p { margin: 4px 0 0; font-size: 12px; color: #64748b; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 10px; }
          th { background: #800000; color: #fff; text-align: left; padding: 8px 10px; }
          td { padding: 8px 10px; border-bottom: 1px solid #e2e8f0; }
          tr:nth-child(even) { background: #f8fafc; }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="${JAMAVAT_LOGO_DATA_URL}" alt="Jamavat Masala Logo" style="height: 48px; width: auto; margin-bottom: 8px; display: inline-block;" />
          <h2>JAMAVAT MASALA - EMPLOYEE DIRECTORY</h2>
          <p>Export Date: ${new Date().toLocaleDateString('en-IN')} • Total Records: ${employees.length}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Full Name</th>
              <th>Role</th>
              <th>Department</th>
              <th>Mobile</th>
              <th>Joining Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
    </html>
  `);
  printWin.document.close();
}

/**
 * Trigger browser print view
 */
export function printElement(elementId: string) {
  const printContent = document.getElementById(elementId);
  if (!printContent) {
    window.print();
    return;
  }
  window.print();
}
