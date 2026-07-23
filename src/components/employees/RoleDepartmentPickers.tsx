/**
 * @license
 * Jamavat Masala ERP - Department & Multi-Role Selectors
 */

import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check, X, Shield, Building } from 'lucide-react';
import { UserRole } from '../../types/erp';

export const ALL_DEPARTMENTS = [
  'Administration',
  'Human Resources (HR)',
  'Sales',
  'Marketing',
  'Accounts',
  'Finance',
  'Production',
  'Inventory',
  'Warehouse',
  'Purchase',
  'Quality Control',
  'Dispatch',
  'Logistics',
  'IT',
  'Customer Support'
];

export const ALL_ROLES: UserRole[] = [
  'Owner',
  'MD',
  'Managing Director',
  'Admin',
  'HR Manager',
  'HR Executive',
  'Sales Manager',
  'Sales Executive',
  'Accountant',
  'Finance Manager',
  'Production Manager',
  'Production Supervisor',
  'Inventory Manager',
  'Warehouse Manager',
  'Purchase Manager',
  'Dispatch Manager',
  'Delivery Staff',
  'Marketing Manager',
  'Customer Support',
  'Quality Control',
  'IT Administrator',
  'Supervisor',
  'Employee',
  'Viewer'
];

interface DepartmentPickerProps {
  value: string;
  onChange: (val: string) => void;
  required?: boolean;
  error?: string;
}

export const DepartmentPicker: React.FC<DepartmentPickerProps> = ({
  value,
  onChange,
  required = true,
  error
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(value);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = ALL_DEPARTMENTS.filter(d =>
    d.toLowerCase().includes((searchTerm || '').toLowerCase())
  );

  return (
    <div ref={wrapperRef} className="relative w-full">
      <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300 text-xs">
        Department {required && <span className="text-rose-500">*</span>}
      </label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          <Building size={15} />
        </div>
        <input
          type="text"
          value={searchTerm}
          required={required}
          onFocus={() => setIsOpen(true)}
          onChange={e => {
            setSearchTerm(e.target.value);
            onChange(e.target.value);
            setIsOpen(true);
          }}
          placeholder="Select or type department..."
          className={`w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border font-bold transition-colors ${
            error
              ? 'border-rose-500 ring-1 ring-rose-500'
              : 'border-slate-200 dark:border-slate-700 focus:border-[#800000]'
          } text-slate-800 dark:text-slate-100`}
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
        >
          <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {error && <p className="text-[10px] text-rose-500 font-bold mt-1">{error}</p>}

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full max-h-48 overflow-y-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl py-1 text-xs">
          {filtered.length > 0 ? (
            filtered.map(dept => (
              <button
                key={dept}
                type="button"
                onClick={() => {
                  onChange(dept);
                  setSearchTerm(dept);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2 font-semibold hover:bg-amber-50 dark:hover:bg-slate-700 flex items-center justify-between transition-colors ${
                  value === dept ? 'bg-amber-100/60 dark:bg-amber-950/40 text-[#800000] dark:text-amber-300 font-bold' : 'text-slate-700 dark:text-slate-200'
                }`}
              >
                <span>{dept}</span>
                {value === dept && <Check size={14} className="text-[#800000] dark:text-amber-300" />}
              </button>
            ))
          ) : (
            <div className="px-3.5 py-2 text-[11px] text-slate-400 font-medium">
              Custom department "{searchTerm}" (Selected)
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface MultiRolePickerProps {
  selectedRoles: UserRole[];
  onChange: (roles: UserRole[]) => void;
  required?: boolean;
  error?: string;
}

export const MultiRolePicker: React.FC<MultiRolePickerProps> = ({
  selectedRoles = [],
  onChange,
  required = true,
  error
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleRole = (r: UserRole) => {
    if (selectedRoles.includes(r)) {
      onChange(selectedRoles.filter(role => role !== r));
    } else {
      onChange([...selectedRoles, r]);
    }
  };

  const removeRole = (r: UserRole, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selectedRoles.filter(role => role !== r));
  };

  const filteredRoles = ALL_ROLES.filter(r =>
    r.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div ref={wrapperRef} className="relative w-full space-y-1">
      <label className="block font-bold text-slate-700 dark:text-slate-300 text-xs">
        Assigned Roles (RBAC) {required && <span className="text-rose-500">*</span>}
      </label>

      {/* Trigger & Chips Container */}
      <div
        onClick={() => setIsOpen(true)}
        className={`min-h-[40px] p-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border cursor-pointer transition-colors flex flex-wrap items-center gap-1.5 ${
          error || (required && selectedRoles.length === 0)
            ? 'border-rose-400 ring-1 ring-rose-400'
            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
        }`}
      >
        {selectedRoles.length === 0 ? (
          <span className="text-slate-400 text-xs px-2 py-1 font-medium">Select one or more roles...</span>
        ) : (
          selectedRoles.map(r => (
            <span
              key={r}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#800000] text-amber-300 font-bold text-[11px] shadow-xs"
            >
              <span>{r}</span>
              <button
                type="button"
                onClick={e => removeRole(r, e)}
                className="hover:bg-rose-900/60 p-0.5 rounded-full transition-colors cursor-pointer"
                title={`Remove ${r}`}
              >
                <X size={12} />
              </button>
            </span>
          ))
        )}

        <div className="ml-auto pl-1 pr-1 flex items-center text-slate-400">
          <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {error && <p className="text-[10px] text-rose-500 font-bold">{error}</p>}

      {/* Role Picker Dropdown */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-2 text-xs space-y-2 max-h-64 overflow-hidden flex flex-col">
          {/* Search bar inside role dropdown */}
          <div className="relative shrink-0">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              autoFocus
              placeholder="Search roles..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border-none font-semibold text-xs focus:ring-1 focus:ring-[#800000]"
            />
          </div>

          <div className="overflow-y-auto flex-1 space-y-0.5 pr-1">
            {filteredRoles.map(r => {
              const isSelected = selectedRoles.includes(r);
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => toggleRole(r)}
                  className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between font-bold transition-all ${
                    isSelected
                      ? 'bg-amber-100 dark:bg-amber-950/60 text-[#800000] dark:text-amber-300'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Shield size={13} className={isSelected ? 'text-[#800000] dark:text-amber-300' : 'text-slate-400'} />
                    <span>{r}</span>
                  </div>
                  {isSelected && <Check size={14} className="text-[#800000] dark:text-amber-300" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
