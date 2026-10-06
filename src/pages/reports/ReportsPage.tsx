import React, { useMemo, useState } from 'react';
import {
  Bed,
  Calendar,
  CheckCircle2,
  DollarSign,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  Package,
  Printer,
  ShieldCheck,
  TrendingUp,
  UserCheck,
  UtensilsCrossed,
  Wine,
} from 'lucide-react';
import {
  useAuditLogs,
  useFinance,
  useGuests,
  useInventory,
  useReservations,
  useRestaurant,
  useRooms,
} from '../../hooks/useHotelData';
import { formatCurrency } from '../../utils/currency';
import { formatDate, formatDateTime, getTodayDateString } from '../../utils/date';
import { Button } from '../../components/ui/Button';

export const ReportsPage: React.FC = () => {
  const { data: rooms = [] } = useRooms();
  const { data: reservations = [] } = useReservations();
  const { data: guests = [] } = useGuests();
  const { payments, expenses } = useFinance();
  const { orders } = useRestaurant();
  const { items } = useInventory();
  const { data: auditLogs = [] } = useAuditLogs();

  const [activeReport, setActiveReport] = useState<
    | 'daily'
    | 'occupancy'
    | 'revenue'
    | 'restaurant'
    | 'bar'
    | 'expenses'
    | 'inventory'
    | 'audit'
  >('daily');

  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(getTodayDateString());

  // Export to CSV helper
  const handleExportCSV = (filename: string, rows: (string | number)[][], headers: string[]) => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.map((x) => `"${x}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}_${getTodayDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculations for daily summary
  const dailySummary = useMemo(() => {
    const totalRooms = rooms.length;
    const occupied = rooms.filter((r) => r.status === 'Occupied').length;
    const occRate = totalRooms > 0 ? Math.round((occupied / totalRooms) * 100) : 0;

    const totalRev = payments
      .filter((p) => !p.isVoided)
      .reduce((sum, p) => sum + p.amount, 0);

    const totalExp = expenses
      .filter((e) => !e.isVoided)
      .reduce((sum, e) => sum + e.amount, 0);

    return {
      totalRooms,
      occupied,
      occRate,
      totalRev,
      totalExp,
      net: totalRev - totalExp,
    };
  }, [rooms, payments, expenses]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-neutral-900 border border-neutral-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Executive Management Reports</h1>
          <p className="text-xs text-neutral-400 mt-1">
            Audited operational, financial, room occupancy, and inventory analytics
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            icon={<Printer className="w-4 h-4" />}
          >
            Print Report
          </Button>
          <Button
            variant="gold"
            size="sm"
            onClick={() => {
              if (activeReport === 'revenue') {
                handleExportCSV(
                  'hotel_payments',
                  payments.map((p) => [
                    p.receiptNumber,
                    p.guestName,
                    p.department,
                    p.amount,
                    p.method,
                    p.reference,
                    p.date,
                  ]),
                  ['Receipt', 'Guest', 'Department', 'Amount', 'Method', 'Ref', 'Date']
                );
              } else if (activeReport === 'expenses') {
                handleExportCSV(
                  'hotel_expenses',
                  expenses.map((e) => [
                    e.voucherNumber,
                    e.category,
                    e.amount,
                    e.paymentMethod,
                    e.beneficiary,
                    e.date,
                  ]),
                  ['Voucher', 'Category', 'Amount', 'Method', 'Payee', 'Date']
                );
              } else {
                window.print();
              }
            }}
            icon={<Download className="w-4 h-4" />}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* Report Selection Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {[
          { key: 'daily', label: 'Daily Operations Report', icon: <FileText className="w-4 h-4" /> },
          { key: 'occupancy', label: 'Occupancy Report', icon: <Bed className="w-4 h-4" /> },
          { key: 'revenue', label: 'Revenue & Payments Report', icon: <DollarSign className="w-4 h-4" /> },
          { key: 'restaurant', label: 'Restaurant & POS Sales', icon: <UtensilsCrossed className="w-4 h-4" /> },
          { key: 'expenses', label: 'Operating Expenses Report', icon: <TrendingUp className="w-4 h-4" /> },
          { key: 'inventory', label: 'Stores & Stock Valuation', icon: <Package className="w-4 h-4" /> },
          { key: 'audit', label: 'Audit Security Report', icon: <ShieldCheck className="w-4 h-4" /> },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveReport(tab.key as any)}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              activeReport === tab.key
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-neutral-900 border border-neutral-800 text-neutral-300 hover:bg-neutral-800'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Report Viewable Printable Canvas */}
      <div className="p-6 md:p-8 rounded-2xl bg-neutral-900 border border-neutral-800 printable-area space-y-6">
        {/* Printable Header */}
        <div className="text-center pb-6 border-b border-neutral-800 space-y-1">
          <h2 className="text-xl font-bold text-white font-sans">NINO LUXURY HOTEL</h2>
          <p className="text-xs text-neutral-400">
            Plot 428, Arab Road, Kubwa, Abuja, FCT Nigeria • Tel: +234 803 555 0192
          </p>
          <div className="pt-2 text-xs font-mono text-amber-500 uppercase font-bold tracking-wider">
            {activeReport.toUpperCase()} AUDIT & OPERATIONAL REPORT
          </div>
          <p className="text-[11px] text-neutral-400 font-mono">
            Reporting Date: {formatDate(getTodayDateString(), 'long')} • Generated by Nino Luxury Hotel
          </p>
        </div>

        {/* 1. Daily Operations Report */}
        {activeReport === 'daily' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800">
                <span className="text-neutral-400">Room Occupancy:</span>
                <p className="text-xl font-bold text-white mt-1">{dailySummary.occRate}%</p>
                <p className="text-[10px] text-neutral-500">{dailySummary.occupied} occupied / {dailySummary.totalRooms} rooms</p>
              </div>
              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800">
                <span className="text-neutral-400">Total Collections:</span>
                <p className="text-xl font-bold text-emerald-400 mt-1">{formatCurrency(dailySummary.totalRev)}</p>
              </div>
              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800">
                <span className="text-neutral-400">Total Expenses:</span>
                <p className="text-xl font-bold text-rose-400 mt-1">{formatCurrency(dailySummary.totalExp)}</p>
              </div>
              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800">
                <span className="text-neutral-400">Net Position:</span>
                <p className="text-xl font-bold text-amber-400 mt-1">{formatCurrency(dailySummary.net)}</p>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-neutral-200 uppercase tracking-wider mb-2 font-mono">
                Active In-House Room Ledger
              </h3>
              <div className="overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-950">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="text-neutral-400 border-b border-neutral-800 font-medium">
                    <tr>
                      <th className="py-2.5 px-3">Room</th>
                      <th className="py-2.5 px-3">Guest Name</th>
                      <th className="py-2.5 px-3">Stay Dates</th>
                      <th className="py-2.5 px-3">Total Charge</th>
                      <th className="py-2.5 px-3">Deposit</th>
                      <th className="py-2.5 px-3">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/60">
                    {reservations
                      .filter((r) => r.status === 'Checked In')
                      .map((r) => (
                        <tr key={r.id}>
                          <td className="py-2.5 px-3 font-bold text-white">Room {r.roomNumber}</td>
                          <td className="py-2.5 px-3 text-neutral-200">{r.guestName}</td>
                          <td className="py-2.5 px-3 text-neutral-300">
                            {formatDate(r.checkInDate, 'short')} - {formatDate(r.checkOutDate, 'short')}
                          </td>
                          <td className="py-2.5 px-3 text-white">{formatCurrency(r.totalRoomCharge)}</td>
                          <td className="py-2.5 px-3 text-emerald-400">{formatCurrency(r.depositPaid)}</td>
                          <td className="py-2.5 px-3 font-bold text-rose-400">{formatCurrency(r.balanceDue)}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 2. Occupancy Report */}
        {activeReport === 'occupancy' && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-neutral-200 uppercase tracking-wider font-mono">
              Room Status & Availability Inventory
            </h3>
            <div className="overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-950 font-mono text-xs">
              <table className="w-full text-left">
                <thead className="text-neutral-400 border-b border-neutral-800 font-medium">
                  <tr>
                    <th className="py-2.5 px-3">Room #</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Floor</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Nightly Rate</th>
                    <th className="py-2.5 px-3">Current Occupant</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60">
                  {rooms.map((r) => (
                    <tr key={r.id}>
                      <td className="py-2.5 px-3 font-bold text-white">Room {r.roomNumber}</td>
                      <td className="py-2.5 px-3 text-neutral-300">{r.roomType?.name}</td>
                      <td className="py-2.5 px-3 text-neutral-400">{r.floor}</td>
                      <td className="py-2.5 px-3 text-amber-400">{r.status}</td>
                      <td className="py-2.5 px-3 text-white">{formatCurrency(r.ratePerNight)}</td>
                      <td className="py-2.5 px-3 text-neutral-300">{r.currentGuestName || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. Revenue & Payments Report */}
        {activeReport === 'revenue' && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-neutral-200 uppercase tracking-wider font-mono">
              Verified Payments Ledger
            </h3>
            <div className="overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-950 font-mono text-xs">
              <table className="w-full text-left">
                <thead className="text-neutral-400 border-b border-neutral-800 font-medium">
                  <tr>
                    <th className="py-2.5 px-3">Receipt #</th>
                    <th className="py-2.5 px-3">Payer / Guest</th>
                    <th className="py-2.5 px-3">Dept</th>
                    <th className="py-2.5 px-3">Tender</th>
                    <th className="py-2.5 px-3">Reference</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3 text-right">Amount (₦)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60">
                  {payments.map((p) => (
                    <tr key={p.id}>
                      <td className="py-2.5 px-3 font-bold text-amber-400">{p.receiptNumber}</td>
                      <td className="py-2.5 px-3 text-white">{p.guestName}</td>
                      <td className="py-2.5 px-3 text-neutral-300">{p.department}</td>
                      <td className="py-2.5 px-3 text-neutral-400">{p.method}</td>
                      <td className="py-2.5 px-3 text-neutral-400">{p.reference}</td>
                      <td className="py-2.5 px-3 text-neutral-400">{formatDate(p.date, 'short')}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-emerald-400">
                        {formatCurrency(p.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. Restaurant Sales */}
        {activeReport === 'restaurant' && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-neutral-200 uppercase tracking-wider font-mono">
              Dining & Beverage Sales Tickets
            </h3>
            <div className="overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-950 font-mono text-xs">
              <table className="w-full text-left">
                <thead className="text-neutral-400 border-b border-neutral-800 font-medium">
                  <tr>
                    <th className="py-2.5 px-3">Ticket #</th>
                    <th className="py-2.5 px-3">Location / Table</th>
                    <th className="py-2.5 px-3">Items</th>
                    <th className="py-2.5 px-3">Tender</th>
                    <th className="py-2.5 px-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60">
                  {orders.map((o) => (
                    <tr key={o.id}>
                      <td className="py-2.5 px-3 text-amber-400 font-bold">{o.orderNumber}</td>
                      <td className="py-2.5 px-3 text-white">{o.tableOrRoom}</td>
                      <td className="py-2.5 px-3 text-neutral-300">
                        {o.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                      </td>
                      <td className="py-2.5 px-3 text-neutral-400">{o.paymentMethod}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-emerald-400">
                        {formatCurrency(o.totalAmount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5. Expenses Report */}
        {activeReport === 'expenses' && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-neutral-200 uppercase tracking-wider font-mono">
              Operating Expense Vouchers
            </h3>
            <div className="overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-950 font-mono text-xs">
              <table className="w-full text-left">
                <thead className="text-neutral-400 border-b border-neutral-800 font-medium">
                  <tr>
                    <th className="py-2.5 px-3">Voucher #</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Beneficiary</th>
                    <th className="py-2.5 px-3">Method</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60">
                  {expenses.map((e) => (
                    <tr key={e.id}>
                      <td className="py-2.5 px-3 text-amber-400 font-bold">{e.voucherNumber}</td>
                      <td className="py-2.5 px-3 text-white">{e.category}</td>
                      <td className="py-2.5 px-3 text-neutral-300">{e.beneficiary}</td>
                      <td className="py-2.5 px-3 text-neutral-400">{e.paymentMethod}</td>
                      <td className="py-2.5 px-3 text-neutral-400">{formatDate(e.date)}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-rose-400">
                        {formatCurrency(e.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 6. Inventory Valuation */}
        {activeReport === 'inventory' && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-neutral-200 uppercase tracking-wider font-mono">
              Stores Inventory & Stock Valuation
            </h3>
            <div className="overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-950 font-mono text-xs">
              <table className="w-full text-left">
                <thead className="text-neutral-400 border-b border-neutral-800 font-medium">
                  <tr>
                    <th className="py-2.5 px-3">Item Name</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Current Stock</th>
                    <th className="py-2.5 px-3">Unit Cost</th>
                    <th className="py-2.5 px-3 text-right">Total Valuation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60">
                  {items.map((i) => (
                    <tr key={i.id}>
                      <td className="py-2.5 px-3 font-semibold text-white">{i.name}</td>
                      <td className="py-2.5 px-3 text-neutral-300">{i.category}</td>
                      <td className="py-2.5 px-3 text-neutral-200">
                        {i.currentStock} {i.unit}
                      </td>
                      <td className="py-2.5 px-3 text-neutral-400">{formatCurrency(i.unitCost)}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-amber-400">
                        {formatCurrency(i.totalValue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 7. Audit Log Report */}
        {activeReport === 'audit' && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-neutral-200 uppercase tracking-wider font-mono">
              Security & User Action Audit Log
            </h3>
            <div className="overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-950 font-mono text-xs">
              <table className="w-full text-left">
                <thead className="text-neutral-400 border-b border-neutral-800 font-medium">
                  <tr>
                    <th className="py-2.5 px-3">Timestamp</th>
                    <th className="py-2.5 px-3">Staff User</th>
                    <th className="py-2.5 px-3">Module</th>
                    <th className="py-2.5 px-3">Action Performed</th>
                    <th className="py-2.5 px-3">Record Identifier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60">
                  {auditLogs.map((log) => (
                    <tr key={log.id}>
                      <td className="py-2.5 px-3 text-neutral-400">{formatDateTime(log.timestamp)}</td>
                      <td className="py-2.5 px-3 text-white font-semibold">{log.userName}</td>
                      <td className="py-2.5 px-3 text-amber-400">{log.module}</td>
                      <td className="py-2.5 px-3 text-neutral-200">{log.action}</td>
                      <td className="py-2.5 px-3 text-neutral-300">{log.recordIdentifier}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
