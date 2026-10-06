import React, { useState } from 'react';
import { Check, RotateCcw, ShieldCheck, ShieldOff, UserPlus } from 'lucide-react';
import { useUsers } from '../../hooks/useHotelData';
import { useAuthStore } from '../../stores/authStore';
import { formatDateTime } from '../../utils/date';
import {
  ALL_PERMISSIONS,
  PAGE_ACCESS_GROUPS,
  ROLE_PERMISSIONS,
  getRoleLabel,
  getUserPermissions,
} from '../../utils/permissions';
import { Button } from '../../components/ui/Button';
import { DataTable } from '../../components/ui/DataTable';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Select } from '../../components/ui/Select';
import { Permission, UserProfile, UserRole } from '../../types';

const ROLES: UserRole[] = [
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

const DEPARTMENTS = [
  'Executive Management',
  'General Operations',
  'Front Desk',
  'Housekeeping',
  'Food & Beverage',
  'Store & Inventory',
  'Procurement',
  'Finance & Accounts',
  'Engineering & Maintenance',
];

const sameSet = (a: Permission[], b: Permission[]) =>
  a.length === b.length && a.every((p) => b.includes(p));

interface StaffForm {
  fullName: string;
  email: string;
  phone: string;
  department: string;
  role: UserRole;
  isActive: boolean;
  permissions: Permission[];
}

const emptyForm = (): StaffForm => ({
  fullName: '',
  email: '',
  phone: '',
  department: DEPARTMENTS[2],
  role: 'reception',
  isActive: true,
  permissions: [...ROLE_PERMISSIONS.reception],
});

export const UsersPage: React.FC = () => {
  const { data: users = [], isLoading, createUser, updateUser } = useUsers();
  const currentUser = useAuthStore((s) => s.user);

  // null = closed, 'new' = adding a staff member, otherwise the user being edited
  const [editing, setEditing] = useState<UserProfile | 'new' | null>(null);
  const [form, setForm] = useState<StaffForm>(emptyForm);
  const [formError, setFormError] = useState('');

  const isNew = editing === 'new';
  const isSuperAdmin = form.role === 'super_admin';
  const roleDefaults = ROLE_PERMISSIONS[form.role];
  const isCustom = !isSuperAdmin && !sameSet(form.permissions, roleDefaults);

  const openAdd = () => {
    setForm(emptyForm());
    setFormError('');
    setEditing('new');
  };

  const openEdit = (u: UserProfile) => {
    setForm({
      fullName: u.fullName,
      email: u.email,
      phone: u.phone || '',
      department: u.department,
      role: u.role,
      isActive: u.isActive,
      permissions: [...getUserPermissions(u)],
    });
    setFormError('');
    setEditing(u);
  };

  const setField = <K extends keyof StaffForm>(key: K, value: StaffForm[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  // Changing role resets page access to that role's defaults.
  const changeRole = (role: UserRole) =>
    setForm((f) => ({ ...f, role, permissions: [...ROLE_PERMISSIONS[role]] }));

  const togglePermission = (p: Permission) =>
    setForm((f) => ({
      ...f,
      permissions: f.permissions.includes(p)
        ? f.permissions.filter((x) => x !== p)
        : [...f.permissions, p],
    }));

  const setGroup = (perms: Permission[], grant: boolean) =>
    setForm((f) => ({
      ...f,
      permissions: grant
        ? Array.from(new Set([...f.permissions, ...perms]))
        : f.permissions.filter((p) => !perms.includes(p)),
    }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const fullName = form.fullName.trim();
    const email = form.email.trim().toLowerCase();
    if (!fullName) return setFormError('Full name is required.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setFormError('Enter a valid email address.');
    if (!isSuperAdmin && form.permissions.length === 0) {
      return setFormError('Grant at least one page, or deactivate the account instead.');
    }

    const editingSelf = !isNew && editing?.id === currentUser?.id;
    if (editingSelf && !isSuperAdmin && (!form.permissions.includes('users.manage') || !form.isActive)) {
      return setFormError('You cannot remove your own access to the Admin Panel.');
    }

    // Store custom access only when it differs from the role defaults; null means "follow role".
    const permissions = isCustom ? form.permissions : null;
    const payload = {
      fullName,
      email,
      phone: form.phone.trim() || undefined,
      department: form.department,
      role: form.role,
      isActive: form.isActive,
      permissions,
    };

    try {
      if (isNew) {
        await createUser.mutateAsync(payload);
      } else if (editing) {
        await updateUser.mutateAsync({ id: editing.id, updates: payload });
      }
      setEditing(null);
    } catch {
      // Error toast is shown by the mutation.
    }
  };

  const columns = [
    {
      header: 'Staff Member',
      accessorKey: 'fullName' as keyof UserProfile,
      sortable: true,
      cell: (u: UserProfile) => (
        <div>
          <span className="font-semibold text-neutral-200 text-sm">{u.fullName}</span>
          <p className="text-[10px] text-neutral-400 font-mono">{u.email}</p>
        </div>
      ),
    },
    {
      header: 'Department',
      accessorKey: 'department' as keyof UserProfile,
      cell: (u: UserProfile) => <span className="text-xs text-neutral-300">{u.department}</span>,
    },
    {
      header: 'Assigned Role',
      cell: (u: UserProfile) => (
        <span className="text-xs font-semibold text-amber-400">{getRoleLabel(u.role)}</span>
      ),
    },
    {
      header: 'Page Access',
      cell: (u: UserProfile) => {
        const count = getUserPermissions(u).length;
        const custom = u.role !== 'super_admin' && Array.isArray(u.permissions);
        return (
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-xs text-neutral-300 tabular-nums">
              {u.role === 'super_admin' ? 'Full' : `${count}/${ALL_PERMISSIONS.length}`}
            </span>
            {custom && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-sky-500/10 text-sky-400 border border-sky-500/20">
                Custom
              </span>
            )}
          </div>
        );
      },
    },
    {
      header: 'Status',
      cell: (u: UserProfile) =>
        u.isActive ? (
          <span className="text-xs font-medium text-emerald-400">Active</span>
        ) : (
          <span className="text-xs font-medium text-rose-400">Deactivated</span>
        ),
    },
    {
      header: 'Last Active',
      cell: (u: UserProfile) => (
        <span className="font-mono text-xs text-neutral-400 tabular-nums">
          {u.lastLogin ? formatDateTime(u.lastLogin).split(',')[0] : '—'}
        </span>
      ),
    },
    {
      header: 'Action',
      align: 'right' as const,
      cell: (u: UserProfile) => (
        <Button variant="outline" size="sm" onClick={() => openEdit(u)}>
          Manage Access
        </Button>
      ),
    },
  ];

  const saving = createUser.isPending || updateUser.isPending;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-neutral-900 border border-neutral-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Admin Panel</h1>
          <p className="text-xs text-neutral-400 mt-1">
            Departmental user directory, permission scopes & role assignments
          </p>
        </div>
        <Button variant="gold" size="sm" icon={<UserPlus className="w-4 h-4" />} onClick={openAdd}>
          Add Staff
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={users}
        isLoading={isLoading}
        searchPlaceholder="Search staff by name, email or department..."
      />

      {editing && (
        <Modal
          isOpen={Boolean(editing)}
          onClose={() => setEditing(null)}
          title={isNew ? 'Add Staff Member' : `Manage Access: ${editing.fullName}`}
          description={
            isNew
              ? 'Create a staff account, assign a role and choose which pages they can open'
              : `${editing.department} • ${getRoleLabel(editing.role)}`
          }
          size="xl"
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                required
                value={form.fullName}
                onChange={(e) => setField('fullName', e.target.value)}
              />
              <Input
                label="Email"
                type="email"
                required
                value={form.email}
                onChange={(e) => setField('email', e.target.value)}
              />
              <Input
                label="Phone"
                value={form.phone}
                onChange={(e) => setField('phone', e.target.value)}
                placeholder="+234 ..."
              />
              <Select
                label="Department"
                value={form.department}
                onChange={(e) => setField('department', e.target.value)}
              >
                {Array.from(new Set([...DEPARTMENTS, form.department])).map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </Select>
              <Select
                label="Permission Role"
                value={form.role}
                onChange={(e) => changeRole(e.target.value as UserRole)}
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {getRoleLabel(r)}
                  </option>
                ))}
              </Select>
              <label className="flex items-center gap-2.5 self-end pb-2 text-xs text-neutral-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setField('isActive', e.target.checked)}
                  className="w-4 h-4 accent-amber-500"
                />
                Account active (can sign in)
              </label>
            </div>

            <div className="space-y-3 pt-4 border-t border-neutral-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-sm font-semibold text-neutral-100">Page Access</h4>
                  <p className="text-[11px] text-neutral-400">
                    {isSuperAdmin
                      ? 'Super Administrators always have access to every page.'
                      : isCustom
                        ? 'Custom access — differs from the role defaults.'
                        : `Using the default access for ${getRoleLabel(form.role)}.`}
                  </p>
                </div>
                {!isSuperAdmin && (
                  <div className="flex flex-wrap gap-1.5">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      icon={<ShieldCheck className="w-3.5 h-3.5" />}
                      onClick={() => setGroup(ALL_PERMISSIONS, true)}
                    >
                      Grant All
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      icon={<ShieldOff className="w-3.5 h-3.5" />}
                      onClick={() => setGroup(ALL_PERMISSIONS, false)}
                    >
                      Remove All
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      icon={<RotateCcw className="w-3.5 h-3.5" />}
                      disabled={!isCustom}
                      onClick={() => setField('permissions', [...roleDefaults])}
                    >
                      Reset to Role
                    </Button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {PAGE_ACCESS_GROUPS.map((group) => {
                  const groupPerms = group.items.map((i) => i.permission);
                  const allGranted = isSuperAdmin || groupPerms.every((p) => form.permissions.includes(p));
                  return (
                    <div key={group.module} className="rounded-lg border border-neutral-800 bg-neutral-950/40 p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] uppercase tracking-wider font-semibold text-neutral-400">
                          {group.module}
                        </span>
                        {!isSuperAdmin && (
                          <button
                            type="button"
                            onClick={() => setGroup(groupPerms, !allGranted)}
                            className="text-[11px] font-medium text-amber-400 hover:text-amber-300 cursor-pointer"
                          >
                            {allGranted ? 'Remove all' : 'Grant all'}
                          </button>
                        )}
                      </div>
                      <div className="space-y-1">
                        {group.items.map((item) => {
                          const granted = isSuperAdmin || form.permissions.includes(item.permission);
                          const isDefault = roleDefaults.includes(item.permission);
                          return (
                            <label
                              key={item.permission}
                              className={`flex items-center justify-between gap-2 px-2 py-1.5 rounded-md text-xs ${
                                isSuperAdmin ? 'opacity-70' : 'hover:bg-neutral-800/60 cursor-pointer'
                              }`}
                            >
                              <span className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={granted}
                                  disabled={isSuperAdmin}
                                  onChange={() => togglePermission(item.permission)}
                                  className="w-3.5 h-3.5 accent-amber-500"
                                />
                                <span className={granted ? 'text-neutral-200' : 'text-neutral-500'}>
                                  {item.label}
                                </span>
                              </span>
                              {!isSuperAdmin && granted !== isDefault && (
                                <span
                                  className={`text-[10px] font-medium ${granted ? 'text-emerald-400' : 'text-rose-400'}`}
                                >
                                  {granted ? 'Granted' : 'Removed'}
                                </span>
                              )}
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {formError && (
              <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-md px-3 py-2">
                {formError}
              </p>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-neutral-800">
              <Button type="button" variant="secondary" size="sm" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button
                variant="gold"
                size="sm"
                type="submit"
                isLoading={saving}
                icon={isNew ? <UserPlus className="w-4 h-4" /> : <Check className="w-4 h-4" />}
              >
                {isNew ? 'Add Staff Member' : 'Save Access'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
