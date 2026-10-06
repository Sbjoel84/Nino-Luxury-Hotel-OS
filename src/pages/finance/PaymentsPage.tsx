import React, { useState } from 'react';
import { Eye, FileText, Plus, Printer, ShieldAlert, XCircle } from 'lucide-react';
import { useFinance } from '../../hooks/useHotelData';
import { formatCurrency } from '../../utils/currency';
import { formatDateTime } from '../../utils/date';
import { Button } from '../../components/ui/Button';
import { DataTable } from '../../components/ui/DataTable';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Modal } from '../../components/ui/Modal';
import { Payment } from '../../types';

export const PaymentsPage: React.FC = () => {
  const { payments, isLoading, voidPayment } = useFinance();

  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [voidPaymentId, setVoidPaymentId] = useState<string | null>(null);

  const handleConfirmVoid = async (reason?: string) => {
    if (!voidPaymentId) return;
    await voidPayment.mutateAsync({ id: voidPaymentId, reason: reason || 'Voided by supervisor' });
    setVoidPaymentId(null);
  };

  const columns = [
    {
      header: 'Receipt #',
      accessorKey: 'receiptNumber' as keyof Payment,
      sortable: true,
      cell: (p: Payment) => (
        <span className="font-mono font-bold text-amber-400 text-xs">{p.receiptNumber}</span>
      ),
    },
    {
      header: 'Guest / Customer',
      accessorKey: 'guestName' as keyof Payment,
      sortable: true,
      cell: (p: Payment) => (
        <div>
          <span className="font-semibold text-neutral-200 text-xs">{p.guestName}</span>
          {p.roomNumber && (
            <p className="text-[10px] text-neutral-400 font-mono">Room {p.roomNumber}</p>
          )}
        </div>
      ),
    },
    {
      header: 'Department',
      accessorKey: 'department' as keyof Payment,
      sortable: true,
      cell: (p: Payment) => (
        <span className="text-xs text-neutral-300">{p.department}</span>
      ),
    },
    {
      header: 'Tender Method',
      cell: (p: Payment) => (
        <span className="font-mono text-xs text-neutral-300">{p.method}</span>
      ),
    },
    {
      header: 'Reference / Trace',
      cell: (p: Payment) => (
        <span className="font-mono text-[11px] text-neutral-400">{p.reference}</span>
      ),
    },
    {
      header: 'Amount Collected',
      accessorKey: 'amount' as keyof Payment,
      sortable: true,
      cell: (p: Payment) => (
        <span
          className={`font-mono font-bold text-xs tabular-nums ${
            p.isVoided ? 'text-neutral-500 line-through' : 'text-emerald-400'
          }`}
        >
          {formatCurrency(p.amount)}
        </span>
      ),
    },
    {
      header: 'Collected By',
      cell: (p: Payment) => (
        <span className="text-xs text-neutral-400">{p.collectedByName}</span>
      ),
    },
    {
      header: 'Status',
      cell: (p: Payment) =>
        p.isVoided ? (
          <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 font-bold border border-rose-500/30">
            VOIDED
          </span>
        ) : (
          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/30">
            VALID
          </span>
        ),
    },
    {
      header: 'Actions',
      align: 'right' as const,
      cell: (p: Payment) => (
        <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedPayment(p)}
            icon={<Eye className="w-3.5 h-3.5" />}
          >
            Receipt
          </Button>

          {!p.isVoided && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => setVoidPaymentId(p.id)}
            >
              Void
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-neutral-900 border border-neutral-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Payments & Receipts Ledger</h1>
          <p className="text-xs text-neutral-400 mt-1">
            Cash, POS card slips, and bank transfer settlements with audited void tracking
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={payments}
        isLoading={isLoading}
        searchPlaceholder="Search by receipt #, guest, reference or user..."
      />

      {/* Modal: View Receipt */}
      {selectedPayment && (
        <Modal
          isOpen={Boolean(selectedPayment)}
          onClose={() => setSelectedPayment(null)}
          title={`Official Receipt #${selectedPayment.receiptNumber}`}
          size="sm"
        >
          <div className="space-y-4 font-mono text-xs">
            <div className="p-5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
              <div className="text-center pb-3 border-b border-neutral-800">
                <h3 className="font-bold text-sm text-white font-sans">NINO LUXURY HOTEL</h3>
                <p className="text-[10px] text-neutral-400">Kubwa, Abuja, Nigeria</p>
                <p className="text-[11px] text-amber-500 mt-1 font-bold">
                  OFFICIAL PAYMENT RECEIPT
                </p>
              </div>

              <div className="flex justify-between">
                <span className="text-neutral-400">Receipt Ref:</span>
                <span className="text-white font-bold">{selectedPayment.receiptNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Payer Name:</span>
                <span className="text-white font-semibold">{selectedPayment.guestName}</span>
              </div>
              {selectedPayment.roomNumber && (
                <div className="flex justify-between">
                  <span className="text-neutral-400">Room:</span>
                  <span className="text-white">Room {selectedPayment.roomNumber}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-neutral-400">Department:</span>
                <span className="text-neutral-200">{selectedPayment.department}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Tender Method:</span>
                <span className="text-amber-400 font-bold">{selectedPayment.method}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Bank / Trace Ref:</span>
                <span className="text-neutral-200">{selectedPayment.reference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Date & Time:</span>
                <span className="text-neutral-300 tabular-nums">
                  {formatDateTime(selectedPayment.date)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Cashier:</span>
                <span className="text-neutral-300">{selectedPayment.collectedByName}</span>
              </div>

              <div className="flex justify-between pt-3 border-t border-neutral-800 text-sm font-bold text-white">
                <span className="font-sans">Amount Paid:</span>
                <span className="text-emerald-400 tabular-nums">
                  {formatCurrency(selectedPayment.amount)}
                </span>
              </div>

              {selectedPayment.isVoided && (
                <div className="p-2.5 rounded bg-rose-500/10 border border-rose-500/30 text-rose-400 text-center font-bold text-xs mt-2">
                  TRANSACTION VOIDED: "{selectedPayment.voidReason}"
                </div>
              )}
            </div>

            <div className="flex justify-center gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                icon={<Printer className="w-4 h-4" />}
              >
                Print Receipt
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setSelectedPayment(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirm Void Dialog with Reason Requirement */}
      <ConfirmDialog
        isOpen={Boolean(voidPaymentId)}
        onClose={() => setVoidPaymentId(null)}
        onConfirm={handleConfirmVoid}
        title="Void Financial Receipt"
        message="Important: Financial transactions cannot be deleted. Voiding will record a permanent cancellation audit entry and adjust balances."
        confirmLabel="Yes, Void Receipt"
        requireReason={true}
        reasonPlaceholder="Specify mandatory reason for voiding (e.g. Duplicate POS swipe, incorrect folio)..."
        isDestructive={true}
      />
    </div>
  );
};
