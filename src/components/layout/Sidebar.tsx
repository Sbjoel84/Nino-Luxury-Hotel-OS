import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Bed,
  CalendarCheck,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  DollarSign,
  FileText,
  Hotel,
  Key,
  LayoutDashboard,
  LogOut,
  Moon,
  Package,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Sun,
  Truck,
  UserCheck,
  Users,
  UtensilsCrossed,
  Wrench,
  X,
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useUIStore } from '../../stores/uiStore';
import { Permission, UserRole } from '../../types';
import { getRoleLabel, hasPermission } from '../../utils/permissions';
import { getRepositoryMode } from '../../services';

const ROUTE_PERMISSIONS: Record<string, Permission> = {
  '/dashboard': 'dashboard.view',
  '/frontdesk': 'frontdesk.checkin',
  '/check-in': 'frontdesk.checkin',
  '/check-out': 'frontdesk.checkout',
  '/reservations': 'reservations.view',
  '/guests': 'guests.view',
  '/rooms': 'rooms.view',
  '/room-types': 'rooms.view',
  '/housekeeping': 'housekeeping.view',
  '/restaurant/pos': 'pos.access',
  '/restaurant/orders': 'pos.access',
  '/restaurant/menu': 'pos.access',
  '/inventory': 'inventory.view',
  '/inventory/transactions': 'inventory.view',
  '/procurement/orders': 'procurement.manage',
  '/procurement/suppliers': 'procurement.manage',
  '/finance/summary': 'finance.view',
  '/finance/payments': 'finance.view',
  '/finance/expenses': 'finance.view',
  '/maintenance': 'maintenance.view',
  '/reports': 'reports.view',
  '/users': 'users.manage',
  '/audit': 'audit.view',
  '/settings': 'settings.manage',
};

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  permission?: string;
  badge?: string;
  children?: { label: string; path: string }[];
}

export const Sidebar: React.FC = () => {
  const { user, switchRole, logout } = useAuthStore();
  const { sidebarOpen, setSidebarOpen } = useUIStore();
  const location = useLocation();
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    'Front Desk': true,
    Rooms: true,
  });

  const toggleGroup = (label: string) => {
    setExpandedGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const navItems: NavItem[] = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      label: 'Front Desk',
      path: '/frontdesk',
      icon: <Hotel className="w-4 h-4" />,
      children: [
        { label: 'Front Desk Overview', path: '/frontdesk' },
        { label: 'Reservations', path: '/reservations' },
        { label: 'Check-In Workflow', path: '/check-in' },
        { label: 'Check-Out Settlement', path: '/check-out' },
        { label: 'Guest Directory', path: '/guests' },
      ],
    },
    {
      label: 'Rooms',
      path: '/rooms',
      icon: <Bed className="w-4 h-4" />,
      children: [
        { label: 'Room Overview', path: '/rooms' },
        { label: 'Room Types & Rates', path: '/room-types' },
      ],
    },
    {
      label: 'Housekeeping',
      path: '/housekeeping',
      icon: <Sparkles className="w-4 h-4" />,
    },
    {
      label: 'Restaurant & Bar',
      path: '/restaurant/pos',
      icon: <UtensilsCrossed className="w-4 h-4" />,
      children: [
        { label: 'POS Terminal', path: '/restaurant/pos' },
        { label: 'Orders & Folios', path: '/restaurant/orders' },
        { label: 'Menu Catalog', path: '/restaurant/menu' },
      ],
    },
    {
      label: 'Inventory',
      path: '/inventory',
      icon: <Package className="w-4 h-4" />,
      children: [
        { label: 'Stock Overview', path: '/inventory' },
        { label: 'Stock Transactions', path: '/inventory/transactions' },
      ],
    },
    {
      label: 'Procurement',
      path: '/procurement/orders',
      icon: <Truck className="w-4 h-4" />,
      children: [
        { label: 'Purchase Orders', path: '/procurement/orders' },
        { label: 'Suppliers Directory', path: '/procurement/suppliers' },
      ],
    },
    {
      label: 'Finance',
      path: '/finance/summary',
      icon: <DollarSign className="w-4 h-4" />,
      children: [
        { label: 'Financial Dashboard', path: '/finance/summary' },
        { label: 'Payments Registry', path: '/finance/payments' },
        { label: 'Expense Vouchers', path: '/finance/expenses' },
      ],
    },
    {
      label: 'Maintenance',
      path: '/maintenance',
      icon: <Wrench className="w-4 h-4" />,
    },
    {
      label: 'Reports',
      path: '/reports',
      icon: <FileText className="w-4 h-4" />,
    },
    {
      label: 'Admin Panel',
      path: '/users',
      icon: <Users className="w-4 h-4" />,
    },
    {
      label: 'Audit Logs',
      path: '/audit',
      icon: <ShieldCheck className="w-4 h-4" />,
    },
    {
      label: 'Settings',
      path: '/settings',
      icon: <Settings className="w-4 h-4" />,
    },
  ];

  // Only show pages the signed-in user has been granted (mirrors ProtectedRoute in AppRoutes).
  const canSee = (path: string) => {
    const permission = ROUTE_PERMISSIONS[path];
    return !permission || hasPermission(user, permission);
  };
  const visibleNavItems = navItems
    .map((item) => (item.children ? { ...item, children: item.children.filter((c) => canSee(c.path)) } : item))
    .filter((item) => (item.children ? item.children.length > 0 : canSee(item.path)));

  const roles: UserRole[] = [
    'super_admin',
    'management',
    'reception',
    'housekeeping',
    'restaurant_bar',
    'inventory_officer',
    'procurement_officer',
    'finance_officer',
    'maintenance_officer',
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/80 lg:hidden backdrop-blur-xs"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col w-64 bg-neutral-900 border-r border-neutral-800 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Hotel Identity */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-neutral-800 bg-neutral-950/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-500 font-bold text-sm tracking-wide">
              HOS
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-white leading-none">
                Nino Luxury Hotel
              </h1>
              <p className="text-[11px] text-neutral-400 mt-1">Kubwa, Abuja • PMS</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1 rounded-md text-neutral-400 hover:text-white lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Database backend mode badge */}
        <div className="px-4 py-2 border-b border-neutral-800/60 bg-neutral-950/20 flex items-center justify-between text-[11px]">
          <span className="text-neutral-400">Data Source:</span>
          <span
            className={`font-medium ${
              getRepositoryMode() === 'supabase' ? 'text-emerald-400' : 'text-amber-400'
            }`}
          >
            {getRepositoryMode() === 'supabase' ? 'Supabase Live' : 'Mock Dev Mode'}
          </span>
        </div>

        {/* Navigation list */}
        <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {visibleNavItems.map((item) => {
            const hasChildren = item.children && item.children.length > 0;
            const isGroupActive = hasChildren
              ? item.children!.some((c) => location.pathname === c.path)
              : location.pathname === item.path;
            const isExpanded = expandedGroups[item.label] ?? false;

            if (hasChildren) {
              return (
                <div key={item.label} className="space-y-0.5">
                  <button
                    onClick={() => toggleGroup(item.label)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                      isGroupActive
                        ? 'text-amber-400 bg-amber-500/10'
                        : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {item.icon}
                      <span>{item.label}</span>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="pl-8 pr-1 py-1 space-y-0.5 border-l border-neutral-800/80 ml-4">
                      {item.children!.map((sub) => {
                        const isSubActive = location.pathname === sub.path;
                        return (
                          <NavLink
                            key={sub.path}
                            to={sub.path}
                            onClick={() => {
                              if (window.innerWidth < 1024) setSidebarOpen(false);
                            }}
                            className={`block px-2.5 py-1.5 text-xs rounded-md transition-colors ${
                              isSubActive
                                ? 'text-white font-medium bg-neutral-800'
                                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40'
                            }`}
                          >
                            {sub.label}
                          </NavLink>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => {
                  if (window.innerWidth < 1024) setSidebarOpen(false);
                }}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'text-white bg-amber-600 font-semibold shadow-xs'
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60'
                  }`
                }
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Role Simulator Switcher & User Profile */}
        <div className="p-3 border-t border-neutral-800 bg-neutral-950/40 space-y-2.5">
          {/* Theme Toggle in Sidebar */}
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-medium text-neutral-400">Interface Theme:</span>
            <button
              onClick={() => useUIStore.getState().toggleTheme()}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[11px] font-medium transition-colors cursor-pointer border border-neutral-700/60"
            >
              {useUIStore((s) => s.theme) === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-sky-400" />
                  <span>Dark Mode</span>
                </>
              )}
            </button>
          </div>

          {/* Role selector for testing all permissions */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-semibold tracking-wider text-neutral-400 block px-1">
              Active Role Simulator
            </label>
            <select
              value={user?.role || 'super_admin'}
              onChange={(e) => switchRole(e.target.value as UserRole)}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-md text-[11px] text-neutral-200 px-2 py-1 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
            >
              {roles.map((r) => (
                <option key={r} value={r}>
                  {getRoleLabel(r)}
                </option>
              ))}
            </select>
          </div>

          {/* Current Staff Card */}
          <div className="flex items-center justify-between p-2 rounded-lg bg-neutral-800/50 border border-neutral-700/50">
            <div className="min-w-0 pr-2">
              <p className="text-xs font-medium text-neutral-200 truncate">{user?.fullName}</p>
              <p className="text-[10px] text-neutral-400 truncate">{user?.email}</p>
            </div>
            <button
              onClick={() => logout()}
              title="Sign Out"
              className="p-1.5 rounded-md hover:bg-neutral-700 text-neutral-400 hover:text-rose-400 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
