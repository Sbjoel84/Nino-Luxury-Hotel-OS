import { Permission, UserProfile, UserRole } from '../types';

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  super_admin: [
    'dashboard.view',
    'rooms.view',
    'rooms.manage',
    'reservations.view',
    'reservations.create',
    'reservations.edit',
    'reservations.cancel',
    'frontdesk.checkin',
    'frontdesk.checkout',
    'guests.view',
    'guests.manage',
    'housekeeping.view',
    'housekeeping.manage',
    'pos.access',
    'pos.discount',
    'inventory.view',
    'inventory.manage',
    'procurement.manage',
    'finance.view',
    'finance.manage',
    'maintenance.view',
    'maintenance.manage',
    'reports.view',
    'users.manage',
    'audit.view',
    'settings.manage',
  ],

  management: [
    'dashboard.view',
    'rooms.view',
    'rooms.manage',
    'reservations.view',
    'reservations.create',
    'reservations.edit',
    'reservations.cancel',
    'frontdesk.checkin',
    'frontdesk.checkout',
    'guests.view',
    'guests.manage',
    'housekeeping.view',
    'housekeeping.manage',
    'pos.access',
    'pos.discount',
    'inventory.view',
    'procurement.manage',
    'finance.view',
    'maintenance.view',
    'maintenance.manage',
    'reports.view',
    'audit.view',
  ],

  reception: [
    'dashboard.view',
    'rooms.view',
    'reservations.view',
    'reservations.create',
    'reservations.edit',
    'reservations.cancel',
    'frontdesk.checkin',
    'frontdesk.checkout',
    'guests.view',
    'guests.manage',
    'housekeeping.view',
    'pos.access',
    'finance.view',
  ],

  housekeeping: [
    'dashboard.view',
    'rooms.view',
    'housekeeping.view',
    'housekeeping.manage',
    'maintenance.view',
  ],

  restaurant_bar: [
    'dashboard.view',
    'pos.access',
    'inventory.view',
  ],

  inventory_officer: [
    'dashboard.view',
    'inventory.view',
    'inventory.manage',
    'procurement.manage',
  ],

  procurement_officer: [
    'dashboard.view',
    'inventory.view',
    'procurement.manage',
    'finance.view',
  ],

  finance_officer: [
    'dashboard.view',
    'finance.view',
    'finance.manage',
    'reports.view',
    'audit.view',
    'reservations.view',
    'guests.view',
    'pos.access',
  ],

  maintenance_officer: [
    'dashboard.view',
    'maintenance.view',
    'maintenance.manage',
    'rooms.view',
    'inventory.view',
  ],
};

export const ALL_PERMISSIONS: Permission[] = ROLE_PERMISSIONS.super_admin;

/** Pages (and in-page actions) that can be granted to or removed from a staff member. */
export const PAGE_ACCESS_GROUPS: { module: string; items: { permission: Permission; label: string }[] }[] = [
  { module: 'Dashboard', items: [{ permission: 'dashboard.view', label: 'Dashboard' }] },
  {
    module: 'Front Desk',
    items: [
      { permission: 'frontdesk.checkin', label: 'Front Desk & Check-In' },
      { permission: 'frontdesk.checkout', label: 'Check-Out Settlement' },
      { permission: 'reservations.view', label: 'Reservations (view)' },
      { permission: 'reservations.create', label: 'Create Reservations' },
      { permission: 'reservations.edit', label: 'Edit Reservations' },
      { permission: 'reservations.cancel', label: 'Cancel Reservations' },
      { permission: 'guests.view', label: 'Guest Directory (view)' },
      { permission: 'guests.manage', label: 'Manage Guests' },
    ],
  },
  {
    module: 'Rooms',
    items: [
      { permission: 'rooms.view', label: 'Rooms & Room Types (view)' },
      { permission: 'rooms.manage', label: 'Manage Rooms' },
    ],
  },
  {
    module: 'Housekeeping',
    items: [
      { permission: 'housekeeping.view', label: 'Housekeeping (view)' },
      { permission: 'housekeeping.manage', label: 'Manage Housekeeping Tasks' },
    ],
  },
  {
    module: 'Restaurant & Bar',
    items: [
      { permission: 'pos.access', label: 'POS, Orders & Menu' },
      { permission: 'pos.discount', label: 'Apply POS Discounts' },
    ],
  },
  {
    module: 'Inventory & Procurement',
    items: [
      { permission: 'inventory.view', label: 'Inventory (view)' },
      { permission: 'inventory.manage', label: 'Manage Inventory' },
      { permission: 'procurement.manage', label: 'Purchase Orders & Suppliers' },
    ],
  },
  {
    module: 'Finance',
    items: [
      { permission: 'finance.view', label: 'Finance, Payments & Expenses (view)' },
      { permission: 'finance.manage', label: 'Manage Finance' },
    ],
  },
  {
    module: 'Maintenance',
    items: [
      { permission: 'maintenance.view', label: 'Maintenance (view)' },
      { permission: 'maintenance.manage', label: 'Manage Maintenance' },
    ],
  },
  {
    module: 'Administration',
    items: [
      { permission: 'reports.view', label: 'Reports' },
      { permission: 'users.manage', label: 'Admin Panel' },
      { permission: 'audit.view', label: 'Audit Logs' },
      { permission: 'settings.manage', label: 'Settings' },
    ],
  },
];

/** Effective permissions: the user's custom page access if set, otherwise their role's defaults. */
export function getUserPermissions(user: UserProfile | null | undefined): Permission[] {
  if (!user) return [];
  if (user.role === 'super_admin') return ALL_PERMISSIONS;
  return user.permissions ?? ROLE_PERMISSIONS[user.role] ?? [];
}

export function hasPermission(user: UserProfile | null | undefined, permission: Permission): boolean {
  if (!user || user.isActive === false) return false;
  return getUserPermissions(user).includes(permission);
}

export function getRoleLabel(role: UserRole): string {
  const map: Record<UserRole, string> = {
    super_admin: 'Super Administrator',
    management: 'General Management',
    reception: 'Front Desk / Reception',
    housekeeping: 'Housekeeping Supervisor',
    restaurant_bar: 'Restaurant & Bar Lead',
    inventory_officer: 'Inventory Officer',
    procurement_officer: 'Procurement Officer',
    finance_officer: 'Finance / Accounts Officer',
    maintenance_officer: 'Maintenance Engineer',
  };
  return map[role] || role;
}
