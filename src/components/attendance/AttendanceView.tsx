/**
 * @license
 * Version 1.0.0
 * Jamavat Masala ERP - Attendance & Payroll Matrix Module
 */

import React from 'react';
import { CalendarCheck, CheckCircle2, XCircle, Clock, Award } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getStatusBadgeClass } from '../../utils/formatters';
import { Toolbar } from '../common/Toolbar';

export const AttendanceView: React.FC = () => {
  const { employees, attendance, recordAttendance } = useApp();

  const today = new Date().toISOString().substring(0, 10);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <CalendarCheck className="text-[#800000] dark:text-amber-400" size={20} />
            <span>Daily Workforce Attendance Register ({today})</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Log employee check-in times, shift presence, overtime hours & monthly payroll calculations
          </p>
        </div>
        <Toolbar exportData={attendance} exportFilename="JM_ERP_Attendance" />
      </div>

      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#800000] text-white font-bold">
                <th className="py-3 px-4 rounded-l-xl">Code</th>
                <th className="py-3 px-4">Employee Name</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Designation</th>
                <th className="py-3 px-4">Today's Status</th>
                <th className="py-3 px-4 text-center">Overtime (Hrs)</th>
                <th className="py-3 px-4 rounded-r-xl text-right">Quick Mark</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {employees.map(emp => {
                const rec = attendance.find(a => a.employeeId === emp.id && a.date === today);
                const currentStatus = rec ? rec.status : 'Present';

                return (
                  <tr key={emp.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="py-3.5 px-4 font-bold text-[#800000] dark:text-amber-400">{emp.code}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-100">{emp.name}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-600 dark:text-slate-300">{emp.department}</td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">{emp.designation}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${getStatusBadgeClass(currentStatus)}`}>
                        {currentStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-amber-600 dark:text-amber-400">
                      {rec?.overtimeHours || 0} hrs
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => recordAttendance(emp.id, 'Present', 0)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[10px]"
                        >
                          Present
                        </button>
                        <button
                          onClick={() => recordAttendance(emp.id, 'Half Day', 0)}
                          className="px-2.5 py-1 rounded-lg bg-amber-500 text-white font-bold text-[10px]"
                        >
                          Half Day
                        </button>
                        <button
                          onClick={() => recordAttendance(emp.id, 'Absent', 0)}
                          className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-bold text-[10px]"
                        >
                          Absent
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
