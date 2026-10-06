import React, { useState } from 'react';
import { Building, CheckCircle, Database, DollarSign, Hotel, Moon, Save, Shield, Sun } from 'lucide-react';
import { useHotelSettings } from '../../hooks/useHotelData';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { getRepositoryMode, setRepositoryMode } from '../../services';
import { isSupabaseConfigured } from '../../services/supabase/client';
import { useUIStore } from '../../stores/uiStore';

export const SettingsPage: React.FC = () => {
  const { data: settings, updateSettings } = useHotelSettings();
  const { addToast, theme, setTheme } = useUIStore();

  const [formData, setFormData] = useState({
    hotelName: settings?.hotelName || 'Nino Luxury Hotel',
    address: settings?.address || 'Plot 428, Arab Road, Phase 4 Junction',
    district: settings?.district || 'Kubwa',
    city: settings?.city || 'Abuja',
    state: settings?.state || 'Federal Capital Territory',
    country: settings?.country || 'Nigeria',
    phone: settings?.phone || '+234 803 555 0192',
    altPhone: settings?.altPhone || '+234 812 444 8831',
    email: settings?.email || 'frontdesk@ninoluxuryhotel.ng',
    website: settings?.website || 'https://ninoluxuryhotel.ng',
    checkInTime: settings?.checkInTime || '14:00',
    checkOutTime: settings?.checkOutTime || '12:00',
    vatRate: settings?.vatRate || 7.5,
    serviceChargeRate: settings?.serviceChargeRate || 5.0,
    currencySymbol: settings?.currencySymbol || '₦',
    currencyCode: settings?.currencyCode || 'NGN',
    bankName: settings?.bankDetails?.bankName || 'Zenith Bank Plc',
    accountName: settings?.bankDetails?.accountName || 'Nino Luxury Hotel Hospitality Ltd',
    accountNumber: settings?.bankDetails?.accountNumber || '1015694200',
  });

  const [currentMode, setCurrentMode] = useState<'supabase' | 'mock'>(getRepositoryMode());

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings.mutateAsync({
      hotelName: formData.hotelName,
      address: formData.address,
      district: formData.district,
      city: formData.city,
      state: formData.state,
      country: formData.country,
      phone: formData.phone,
      altPhone: formData.altPhone,
      email: formData.email,
      website: formData.website,
      checkInTime: formData.checkInTime,
      checkOutTime: formData.checkOutTime,
      vatRate: formData.vatRate,
      serviceChargeRate: formData.serviceChargeRate,
      currencySymbol: formData.currencySymbol,
      currencyCode: formData.currencyCode,
      bankDetails: {
        bankName: formData.bankName,
        accountName: formData.accountName,
        accountNumber: formData.accountNumber,
      },
    });
  };

  const handleToggleMode = (mode: 'supabase' | 'mock') => {
    setRepositoryMode(mode);
    setCurrentMode(mode);
    addToast({
      type: 'info',
      title: 'Data Repository Switched',
      message: `System active repository is now set to ${
        mode === 'supabase' ? 'Supabase Database' : 'Mock Development State'
      }`,
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-neutral-900 border border-neutral-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Hotel Configuration & Preferences</h1>
          <p className="text-xs text-neutral-400 mt-1">
            Property profile, Nigerian VAT tax rates, banking details & Supabase integration
          </p>
        </div>
      </div>

      {/* Interface Theme & Appearance Card */}
      <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
              {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Visual Interface Theme</h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Toggle between High-Contrast Dark Executive Mode and Clean Light Mode
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                theme === 'dark'
                  ? 'bg-amber-600 text-white border-amber-500 shadow-sm'
                  : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white'
              }`}
            >
              <Moon className="w-3.5 h-3.5 text-sky-400" />
              <span>Dark Mode</span>
            </button>
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                theme === 'light'
                  ? 'bg-amber-600 text-white border-amber-500 shadow-sm'
                  : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white'
              }`}
            >
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>Light Mode</span>
            </button>
          </div>
        </div>
      </div>

      {/* Supabase Integration & Data Mode Card */}
      <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Database Integration Architecture</h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Clean separation layer between Supabase and Development Repository
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-neutral-200">Supabase Connection:</span>
              <span
                className={`font-mono font-bold ${
                  isSupabaseConfigured() ? 'text-emerald-400' : 'text-neutral-500'
                }`}
              >
                {isSupabaseConfigured() ? 'Connected' : 'Pending Credentials'}
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              When ready, add your credentials in <code>.env</code> (
              <code>VITE_SUPABASE_URL</code> & <code>VITE_SUPABASE_ANON_KEY</code>). All services
              will automatically connect without changing component code.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
            <span className="text-xs font-semibold text-neutral-200 block">
              Active Repository Mode:
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleToggleMode('mock')}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                  currentMode === 'mock'
                    ? 'bg-amber-600 text-white border-amber-500'
                    : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
                }`}
              >
                Mock Development Mode
              </button>
              <button
                type="button"
                onClick={() => handleToggleMode('supabase')}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                  currentMode === 'supabase'
                    ? 'bg-amber-600 text-white border-amber-500'
                    : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
                }`}
              >
                Supabase Live Mode
              </button>
            </div>
            <p className="text-[10px] text-neutral-500">
              Mock mode persists interactive check-ins, payments & orders in browser storage.
            </p>
          </div>
        </div>
      </div>

      {/* Main Hotel Profile Form */}
      <form onSubmit={handleSave} className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-6">
        <h3 className="text-sm font-bold text-white border-b border-neutral-800 pb-3">
          Hotel Business Profile & Official Registration
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Hotel Legal Trade Name"
            required
            value={formData.hotelName}
            onChange={(e) => setFormData({ ...formData, hotelName: e.target.value })}
          />
          <Input
            label="Street Address"
            required
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
          <Input
            label="District / Area"
            required
            value={formData.district}
            onChange={(e) => setFormData({ ...formData, district: e.target.value })}
          />
          <Input
            label="City"
            required
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
          />
          <Input
            label="Primary Reservations Phone"
            required
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
          <Input
            label="Official Front Desk Email"
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <Input
            label="Standard Check-In Time"
            value={formData.checkInTime}
            onChange={(e) => setFormData({ ...formData, checkInTime: e.target.value })}
          />
          <Input
            label="Standard Check-Out Time"
            value={formData.checkOutTime}
            onChange={(e) => setFormData({ ...formData, checkOutTime: e.target.value })}
          />
        </div>

        <h3 className="text-sm font-bold text-white border-b border-neutral-800 pb-3 pt-3">
          Nigerian Tax Rates & Settlement Bank Details
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Value Added Tax (VAT %)"
            type="number"
            step="0.1"
            value={formData.vatRate}
            onChange={(e) => setFormData({ ...formData, vatRate: parseFloat(e.target.value) || 0 })}
          />
          <Input
            label="Service Charge (%)"
            type="number"
            step="0.1"
            value={formData.serviceChargeRate}
            onChange={(e) =>
              setFormData({ ...formData, serviceChargeRate: parseFloat(e.target.value) || 0 })
            }
          />
          <Input
            label="Operating Currency"
            disabled
            value={`${formData.currencySymbol} (${formData.currencyCode})`}
          />
          <Input
            label="Hotel Settlement Bank"
            value={formData.bankName}
            onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
          />
          <Input
            label="Account Name"
            value={formData.accountName}
            onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
          />
          <Input
            label="Account Number (NUBAN)"
            value={formData.accountNumber}
            onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
          />
        </div>

        <div className="flex justify-end pt-4 border-t border-neutral-800">
          <Button variant="gold" size="md" type="submit" icon={<Save className="w-4 h-4" />}>
            Save System Settings
          </Button>
        </div>
      </form>
    </div>
  );
};
