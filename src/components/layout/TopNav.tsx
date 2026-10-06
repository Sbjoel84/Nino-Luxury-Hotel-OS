import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Bell,
  Calendar,
  Clock,
  Menu,
  Moon,
  PlusCircle,
  Search,
  Sparkles,
  Sun,
  User,
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useUIStore } from '../../stores/uiStore';
import { Button } from '../ui/Button';
import { getRoleLabel } from '../../utils/permissions';
import { getTodayDateString } from '../../utils/date';

export const TopNav: React.FC = () => {
  const { toggleSidebar, theme, toggleTheme } = useUIStore();
  const { user } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(
        new Intl.DateTimeFormat('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        }).format(now)
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const getBreadcrumbTitle = () => {
    const path = location.pathname;
    if (path.startsWith('/dashboard')) return 'Management Overview';
    if (path.startsWith('/frontdesk')) return 'Front Desk Operations';
    if (path.startsWith('/reservations')) return 'Reservations Registry';
    if (path.startsWith('/check-in')) return 'Guest Check-In Workflow';
    if (path.startsWith('/check-out')) return 'Guest Check-Out & Settlement';
    if (path.startsWith('/guests')) return 'Guest Directory';
    if (path.startsWith('/rooms')) return 'Room Management';
    if (path.startsWith('/room-types')) return 'Room Categories & Rates';
    if (path.startsWith('/housekeeping')) return 'Housekeeping Management';
    if (path.startsWith('/restaurant/pos')) return 'Restaurant & Bar POS';
    if (path.startsWith('/restaurant/orders')) return 'Dining Orders & Room Folios';
    if (path.startsWith('/restaurant/menu')) return 'Food & Beverage Menu';
    if (path.startsWith('/inventory')) return 'Inventory & Stores';
    if (path.startsWith('/procurement')) return 'Procurement & Suppliers';
    if (path.startsWith('/finance')) return 'Financial Accounting';
    if (path.startsWith('/maintenance')) return 'Facilities & Maintenance';
    if (path.startsWith('/reports')) return 'Hotel Operational Reports';
    if (path.startsWith('/users')) return 'Admin Panel';
    if (path.startsWith('/audit')) return 'System Audit Logs';
    if (path.startsWith('/settings')) return 'Hotel Settings';
    return 'Nino Luxury Hotel';
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-6 bg-neutral-900/90 border-b border-neutral-800 backdrop-blur-md">
      {/* Zone 1: Mobile toggle & Breadcrumb title */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 lg:hidden cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <span className="font-semibold text-neutral-300">Nino Luxury Hotel</span>
            <span>/</span>
            <span className="text-amber-500 font-medium">{getBreadcrumbTitle()}</span>
          </div>
          <h2 className="text-sm font-bold text-neutral-100 hidden sm:block">
            {getBreadcrumbTitle()}
          </h2>
        </div>
      </div>

      {/* Zone 2: Real-time Operating Clock (Nigerian Time WAT UTC+1) */}
      <div className="hidden md:flex items-center gap-4 text-xs text-neutral-300 font-mono tabular-nums bg-neutral-950/60 px-3 py-1.5 rounded-lg border border-neutral-800">
        <div className="flex items-center gap-1.5 text-neutral-400">
          <Calendar className="w-3.5 h-3.5 text-amber-500" />
          <span>{getTodayDateString()}</span>
        </div>
        <span className="text-neutral-600">|</span>
        <div className="flex items-center gap-1.5 text-neutral-200">
          <Clock className="w-3.5 h-3.5 text-amber-500" />
          <span>{currentTime || '08:30:00 AM'} (WAT)</span>
        </div>
      </div>

      {/* Zone 3: Quick Action Buttons & Current Staff */}
      <div className="flex items-center gap-2.5">
        {/* Light / Dark Mode Toggle Button */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="flex items-center justify-center w-8.5 h-8.5 rounded-lg border border-neutral-700/80 bg-neutral-800/80 hover:bg-neutral-700 text-neutral-200 transition-colors cursor-pointer"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-sky-400" />
          )}
        </button>

        <Button
          variant="gold"
          size="sm"
          onClick={() => navigate('/reservations?action=new')}
          icon={<PlusCircle className="w-3.5 h-3.5" />}
          className="hidden sm:inline-flex"
        >
          New Reservation
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/frontdesk')}
          className="hidden lg:inline-flex text-xs"
        >
          Front Desk
        </Button>

        {/* User Pill / Role Tag */}
        <div className="flex items-center gap-2 pl-2 border-l border-neutral-800">
          <div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center text-xs font-semibold">
            {user?.fullName ? user.fullName[0] : 'U'}
          </div>
          <div className="hidden xl:block text-left">
            <p className="text-xs font-medium text-neutral-200 leading-none">{user?.fullName}</p>
            <p className="text-[10px] text-amber-500/90 leading-tight mt-0.5">
              {user ? getRoleLabel(user.role) : ''}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};
