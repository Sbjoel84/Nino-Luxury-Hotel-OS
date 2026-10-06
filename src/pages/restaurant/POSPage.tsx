import React, { useMemo, useState } from 'react';
import {
  Coffee,
  CreditCard,
  DollarSign,
  Hotel,
  Minus,
  Plus,
  Printer,
  Receipt,
  Search,
  ShoppingBag,
  Trash2,
  UtensilsCrossed,
  Wine,
} from 'lucide-react';
import { usePOSStore } from '../../stores/posStore';
import { useReservations, useRestaurant } from '../../hooks/useHotelData';
import { formatCurrency } from '../../utils/currency';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { MenuItem, POSPaymentMethod, RestaurantOrder } from '../../types';

export const POSPage: React.FC = () => {
  const { menuItems, createOrder, isLoadingMenu } = useRestaurant();
  const { data: reservations = [] } = useReservations();

  const {
    cart,
    addItem,
    removeItem,
    updateQuantity,
    tableOrRoom,
    setTableOrRoom,
    isRoomService,
    setRoomService,
    paymentMethod,
    setPaymentMethod,
    clearCart,
    getSubtotal,
    getTax,
    getTotal,
  } = usePOSStore();

  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<RestaurantOrder | null>(null);

  // In-house reservations eligible for Room Charge
  const inHouseGuests = reservations.filter((r) => r.status === 'Checked In');

  const categories = [
    'All',
    'Food',
    'Beverage',
    'Cocktails',
    'Wine & Spirits',
    'Snacks',
    'Dessert',
  ];

  const filteredMenuItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchCat = activeCategory === 'All' || item.category === activeCategory;
      const matchSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.code.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch && item.available;
    });
  }, [menuItems, activeCategory, searchQuery]);

  const handleCheckoutSubmit = async () => {
    if (cart.length === 0) return;

    let targetGuestId: string | undefined;
    let targetGuestName: string | undefined;
    let targetRoomId: string | undefined;
    let targetRoomNumber: string | undefined;

    if (paymentMethod === 'Room Charge') {
      const match = inHouseGuests.find((g) => `Room ${g.roomNumber}` === tableOrRoom);
      if (match) {
        targetGuestId = match.guestId;
        targetGuestName = match.guestName;
        targetRoomId = match.roomId;
        targetRoomNumber = match.roomNumber;
      }
    }

    const order = await createOrder.mutateAsync({
      tableOrRoom,
      isRoomService: paymentMethod === 'Room Charge',
      roomId: targetRoomId,
      roomNumber: targetRoomNumber,
      guestId: targetGuestId,
      guestName: targetGuestName,
      items: cart,
      subtotal: getSubtotal(),
      taxAmount: getTax(),
      discountAmount: 0,
      totalAmount: getTotal(),
      paymentMethod,
      paymentStatus: paymentMethod === 'Room Charge' ? 'Charged to Room' : 'Paid',
      waiterId: 'user-5',
      waiterName: 'Emeka Nwosu',
    });

    setCompletedOrder(order);
    setCheckoutModalOpen(false);
    clearCart();
  };

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col lg:flex-row gap-4">
      {/* LEFT COLUMN: Categories */}
      <div className="w-full lg:w-44 flex lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto shrink-0 pb-2 lg:pb-0">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold text-left transition-all whitespace-nowrap cursor-pointer ${
              activeCategory === cat
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-neutral-900 border border-neutral-800 text-neutral-300 hover:bg-neutral-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* CENTER COLUMN: Products / Menu Items Grid */}
      <div className="flex-1 flex flex-col bg-neutral-900/60 rounded-2xl border border-neutral-800 p-4 overflow-hidden">
        {/* Search Header */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search dishes, drinks, spirits, cocktails..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 h-10 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Menu Grid */}
        <div className="flex-1 overflow-y-auto pr-1">
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredMenuItems.map((item) => (
              <div
                key={item.id}
                onClick={() => addItem(item)}
                className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-amber-500/50 hover:bg-neutral-800/60 transition-all flex flex-col justify-between cursor-pointer select-none group"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-mono text-neutral-400 uppercase">
                      {item.code}
                    </span>
                    <span className="text-[10px] text-amber-500 font-medium">
                      {item.category}
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-white mt-1 group-hover:text-amber-300 line-clamp-2">
                    {item.name}
                  </h4>
                </div>
                <div className="mt-3 pt-2 border-t border-neutral-800/80 flex items-center justify-between">
                  <span className="text-xs font-bold font-mono text-amber-400 tabular-nums">
                    {formatCurrency(item.price)}
                  </span>
                  <div className="w-6 h-6 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center text-xs group-hover:bg-amber-500 group-hover:text-neutral-950 transition-colors">
                    +
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Current Order / Cart */}
      <div className="w-full lg:w-88 flex flex-col bg-neutral-900 rounded-2xl border border-neutral-800 p-4 shrink-0 shadow-lg">
        {/* Cart Top Config */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <ShoppingBag className="w-4 h-4 text-amber-500" />
              <span>Current Ticket</span>
            </h3>
            <p className="text-[11px] text-neutral-400 font-mono mt-0.5">
              Waiter: Emeka Nwosu (Bar Lead)
            </p>
          </div>
          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-[11px] text-rose-400 hover:text-rose-300 cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* Location / Table / Room Selection */}
        <div className="py-2.5 border-b border-neutral-800 space-y-2">
          <div className="flex items-center gap-2">
            <select
              value={tableOrRoom}
              onChange={(e) => {
                const val = e.target.value;
                setTableOrRoom(val);
                if (val.startsWith('Room')) {
                  const rNum = val.replace('Room ', '');
                  const match = inHouseGuests.find((g) => g.roomNumber === rNum);
                  setRoomService(true, match?.roomId, rNum, match?.guestId, match?.guestName);
                } else {
                  setRoomService(false);
                }
              }}
              className="w-full h-8.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-200 px-2.5 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer font-mono"
            >
              <optgroup label="Bar Lounge & Tables">
                <option value="Table 1">Table 1 (VIP Lounge)</option>
                <option value="Table 2">Table 2</option>
                <option value="Table 3">Table 3</option>
                <option value="Table 4 (Bar Lounge)">Table 4 (Bar Lounge)</option>
                <option value="Poolside Cabana">Poolside Cabana</option>
              </optgroup>
              <optgroup label="In-House Guest Rooms (Room Service Charge)">
                {inHouseGuests.map((g) => (
                  <option key={g.id} value={`Room ${g.roomNumber}`}>
                    Room {g.roomNumber} ({g.guestName})
                  </option>
                ))}
              </optgroup>
            </select>
          </div>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto py-3 space-y-2.5">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-neutral-500 py-12">
              <UtensilsCrossed className="w-8 h-8 opacity-40 mb-2" />
              <p className="text-xs">Cart is empty.</p>
              <p className="text-[11px] text-neutral-500">Tap menu items to add to ticket.</p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.id}
                className="p-2.5 rounded-lg bg-neutral-950/70 border border-neutral-800/80 space-y-1.5"
              >
                <div className="flex justify-between items-start text-xs">
                  <span className="font-semibold text-neutral-200 leading-tight">
                    {item.name}
                  </span>
                  <span className="font-mono text-amber-400 font-bold tabular-nums ml-2">
                    {formatCurrency(item.subtotal)}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-neutral-400 font-mono">
                    {formatCurrency(item.price)} each
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-5 h-5 rounded bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-neutral-300 cursor-pointer"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-mono font-bold text-white w-5 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-5 h-5 rounded bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-neutral-300 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-1 text-neutral-500 hover:text-rose-400 ml-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pricing Totals & Checkout Button */}
        <div className="pt-3 border-t border-neutral-800 space-y-2 font-mono text-xs">
          <div className="flex justify-between text-neutral-400">
            <span>Subtotal:</span>
            <span className="text-neutral-200 tabular-nums">{formatCurrency(getSubtotal())}</span>
          </div>
          <div className="flex justify-between text-neutral-400">
            <span>VAT (7.5% Nigerian Tax):</span>
            <span className="text-neutral-200 tabular-nums">{formatCurrency(getTax())}</span>
          </div>
          <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-neutral-800">
            <span className="font-sans">Total Due:</span>
            <span className="text-amber-400 tabular-nums">{formatCurrency(getTotal())}</span>
          </div>

          <Button
            variant="gold"
            size="md"
            disabled={cart.length === 0}
            onClick={() => setCheckoutModalOpen(true)}
            className="w-full mt-3 h-11 text-neutral-950 font-bold"
          >
            Checkout & Tender ({formatCurrency(getTotal())})
          </Button>
        </div>
      </div>

      {/* Checkout Modal */}
      {checkoutModalOpen && (
        <Modal
          isOpen={checkoutModalOpen}
          onClose={() => setCheckoutModalOpen(false)}
          title={`Checkout Ticket: ${tableOrRoom}`}
          description={`Grand Total: ${formatCurrency(getTotal())} (Includes 7.5% VAT)`}
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-300 block">
                Select Tender Payment Method:
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {(['POS', 'Cash', 'Transfer', 'Room Charge'] as POSPaymentMethod[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setPaymentMethod(m)}
                    className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer ${
                      paymentMethod === m
                        ? 'border-amber-500 bg-amber-500/15 text-amber-300'
                        : 'border-neutral-800 bg-neutral-950 hover:bg-neutral-800 text-neutral-300'
                    }`}
                  >
                    {m === 'POS' && '💳 Card (POS Terminal)'}
                    {m === 'Cash' && '💵 Cash Tender'}
                    {m === 'Transfer' && '🏦 Direct Bank Transfer'}
                    {m === 'Room Charge' && '🏨 Charge to Guest Folio'}
                  </button>
                ))}
              </div>
            </div>

            {paymentMethod === 'Room Charge' && (
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200">
                Ticket charge of {formatCurrency(getTotal())} will be posted directly to{' '}
                <strong>{tableOrRoom}</strong>'s guest folio and settled at room check-out.
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-neutral-800">
              <Button variant="secondary" size="sm" onClick={() => setCheckoutModalOpen(false)}>
                Back to Cart
              </Button>
              <Button variant="gold" size="sm" onClick={handleCheckoutSubmit}>
                Confirm Payment & Print Kitchen Order
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Completed Order Printable Modal */}
      {completedOrder && (
        <Modal
          isOpen={Boolean(completedOrder)}
          onClose={() => setCompletedOrder(null)}
          title="Order Receipt Generated"
          size="sm"
        >
          <div className="space-y-4 text-center">
            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 font-mono text-xs text-left space-y-2">
              <div className="text-center pb-2 border-b border-neutral-800">
                <p className="font-bold text-white">NINO LUXURY HOTEL</p>
                <p className="text-[10px] text-neutral-400">Kubwa, Abuja, Nigeria</p>
                <p className="text-[10px] text-amber-400 mt-1">Ticket #{completedOrder.orderNumber}</p>
              </div>

              <div className="py-2 border-b border-neutral-800 space-y-1">
                {completedOrder.items.map((i, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>
                      {i.quantity}x {i.name}
                    </span>
                    <span className="font-bold">{formatCurrency(i.subtotal)}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between font-bold text-sm text-white pt-1">
                <span>Total Tendered:</span>
                <span className="text-amber-400">{formatCurrency(completedOrder.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-neutral-400 text-[10px]">
                <span>Method:</span>
                <span>{completedOrder.paymentMethod}</span>
              </div>
            </div>

            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                icon={<Printer className="w-4 h-4" />}
              >
                Print Receipt
              </Button>
              <Button variant="gold" size="sm" onClick={() => setCompletedOrder(null)}>
                New Order
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
