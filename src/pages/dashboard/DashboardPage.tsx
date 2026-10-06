import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  Bed,
  CheckCircle2,
  Clock,
  DollarSign,
  Hotel,
  LogIn,
  LogOut,
  Sparkles,
  TrendingUp,
  UtensilsCrossed,
  Wine,
  Wrench,
} from 'lucide-react';
import {
  useAuditLogs,
  useFinance,
  useReservations,
  useRestaurant,
  useRooms,
} from '../../hooks/useHotelData';
import { formatCurrency, formatCurrencyCompact } from '../../utils/currency';
import { formatDate, formatDateTime, getTodayDateString } from '../../utils/date';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Button';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: rooms = [], isLoading: loadingRooms } = useRooms();
  const { data: reservations = [], isLoading: loadingRes } = useReservations();
  const { payments, expenses, isLoading: loadingFinance } = useFinance();
  const { orders } = useRestaurant();
  const { data: auditLogs = [] } = useAuditLogs();

  const today = getTodayDateString();

  // Metrics calculations
  const stats = useMemo(() => {
    const totalRooms = rooms.length;
    const availableRooms = rooms.filter((r) => r.status === 'Available').length;
    const occupiedRooms = rooms.filter((r) => r.status === 'Occupied').length;
    const reservedRooms = rooms.filter((r) => r.status === 'Reserved').length;
    const cleaningRooms = rooms.filter((r) => r.status === 'Cleaning').length;
    const maintenanceRooms = rooms.filter((r) => r.status === 'Maintenance').length;
    const inspectedRooms = rooms.filter((r) => r.status === 'Inspected').length;

    const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

    // Today's arrivals and departures
    const todayCheckIns = reservations.filter(
      (r) => r.checkInDate === today && (r.status === 'Confirmed' || r.status === 'Checked In')
    ).length;

    const todayCheckOuts = reservations.filter(
      (r) => r.checkOutDate === today && r.status === 'Checked In'
    ).length;

    // Revenue breakdown from payments & orders
    const roomRevenue = payments
      .filter((p) => !p.isVoided && p.department === 'Rooms')
      .reduce((sum, p) => sum + p.amount, 0);

    const restaurantRevenue = payments
      .filter((p) => !p.isVoided && p.department === 'Restaurant')
      .reduce((sum, p) => sum + p.amount, 0);

    const barRevenue = payments
      .filter((p) => !p.isVoided && p.department === 'Bar')
      .reduce((sum, p) => sum + p.amount, 0);

    const totalRevenue = roomRevenue + restaurantRevenue + barRevenue;

    const totalExpenses = expenses
      .filter((e) => !e.isVoided)
      .reduce((sum, e) => sum + e.amount, 0);

    // Outstanding balances from active reservations
    const outstandingBalances = reservations
      .filter((r) => r.status === 'Checked In' || r.status === 'Confirmed')
      .reduce((sum, r) => sum + (r.balanceDue || 0), 0);

    const netOperatingProfit = totalRevenue - totalExpenses;

    return {
      totalRooms,
      availableRooms,
      occupiedRooms,
      reservedRooms,
      cleaningRooms,
      maintenanceRooms,
      inspectedRooms,
      occupancyRate,
      todayCheckIns,
      todayCheckOuts,
      roomRevenue,
      restaurantRevenue,
      barRevenue,
      totalRevenue,
      totalExpenses,
      outstandingBalances,
      netOperatingProfit,
    };
  }, [rooms, reservations, payments, expenses, today]);

  // Recent Transactions (top 6 payments)
  const recentTransactions = useMemo(() => {
    return payments.slice(0, 6);
  }, [payments]);

  // Today's Operational Activity (Recent audit actions)
  const recentActivity = useMemo(() => {
    return auditLogs.slice(0, 5);
  }, [auditLogs]);

  return (
    <div className="space-y-6">
      {/* Top Banner: Hotel Status Summary & Quick Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Nino Luxury Hotel Operations Hub
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Kubwa, Abuja • Real-time occupancy, revenue streams, and room turnover control
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="gold"
            size="sm"
            onClick={() => navigate('/check-in')}
            icon={<LogIn className="w-4 h-4" />}
          >
            Check-In Guest
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/check-out')}
            icon={<LogOut className="w-4 h-4" />}
          >
            Check-Out Settle
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/restaurant/pos')}
            icon={<UtensilsCrossed className="w-4 h-4" />}
          >
            Open POS
          </Button>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Total & Occupancy */}
        <div className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-medium">Occupancy</span>
            <Hotel className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-white font-mono tabular-nums">
            {stats.occupancyRate}%
          </div>
          <p className="text-[11px] text-neutral-400 mt-1 tabular-nums">
            {stats.occupiedRooms} of {stats.totalRooms} rooms active
          </p>
        </div>

        {/* Available Rooms */}
        <div className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-medium">Available</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono tabular-nums">
            {stats.availableRooms}
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">Ready for check-in</p>
        </div>

        {/* Cleaning & Turnover */}
        <div className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-medium">Cleaning</span>
            <Sparkles className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-sky-400 font-mono tabular-nums">
            {stats.cleaningRooms}
          </div>
          <p className="text-[11px] text-neutral-400 mt-1 tabular-nums">
            + {stats.inspectedRooms} in inspection
          </p>
        </div>

        {/* Maintenance */}
        <div className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-medium">Maintenance</span>
            <Wrench className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-400 font-mono tabular-nums">
            {stats.maintenanceRooms}
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">Room work orders</p>
        </div>

        {/* Today's Check-ins */}
        <div className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-medium">Arrivals Today</span>
            <LogIn className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400 font-mono tabular-nums">
            {stats.todayCheckIns}
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">Scheduled check-ins</p>
        </div>

        {/* Today's Check-outs */}
        <div className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-medium">Departures</span>
            <LogOut className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono tabular-nums">
            {stats.todayCheckOuts}
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">Due for settlement</p>
        </div>
      </div>

      {/* Revenue & Financial Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Collected Revenue */}
        <div className="p-5 rounded-2xl bg-neutral-900/90 border border-neutral-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Total Collections</span>
            <span className="text-emerald-400 flex items-center font-mono">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> Receipts
            </span>
          </div>
          <div className="text-2xl font-bold text-white font-mono tabular-nums mt-2">
            {formatCurrency(stats.totalRevenue)}
          </div>
          <div className="mt-3 pt-3 border-t border-neutral-800/80 flex items-center justify-between text-xs text-neutral-400">
            <span>Rooms: {formatCurrencyCompact(stats.roomRevenue)}</span>
            <span>F&B: {formatCurrencyCompact(stats.restaurantRevenue + stats.barRevenue)}</span>
          </div>
        </div>

        {/* Room Revenue */}
        <div className="p-5 rounded-2xl bg-neutral-900/90 border border-neutral-800 shadow-sm">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Room Stay Revenue</span>
            <Bed className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-400 font-mono tabular-nums mt-2">
            {formatCurrency(stats.roomRevenue)}
          </div>
          <div className="mt-3 pt-3 border-t border-neutral-800/80 text-xs text-neutral-400 flex items-center justify-between">
            <span>Pending Balance</span>
            <span className="text-rose-400 font-mono tabular-nums font-medium">
              {formatCurrency(stats.outstandingBalances)}
            </span>
          </div>
        </div>

        {/* Restaurant & Bar POS Revenue */}
        <div className="p-5 rounded-2xl bg-neutral-900/90 border border-neutral-800 shadow-sm">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Restaurant & Bar POS</span>
            <UtensilsCrossed className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono tabular-nums mt-2">
            {formatCurrency(stats.restaurantRevenue + stats.barRevenue)}
          </div>
          <div className="mt-3 pt-3 border-t border-neutral-800/80 text-xs text-neutral-400 flex items-center justify-between">
            <span>Bar: {formatCurrencyCompact(stats.barRevenue)}</span>
            <span>Dining: {formatCurrencyCompact(stats.restaurantRevenue)}</span>
          </div>
        </div>

        {/* Total Operational Expenses */}
        <div className="p-5 rounded-2xl bg-neutral-900/90 border border-neutral-800 shadow-sm">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Operating Expenses</span>
            <span className="text-rose-400 flex items-center font-mono">
              <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" /> Vouchers
            </span>
          </div>
          <div className="text-2xl font-bold text-rose-400 font-mono tabular-nums mt-2">
            {formatCurrency(stats.totalExpenses)}
          </div>
          <div className="mt-3 pt-3 border-t border-neutral-800/80 text-xs text-neutral-400 flex items-center justify-between">
            <span>Net Operating Margin</span>
            <span
              className={`font-mono tabular-nums font-semibold ${
                stats.netOperatingProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {formatCurrency(stats.netOperatingProfit)}
            </span>
          </div>
        </div>
      </div>

      {/* Visual Analytics Grid: Occupancy Bar Chart & Revenue Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Occupancy Status Distribution */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Room Inventory Distribution</h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Current operational status breakdown for all 24 hotel rooms
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/rooms')}
              className="text-xs"
            >
              View All Rooms
            </Button>
          </div>

          {/* Graphical Status Multi-Bar */}
          <div className="space-y-2">
            <div className="h-6 w-full rounded-lg bg-neutral-950 flex overflow-hidden p-1 gap-1">
              <div
                style={{ width: `${(stats.occupiedRooms / stats.totalRooms) * 100}%` }}
                className="bg-amber-500 rounded-xs transition-all relative group"
                title={`Occupied: ${stats.occupiedRooms}`}
              />
              <div
                style={{ width: `${(stats.availableRooms / stats.totalRooms) * 100}%` }}
                className="bg-emerald-500 rounded-xs transition-all relative group"
                title={`Available: ${stats.availableRooms}`}
              />
              <div
                style={{ width: `${(stats.reservedRooms / stats.totalRooms) * 100}%` }}
                className="bg-sky-500 rounded-xs transition-all relative group"
                title={`Reserved: ${stats.reservedRooms}`}
              />
              <div
                style={{ width: `${(stats.cleaningRooms / stats.totalRooms) * 100}%` }}
                className="bg-indigo-500 rounded-xs transition-all relative group"
                title={`Cleaning: ${stats.cleaningRooms}`}
              />
              <div
                style={{ width: `${(stats.maintenanceRooms / stats.totalRooms) * 100}%` }}
                className="bg-rose-500 rounded-xs transition-all relative group"
                title={`Maintenance: ${stats.maintenanceRooms}`}
              />
            </div>

            {/* Legend with tabular counts */}
            <div className="flex flex-wrap items-center gap-4 text-xs pt-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                <span className="text-neutral-400">Occupied:</span>
                <span className="font-semibold text-white font-mono tabular-nums">
                  {stats.occupiedRooms}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                <span className="text-neutral-400">Available:</span>
                <span className="font-semibold text-white font-mono tabular-nums">
                  {stats.availableRooms}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500 shrink-0" />
                <span className="text-neutral-400">Reserved:</span>
                <span className="font-semibold text-white font-mono tabular-nums">
                  {stats.reservedRooms}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0" />
                <span className="text-neutral-400">Cleaning:</span>
                <span className="font-semibold text-white font-mono tabular-nums">
                  {stats.cleaningRooms}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
                <span className="text-neutral-400">Maintenance:</span>
                <span className="font-semibold text-white font-mono tabular-nums">
                  {stats.maintenanceRooms}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Rooms Matrix View */}
          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2 pt-3 border-t border-neutral-800">
            {rooms.slice(0, 16).map((room) => {
              const bg =
                room.status === 'Occupied'
                  ? 'border-amber-500/50 bg-amber-500/10 text-amber-300'
                  : room.status === 'Available'
                  ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300'
                  : room.status === 'Cleaning'
                  ? 'border-indigo-500/50 bg-indigo-500/10 text-indigo-300'
                  : room.status === 'Maintenance'
                  ? 'border-rose-500/50 bg-rose-500/10 text-rose-300'
                  : 'border-neutral-700 bg-neutral-800/80 text-neutral-300';

              return (
                <div
                  key={room.id}
                  onClick={() => navigate('/rooms')}
                  className={`p-2 rounded-lg border text-center transition-transform hover:scale-105 cursor-pointer ${bg}`}
                >
                  <p className="font-mono font-bold text-xs">{room.roomNumber}</p>
                  <p className="text-[10px] truncate opacity-80">{room.status}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Revenue Mix Chart Card */}
        <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-white">Revenue Sources</h3>
            <p className="text-xs text-neutral-400 mt-0.5">Departmental contribution</p>
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-neutral-300 font-medium">Room Bookings</span>
                <span className="font-mono tabular-nums text-amber-400 font-semibold">
                  {formatCurrency(stats.roomRevenue)}
                </span>
              </div>
              <div className="h-2 w-full bg-neutral-800 rounded-full overflow-hidden">
                <div
                  style={{
                    width: `${
                      stats.totalRevenue > 0
                        ? (stats.roomRevenue / stats.totalRevenue) * 100
                        : 75
                    }%`,
                  }}
                  className="h-full bg-amber-500 rounded-full"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-neutral-300 font-medium">Restaurant Dining</span>
                <span className="font-mono tabular-nums text-emerald-400 font-semibold">
                  {formatCurrency(stats.restaurantRevenue)}
                </span>
              </div>
              <div className="h-2 w-full bg-neutral-800 rounded-full overflow-hidden">
                <div
                  style={{
                    width: `${
                      stats.totalRevenue > 0
                        ? (stats.restaurantRevenue / stats.totalRevenue) * 100
                        : 15
                    }%`,
                  }}
                  className="h-full bg-emerald-500 rounded-full"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-neutral-300 font-medium">Bar & Lounge Drinks</span>
                <span className="font-mono tabular-nums text-sky-400 font-semibold">
                  {formatCurrency(stats.barRevenue)}
                </span>
              </div>
              <div className="h-2 w-full bg-neutral-800 rounded-full overflow-hidden">
                <div
                  style={{
                    width: `${
                      stats.totalRevenue > 0
                        ? (stats.barRevenue / stats.totalRevenue) * 100
                        : 10
                    }%`,
                  }}
                  className="h-full bg-sky-500 rounded-full"
                />
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800/80 space-y-1 mt-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-400">Total Invoiced:</span>
              <span className="font-mono tabular-nums font-semibold text-white">
                {formatCurrency(stats.totalRevenue + stats.outstandingBalances)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-400">Outstanding Folio Due:</span>
              <span className="font-mono tabular-nums font-semibold text-rose-400">
                {formatCurrency(stats.outstandingBalances)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tables Row: Recent Transactions & Today's Operational Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions Table */}
        <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Recent Transactions</h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Latest customer and guest settlement receipts
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/finance/payments')}
              className="text-xs"
            >
              View Ledger
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-neutral-400 border-b border-neutral-800 font-medium">
                <tr>
                  <th className="pb-2.5">Receipt #</th>
                  <th className="pb-2.5">Guest / Payer</th>
                  <th className="pb-2.5">Dept</th>
                  <th className="pb-2.5">Method</th>
                  <th className="pb-2.5 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {recentTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-neutral-800/40">
                    <td className="py-2.5 font-mono text-neutral-300 tabular-nums">
                      {tx.receiptNumber}
                    </td>
                    <td className="py-2.5 text-neutral-200 font-medium truncate max-w-[140px]">
                      {tx.guestName}
                    </td>
                    <td className="py-2.5 text-neutral-400">{tx.department}</td>
                    <td className="py-2.5 text-neutral-300 font-mono">{tx.method}</td>
                    <td className="py-2.5 text-right font-mono font-semibold text-emerald-400 tabular-nums">
                      {formatCurrency(tx.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Today's Operational Activity Feed */}
        <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Today's Activity Audit</h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Operational events, check-ins, status transitions
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/audit')}
              className="text-xs"
            >
              Full Audit Trail
            </Button>
          </div>

          <div className="divide-y divide-neutral-800/60">
            {recentActivity.map((log) => (
              <div key={log.id} className="py-3 flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-neutral-200 truncate">
                      {log.action} • {log.recordIdentifier}
                    </p>
                    <span className="text-[10px] text-neutral-400 shrink-0 font-mono tabular-nums">
                      {formatDateTime(log.timestamp).split(',')[1] || formatDateTime(log.timestamp)}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-0.5 leading-snug">{log.details}</p>
                  <p className="text-[10px] text-amber-500/80 mt-1">Staff: {log.userName}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
