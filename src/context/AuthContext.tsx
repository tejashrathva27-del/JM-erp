/**
 * @license
 * Version 1.0.0
 * Jamavat Masala ERP - Role Based Authentication Context
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types/erp';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole | null;
  login: (usernameOrEmail: string, pass: string) => Promise<boolean>;
  presetLogin: (role: UserRole) => void;
  logout: () => void;
  hasRole: (allowedRoles: UserRole[]) => boolean;
  loginError: string | null;
  setLoginError: (err: string | null) => void;
  updateCurrentUserProfile: (data: Partial<UserProfile>) => void;
}

const PRESET_USERS: Partial<Record<UserRole, UserProfile>> = {
  Owner: {
    uid: 'owner-001',
    email: 'owner@jamavatmasala.com',
    username: 'owner',
    displayName: 'Rajesh Sharma',
    role: 'Owner',
    phone: '+91 98250 11223',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
    status: 'Active'
  },
  Admin: {
    uid: 'admin-001',
    email: 'admin@jamavatmasala.com',
    username: 'admin',
    displayName: 'Super Admin',
    role: 'Admin',
    phone: '+91 98250 11000',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
    status: 'Active'
  },
  MD: {
    uid: 'md-002',
    email: 'tejashrathva27@gmail.com',
    username: 'tejash.rathva',
    displayName: 'Tejas Rathva',
    role: 'MD',
    phone: '+91 98765 10002',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
    status: 'Active'
  },
  HR: {
    uid: 'hr-003',
    email: 'priya.hr@jamavatmasala.com',
    username: 'priya.patel',
    displayName: 'Priya Patel',
    role: 'HR',
    phone: '+91 98980 44332',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
    status: 'Active'
  },
  'Sales Manager': {
    uid: 'sales-001',
    email: 'suresh.sales@jamavatmasala.com',
    username: 'suresh.sales',
    displayName: 'Suresh Kumar',
    role: 'Sales Manager',
    phone: '+91 98980 11223',
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
    status: 'Active'
  },
  'Sales Executive': {
    uid: 'sales-002',
    email: 'amit.sales@jamavatmasala.com',
    username: 'amit.exec',
    displayName: 'Amit Shah',
    role: 'Sales Executive',
    phone: '+91 98980 22334',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
    status: 'Active'
  },
  'Production Manager': {
    uid: 'prod-001',
    email: 'ramesh.prod@jamavatmasala.com',
    username: 'ramesh.prod',
    displayName: 'Ramesh Solanki',
    role: 'Production Manager',
    phone: '+91 98980 33445',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
    status: 'Active'
  },
  'Inventory Manager': {
    uid: 'inv-001',
    email: 'karan.inv@jamavatmasala.com',
    username: 'karan.inv',
    displayName: 'Karan Mehta',
    role: 'Inventory Manager',
    phone: '+91 98980 55667',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
    status: 'Active'
  },
  Accountant: {
    uid: 'acc-001',
    email: 'deepak.acc@jamavatmasala.com',
    username: 'deepak.acc',
    displayName: 'Deepak Joshi',
    role: 'Accountant',
    phone: '+91 98980 66778',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
    status: 'Active'
  },
  'Delivery Staff': {
    uid: 'del-001',
    email: 'vijay.del@jamavatmasala.com',
    username: 'vijay.driver',
    displayName: 'Vijay Parmar',
    role: 'Delivery Staff',
    phone: '+91 98980 77889',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
    status: 'Active'
  },
  Employee: {
    uid: 'emp-001',
    email: 'tej.rathva@jamavatmasala.com',
    username: 'tej.rathva',
    employeeId: 'EMP-000001',
    displayName: 'Tej Rathva',
    role: 'Employee',
    phone: '+91 98250 48210',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
    status: 'Active'
  },
  'Marketing Head': {
    uid: 'mkt-004',
    email: 'vikram.mkt@jamavatmasala.com',
    username: 'vikram.mkt',
    displayName: 'Vikram Desai',
    role: 'Marketing Head',
    phone: '+91 97230 66554',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
    status: 'Active'
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('jm_erp_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return PRESET_USERS['MD'];
      }
    }
    // Default logged in as MD for instant working app per requirements
    return PRESET_USERS['MD'];
  });

  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      localStorage.setItem('jm_erp_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('jm_erp_user');
    }
  }, [user]);

  const login = async (usernameOrEmail: string, pass: string): Promise<boolean> => {
    setLoginError(null);
    const cleaned = usernameOrEmail.trim().toLowerCase();

    // Check against local saved employees in localStorage if available
    const storedEmployeesRaw = localStorage.getItem('jm_erp_employees');
    if (storedEmployeesRaw) {
      try {
        const storedEmps = JSON.parse(storedEmployeesRaw);
        const matchedEmp = storedEmps.find((e: any) => 
          !e.isDeleted &&
          (e.username?.toLowerCase() === cleaned || e.email?.toLowerCase() === cleaned || e.code?.toLowerCase() === cleaned)
        );

        if (matchedEmp) {
          if (matchedEmp.isLoginDisabled) {
            setLoginError('Your login account has been disabled. Please contact HR or Administrator.');
            return false;
          }
          if (matchedEmp.status === 'Dismissed' || matchedEmp.status === 'Inactive') {
            setLoginError(`Account login restricted. Current status: ${matchedEmp.status}.`);
            return false;
          }

          // Authenticate match
          const empRoles: UserRole[] = matchedEmp.roles && matchedEmp.roles.length > 0
            ? matchedEmp.roles
            : [matchedEmp.role || 'Employee'];

          const loggedInUser: UserProfile = {
            uid: matchedEmp.id,
            email: matchedEmp.email,
            username: matchedEmp.username,
            employeeId: matchedEmp.code,
            displayName: matchedEmp.name,
            role: empRoles[0],
            roles: empRoles,
            phone: matchedEmp.phone,
            avatarUrl: matchedEmp.photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
            createdAt: matchedEmp.createdAt,
            updatedAt: new Date().toISOString(),
            status: 'Active'
          };
          setUser(loggedInUser);
          return true;
        }
      } catch (err) {
        console.error('Error checking stored employees', err);
      }
    }

    // Check presets
    for (const presetRole of Object.keys(PRESET_USERS) as UserRole[]) {
      const preset = PRESET_USERS[presetRole];
      if (
        preset.email.toLowerCase() === cleaned ||
        preset.username?.toLowerCase() === cleaned ||
        preset.role.toLowerCase() === cleaned
      ) {
        setUser({
          ...preset,
          roles: preset.roles || [preset.role]
        });
        return true;
      }
    }

    // Default fallback if typing standard credentials
    if (cleaned.length >= 2 && pass.length >= 2) {
      setUser({
        uid: 'user-' + Date.now(),
        email: cleaned.includes('@') ? cleaned : `${cleaned}@jamavatmasala.com`,
        username: cleaned,
        displayName: cleaned.toUpperCase(),
        role: 'MD',
        roles: ['MD'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'Active'
      });
      return true;
    }

    setLoginError('Invalid Username/Email or Password. Please check your credentials.');
    return false;
  };

  const presetLogin = (role: UserRole) => {
    const roleKey = (role === 'Managing Director' ? 'MD' : role) as UserRole;
    const targetUser = PRESET_USERS[roleKey] || PRESET_USERS['MD'];
    setUser({
      ...targetUser,
      roles: targetUser.roles || [targetUser.role]
    });
    setLoginError(null);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('jm_erp_user');
  };

  const updateCurrentUserProfile = (data: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...data, updatedAt: new Date().toISOString() };
    setUser(updated);
  };

  const hasRole = (allowedRoles: UserRole[]): boolean => {
    if (!user) return false;
    const userRoles: UserRole[] = user.roles && user.roles.length > 0
      ? user.roles
      : (user.role ? [user.role] : []);

    if (userRoles.includes('Owner') || user.role === 'Owner') return true;
    if (userRoles.includes('MD') || user.role === 'MD' || userRoles.includes('Managing Director') || user.role === 'Managing Director') {
      return true;
    }
    return allowedRoles.some(r => userRoles.includes(r));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user ? user.role : null,
        login,
        presetLogin,
        logout,
        hasRole,
        loginError,
        setLoginError,
        updateCurrentUserProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

