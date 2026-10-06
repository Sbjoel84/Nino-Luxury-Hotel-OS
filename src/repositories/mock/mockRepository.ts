import {
  AuditLog,
  Expense,
  Guest,
  GuestFolio,
  HotelSettings,
  HousekeepingTask,
  InventoryItem,
  MaintenanceRequest,
  MenuItem,
  Payment,
  PurchaseOrder,
  Reservation,
  RestaurantOrder,
  Room,
  RoomType,
  StockTransaction,
  Supplier,
  UserProfile,
} from '../../types';
import { isDateOverlap } from '../../utils/date';
import { IHotelRepository } from '../repositoryInterface';
import {
  INITIAL_AUDIT_LOGS,
  INITIAL_EXPENSES,
  INITIAL_GUESTS,
  INITIAL_HOUSEKEEPING_TASKS,
  INITIAL_INVENTORY_ITEMS,
  INITIAL_MAINTENANCE_REQUESTS,
  INITIAL_MENU_ITEMS,
  INITIAL_ORDERS,
  INITIAL_PAYMENTS,
  INITIAL_PURCHASE_ORDERS,
  INITIAL_RESERVATIONS,
  INITIAL_ROOM_TYPES,
  INITIAL_ROOMS,
  INITIAL_SETTINGS,
  INITIAL_STOCK_TRANSACTIONS,
  INITIAL_SUPPLIERS,
  INITIAL_USERS,
} from './mockData';

const STORAGE_PREFIX = 'nino_luxury_';

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key);
    return item ? JSON.parse(item) : fallback;
  } catch (err) {
    console.error(`Failed to load ${key} from storage:`, err);
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data));
  } catch (err) {
    console.error(`Failed to save ${key} to storage:`, err);
  }
}

export class MockHotelRepository implements IHotelRepository {
  private rooms: Room[] = loadFromStorage('rooms', INITIAL_ROOMS);
  private roomTypes: RoomType[] = loadFromStorage('room_types', INITIAL_ROOM_TYPES);
  private reservations: Reservation[] = loadFromStorage('reservations', INITIAL_RESERVATIONS);
  private guests: Guest[] = loadFromStorage('guests', INITIAL_GUESTS);
  private housekeepingTasks: HousekeepingTask[] = loadFromStorage('housekeeping', INITIAL_HOUSEKEEPING_TASKS);
  private menuItems: MenuItem[] = loadFromStorage('menu', INITIAL_MENU_ITEMS);
  private orders: RestaurantOrder[] = loadFromStorage('orders', INITIAL_ORDERS);
  private inventoryItems: InventoryItem[] = loadFromStorage('inventory', INITIAL_INVENTORY_ITEMS);
  private stockTransactions: StockTransaction[] = loadFromStorage('stock_tx', INITIAL_STOCK_TRANSACTIONS);
  private suppliers: Supplier[] = loadFromStorage('suppliers', INITIAL_SUPPLIERS);
  private purchaseOrders: PurchaseOrder[] = loadFromStorage('purchase_orders', INITIAL_PURCHASE_ORDERS);
  private payments: Payment[] = loadFromStorage('payments', INITIAL_PAYMENTS);
  private expenses: Expense[] = loadFromStorage('expenses', INITIAL_EXPENSES);
  private maintenanceRequests: MaintenanceRequest[] = loadFromStorage('maintenance', INITIAL_MAINTENANCE_REQUESTS);
  private auditLogs: AuditLog[] = loadFromStorage('audit_logs', INITIAL_AUDIT_LOGS);
  private users: UserProfile[] = loadFromStorage('users', INITIAL_USERS);
  private settings: HotelSettings = loadFromStorage('settings', INITIAL_SETTINGS);

  // Helper to persist all
  private sync(key: string, data: unknown) {
    saveToStorage(key, data);
  }

  // --- Rooms ---
  async getRooms(): Promise<Room[]> {
    return [...this.rooms].map((r) => ({
      ...r,
      roomType: this.roomTypes.find((t) => t.id === r.roomTypeId),
    }));
  }

  async getRoomById(id: string): Promise<Room | null> {
    const room = this.rooms.find((r) => r.id === id);
    if (!room) return null;
    return {
      ...room,
      roomType: this.roomTypes.find((t) => t.id === room.roomTypeId),
    };
  }

  async createRoom(roomData: Omit<Room, 'id' | 'lastUpdated'>): Promise<Room> {
    const newRoom: Room = {
      ...roomData,
      id: `room-${Date.now()}`,
      lastUpdated: new Date().toISOString(),
    };
    this.rooms.push(newRoom);
    this.sync('rooms', this.rooms);
    await this.logAction({
      userId: 'current-user',
      userName: 'Hotel Staff',
      userRole: 'management',
      module: 'Rooms',
      action: 'Created Room',
      recordId: newRoom.id,
      recordIdentifier: `Room ${newRoom.roomNumber}`,
      details: `Added room ${newRoom.roomNumber} on floor ${newRoom.floor}`,
    });
    return newRoom;
  }

  async updateRoom(id: string, updates: Partial<Room>): Promise<Room> {
    const index = this.rooms.findIndex((r) => r.id === id);
    if (index === -1) throw new Error('Room not found');
    this.rooms[index] = {
      ...this.rooms[index],
      ...updates,
      lastUpdated: new Date().toISOString(),
    };
    this.sync('rooms', this.rooms);
    return this.rooms[index];
  }

  async deleteRoom(id: string): Promise<boolean> {
    this.rooms = this.rooms.filter((r) => r.id !== id);
    this.sync('rooms', this.rooms);
    return true;
  }

  async getRoomTypes(): Promise<RoomType[]> {
    return [...this.roomTypes];
  }

  // --- Reservations ---
  async getReservations(): Promise<Reservation[]> {
    return [...this.reservations].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getReservationById(id: string): Promise<Reservation | null> {
    return this.reservations.find((r) => r.id === id) || null;
  }

  async createReservation(
    data: Omit<Reservation, 'id' | 'reservationCode' | 'createdAt' | 'updatedAt'>
  ): Promise<Reservation> {
    // Double-booking check
    if (data.roomId) {
      const activeOverlap = this.reservations.find(
        (r) =>
          r.roomId === data.roomId &&
          ['Confirmed', 'Checked In'].includes(r.status) &&
          isDateOverlap(data.checkInDate, data.checkOutDate, r.checkInDate, r.checkOutDate)
      );

      if (activeOverlap) {
        throw new Error(
          `Double-booking conflict: Room ${activeOverlap.roomNumber} is already booked from ${activeOverlap.checkInDate} to ${activeOverlap.checkOutDate}.`
        );
      }
    }

    const codeNumber = Math.floor(1000 + Math.random() * 9000);
    const newReservation: Reservation = {
      ...data,
      id: `res-${Date.now()}`,
      reservationCode: `GDH-2026-${codeNumber}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.reservations.unshift(newReservation);
    this.sync('reservations', this.reservations);

    // If deposit was paid, automatically record initial payment
    if (data.depositPaid > 0) {
      await this.createPayment({
        reservationId: newReservation.id,
        guestId: newReservation.guestId,
        guestName: newReservation.guestName,
        roomNumber: newReservation.roomNumber,
        department: 'Rooms',
        amount: data.depositPaid,
        method: 'Transfer',
        reference: `DEP-${newReservation.reservationCode}`,
        collectedById: data.createdById,
        collectedByName: data.createdByName,
        date: new Date().toISOString(),
        notes: `Reservation booking deposit for ${newReservation.reservationCode}`,
      });
    }

    // Update guest total bookings
    const guest = this.guests.find((g) => g.id === data.guestId);
    if (guest) {
      guest.totalBookings += 1;
      guest.lastVisitDate = data.checkInDate;
      this.sync('guests', this.guests);
    }

    await this.logAction({
      userId: data.createdById,
      userName: data.createdByName,
      userRole: 'reception',
      module: 'Reservations',
      action: 'Created Reservation',
      recordId: newReservation.id,
      recordIdentifier: newReservation.reservationCode,
      details: `Created reservation for ${newReservation.guestName} (${newReservation.checkInDate} to ${newReservation.checkOutDate})`,
    });

    return newReservation;
  }

  async updateReservation(id: string, updates: Partial<Reservation>): Promise<Reservation> {
    const index = this.reservations.findIndex((r) => r.id === id);
    if (index === -1) throw new Error('Reservation not found');

    // If dates or room changed, check double booking
    const current = this.reservations[index];
    const newRoomId = updates.roomId ?? current.roomId;
    const newCheckIn = updates.checkInDate ?? current.checkInDate;
    const newCheckOut = updates.checkOutDate ?? current.checkOutDate;

    if (newRoomId && (updates.roomId || updates.checkInDate || updates.checkOutDate)) {
      const activeOverlap = this.reservations.find(
        (r) =>
          r.id !== id &&
          r.roomId === newRoomId &&
          ['Confirmed', 'Checked In'].includes(r.status) &&
          isDateOverlap(newCheckIn, newCheckOut, r.checkInDate, r.checkOutDate)
      );

      if (activeOverlap) {
        throw new Error(
          `Conflict: Room ${activeOverlap.roomNumber} is already occupied/reserved for those dates.`
        );
      }
    }

    this.reservations[index] = {
      ...this.reservations[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.sync('reservations', this.reservations);
    return this.reservations[index];
  }

  async cancelReservation(id: string, reason?: string): Promise<Reservation> {
    const res = await this.updateReservation(id, {
      status: 'Cancelled',
      specialRequests: reason ? `[Cancelled: ${reason}]` : undefined,
    });

    // Release room if it was held
    if (res.roomId) {
      const room = this.rooms.find((r) => r.id === res.roomId);
      if (room && room.status === 'Reserved') {
        room.status = 'Available';
        room.currentReservationId = undefined;
        room.currentGuestName = undefined;
        room.currentGuestId = undefined;
        this.sync('rooms', this.rooms);
      }
    }

    await this.logAction({
      userId: 'current-user',
      userName: 'Front Desk',
      userRole: 'reception',
      module: 'Reservations',
      action: 'Cancelled Reservation',
      recordId: res.id,
      recordIdentifier: res.reservationCode,
      details: reason ? `Cancellation reason: ${reason}` : 'Cancelled reservation',
    });

    return res;
  }

  async checkInReservation(
    reservationId: string,
    roomId: string,
    deposit?: number
  ): Promise<{ reservation: Reservation; room: Room }> {
    const res = this.reservations.find((r) => r.id === reservationId);
    if (!res) throw new Error('Reservation not found');

    const room = this.rooms.find((r) => r.id === roomId);
    if (!room) throw new Error('Room not found');

    if (['Maintenance', 'Out of Service'].includes(room.status)) {
      throw new Error(`Cannot check in: Room ${room.roomNumber} is currently under ${room.status}.`);
    }

    if (room.status === 'Occupied' && room.currentReservationId !== reservationId) {
      throw new Error(`Room ${room.roomNumber} is currently occupied by another guest.`);
    }

    // Update reservation
    res.status = 'Checked In';
    res.roomId = room.id;
    res.roomNumber = room.roomNumber;
    if (deposit && deposit > 0) {
      res.depositPaid += deposit;
      res.balanceDue = Math.max(0, res.balanceDue - deposit);
      await this.createPayment({
        reservationId: res.id,
        guestId: res.guestId,
        guestName: res.guestName,
        roomNumber: room.roomNumber,
        department: 'Rooms',
        amount: deposit,
        method: 'POS',
        reference: `CHK-IN-${res.reservationCode}`,
        collectedById: 'user-3',
        collectedByName: 'Chioma Adeyemi',
        date: new Date().toISOString(),
        notes: `Check-in deposit for ${res.guestName}`,
      });
    }
    res.updatedAt = new Date().toISOString();

    // Update room
    room.status = 'Occupied';
    room.currentReservationId = res.id;
    room.currentGuestId = res.guestId;
    room.currentGuestName = res.guestName;
    room.lastUpdated = new Date().toISOString();

    // Update guest visits
    const guest = this.guests.find((g) => g.id === res.guestId);
    if (guest) {
      guest.totalVisits += 1;
      guest.lastVisitDate = new Date().toISOString().split('T')[0];
    }

    this.sync('reservations', this.reservations);
    this.sync('rooms', this.rooms);
    this.sync('guests', this.guests);

    await this.logAction({
      userId: 'user-3',
      userName: 'Chioma Adeyemi',
      userRole: 'reception',
      module: 'Front Desk',
      action: 'Checked In Guest',
      recordId: res.id,
      recordIdentifier: `Room ${room.roomNumber} - ${res.guestName}`,
      details: `Checked in guest into Room ${room.roomNumber}`,
    });

    return { reservation: res, room };
  }

  async checkOutReservation(
    reservationId: string,
    paymentMethod: string = 'POS',
    paidAmount?: number
  ): Promise<{ reservation: Reservation; room: Room; folio: GuestFolio }> {
    const res = this.reservations.find((r) => r.id === reservationId);
    if (!res) throw new Error('Reservation not found');

    const folio = await this.getGuestFolio(reservationId);
    if (!folio) throw new Error('Folio not found');

    const room = this.rooms.find((r) => r.id === res.roomId);
    if (!room) throw new Error('Room associated with reservation not found');

    // If final payment made
    if (paidAmount && paidAmount > 0) {
      await this.createPayment({
        reservationId: res.id,
        guestId: res.guestId,
        guestName: res.guestName,
        roomNumber: room.roomNumber,
        department: 'Rooms',
        amount: paidAmount,
        method: paymentMethod as any,
        reference: `OUT-${res.reservationCode}`,
        collectedById: 'user-3',
        collectedByName: 'Chioma Adeyemi',
        date: new Date().toISOString(),
        notes: `Final settlement payment on checkout`,
      });
      folio.totalPayments += paidAmount;
      folio.balanceDue = Math.max(0, folio.balanceDue - paidAmount);
    }

    // Reservation marked checked out
    res.status = 'Checked Out';
    res.balanceDue = folio.balanceDue;
    res.updatedAt = new Date().toISOString();

    // IMPORTANT HOTEL RULE: Released room becomes 'Cleaning', never directly Available!
    room.status = 'Cleaning';
    room.currentReservationId = undefined;
    room.currentGuestId = undefined;
    room.currentGuestName = undefined;
    room.notes = `Checkout completed. Full room sanitization required before next arrival.`;
    room.lastUpdated = new Date().toISOString();

    // Create or update Housekeeping task
    const existingHk = this.housekeepingTasks.find((t) => t.roomId === room.id);
    if (existingHk) {
      existingHk.status = 'Needs Cleaning';
      existingHk.priority = 'High';
      existingHk.guestOccupied = false;
      existingHk.notes = `Guest checkout completed. Deep sanitization & fresh linens required.`;
      existingHk.updatedAt = new Date().toISOString();
    } else {
      this.housekeepingTasks.push({
        id: `hk-${Date.now()}`,
        roomId: room.id,
        roomNumber: room.roomNumber,
        roomType: room.roomType?.name || 'Standard',
        floor: room.floor,
        status: 'Needs Cleaning',
        priority: 'High',
        guestOccupied: false,
        notes: `Guest checkout completed. Deep clean required.`,
        updatedAt: new Date().toISOString(),
      });
    }

    // Update guest total spent
    const guest = this.guests.find((g) => g.id === res.guestId);
    if (guest) {
      guest.totalSpent += folio.totalCharges;
      guest.outstandingBalance = folio.balanceDue;
    }

    this.sync('reservations', this.reservations);
    this.sync('rooms', this.rooms);
    this.sync('housekeeping', this.housekeepingTasks);
    this.sync('guests', this.guests);

    await this.logAction({
      userId: 'user-3',
      userName: 'Chioma Adeyemi',
      userRole: 'reception',
      module: 'Front Desk',
      action: 'Checked Out Guest',
      recordId: res.id,
      recordIdentifier: `Room ${room.roomNumber} - ${res.guestName}`,
      details: `Settled checkout. Room set to Cleaning status. Balance: ₦${folio.balanceDue}`,
    });

    return { reservation: res, room, folio };
  }

  // --- Guest Folio Calculation ---
  async getGuestFolio(reservationId: string): Promise<GuestFolio | null> {
    const res = this.reservations.find((r) => r.id === reservationId);
    if (!res) return null;

    const items: GuestFolio['items'] = [];

    // 1. Room Charge
    items.push({
      id: `folio-room-${res.id}`,
      date: res.checkInDate,
      description: `Room Accommodation (${res.nights} nights @ ₦${res.ratePerNight.toLocaleString()}/night)`,
      department: 'Room Charge',
      amount: res.totalRoomCharge,
      postedBy: res.createdByName,
    });

    // 2. Restaurant Orders charged to this room/guest
    const roomOrders = this.orders.filter(
      (o) =>
        o.paymentMethod === 'Room Charge' &&
        (o.roomId === res.roomId || o.guestId === res.guestId || o.roomNumber === res.roomNumber)
    );

    let restaurantTotal = 0;
    roomOrders.forEach((o) => {
      restaurantTotal += o.totalAmount;
      items.push({
        id: `folio-ord-${o.id}`,
        date: o.createdAt.split('T')[0],
        description: `Restaurant Order #${o.orderNumber} (${o.items.map((i) => i.name).join(', ')})`,
        department: 'Restaurant',
        amount: o.totalAmount,
        reference: o.orderNumber,
        postedBy: o.waiterName,
      });
    });

    // 3. Payments made
    const resPayments = this.payments.filter(
      (p) => (!p.isVoided && (p.reservationId === res.id || p.guestId === res.guestId))
    );

    let paymentTotal = 0;
    resPayments.forEach((p) => {
      paymentTotal += p.amount;
      items.push({
        id: `folio-pay-${p.id}`,
        date: p.date.split('T')[0],
        description: `Payment Received (${p.method} - ${p.reference})`,
        department: 'Payment',
        amount: -p.amount,
        reference: p.receiptNumber,
        postedBy: p.collectedByName,
      });
    });

    const totalCharges = res.totalRoomCharge + restaurantTotal;
    const balanceDue = Math.max(0, totalCharges - paymentTotal);

    return {
      reservationId: res.id,
      guestId: res.guestId,
      guestName: res.guestName,
      roomNumber: res.roomNumber || '—',
      checkInDate: res.checkInDate,
      checkOutDate: res.checkOutDate,
      items,
      totalRoomCharges: res.totalRoomCharge,
      totalRestaurantCharges: restaurantTotal,
      totalBarCharges: 0,
      totalOtherCharges: 0,
      totalCharges,
      totalPayments: paymentTotal,
      balanceDue,
    };
  }

  // --- Guests ---
  async getGuests(): Promise<Guest[]> {
    return [...this.guests].sort((a, b) => b.totalSpent - a.totalSpent);
  }

  async getGuestById(id: string): Promise<Guest | null> {
    return this.guests.find((g) => g.id === id) || null;
  }

  async createGuest(data: Omit<Guest, 'id' | 'fullName' | 'createdAt' | 'updatedAt' | 'totalVisits' | 'totalBookings' | 'totalSpent' | 'outstandingBalance'> & { fullName?: string }): Promise<Guest> {
    const newGuest: Guest = {
      ...data,
      fullName: data.fullName || `${data.firstName} ${data.lastName}`,
      id: `guest-${Date.now()}`,
      totalVisits: 0,
      totalBookings: 0,
      totalSpent: 0,
      outstandingBalance: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.guests.push(newGuest);
    this.sync('guests', this.guests);
    return newGuest;
  }

  async updateGuest(id: string, updates: Partial<Guest>): Promise<Guest> {
    const index = this.guests.findIndex((g) => g.id === id);
    if (index === -1) throw new Error('Guest not found');
    this.guests[index] = {
      ...this.guests[index],
      ...updates,
      fullName: updates.firstName && updates.lastName
        ? `${updates.firstName} ${updates.lastName}`
        : this.guests[index].fullName,
      updatedAt: new Date().toISOString(),
    };
    this.sync('guests', this.guests);
    return this.guests[index];
  }

  // --- Housekeeping ---
  async getHousekeepingTasks(): Promise<HousekeepingTask[]> {
    return [...this.housekeepingTasks];
  }

  async updateTaskStatus(
    taskId: string,
    status: HousekeepingTask['status'],
    staffName: string = 'Staff',
    notes?: string
  ): Promise<HousekeepingTask> {
    const task = this.housekeepingTasks.find((t) => t.id === taskId);
    if (!task) throw new Error('Task not found');

    task.status = status;
    task.updatedAt = new Date().toISOString();
    if (notes) task.notes = notes;

    if (status === 'Cleaning') {
      task.startedAt = new Date().toISOString();
      task.assignedToName = staffName;
    } else if (status === 'Inspection') {
      task.completedAt = new Date().toISOString();
    } else if (status === 'Ready') {
      task.inspectedBy = staffName;
      task.inspectedAt = new Date().toISOString();

      // Update room to Available or Reserved
      const room = this.rooms.find((r) => r.id === task.roomId);
      if (room) {
        room.status = room.currentReservationId ? 'Reserved' : 'Available';
        room.lastCleanedAt = new Date().toISOString();
        room.cleanedBy = task.assignedToName || staffName;
        room.lastInspectedAt = new Date().toISOString();
        room.inspectedBy = staffName;
        room.lastUpdated = new Date().toISOString();
        this.sync('rooms', this.rooms);
      }
    }

    this.sync('housekeeping', this.housekeepingTasks);
    return task;
  }

  // --- Restaurant & POS ---
  async getMenuItems(): Promise<MenuItem[]> {
    return [...this.menuItems];
  }

  async createMenuItem(item: Omit<MenuItem, 'id'>): Promise<MenuItem> {
    const newItem: MenuItem = {
      ...item,
      id: `menu-${Date.now()}`,
    };
    this.menuItems.push(newItem);
    this.sync('menu', this.menuItems);
    return newItem;
  }

  async updateMenuItem(id: string, updates: Partial<MenuItem>): Promise<MenuItem> {
    const index = this.menuItems.findIndex((m) => m.id === id);
    if (index === -1) throw new Error('Menu item not found');
    this.menuItems[index] = { ...this.menuItems[index], ...updates };
    this.sync('menu', this.menuItems);
    return this.menuItems[index];
  }

  async getOrders(): Promise<RestaurantOrder[]> {
    return [...this.orders].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async createOrder(
    data: Omit<RestaurantOrder, 'id' | 'orderNumber' | 'createdAt'>
  ): Promise<RestaurantOrder> {
    const orderNum = Math.floor(1000 + Math.random() * 9000);
    const newOrder: RestaurantOrder = {
      ...data,
      id: `order-${Date.now()}`,
      orderNumber: `POS-2026-${orderNum}`,
      createdAt: new Date().toISOString(),
    };
    this.orders.unshift(newOrder);
    this.sync('orders', this.orders);

    // If payment was made directly (Cash/POS/Transfer), record in payments
    if (['Cash', 'POS', 'Transfer'].includes(newOrder.paymentMethod)) {
      await this.createPayment({
        guestName: newOrder.guestName || `Restaurant Customer (${newOrder.tableOrRoom})`,
        department: 'Restaurant',
        amount: newOrder.totalAmount,
        method: newOrder.paymentMethod as any,
        reference: newOrder.orderNumber,
        collectedById: newOrder.waiterId,
        collectedByName: newOrder.waiterName,
        date: new Date().toISOString(),
        notes: `Restaurant POS Order ${newOrder.orderNumber}`,
      });
    }

    await this.logAction({
      userId: newOrder.waiterId,
      userName: newOrder.waiterName,
      userRole: 'restaurant_bar',
      module: 'POS',
      action: 'Created Order',
      recordId: newOrder.id,
      recordIdentifier: newOrder.orderNumber,
      details: `Order for ${newOrder.tableOrRoom} - ₦${newOrder.totalAmount.toLocaleString()} (${newOrder.paymentMethod})`,
    });

    return newOrder;
  }

  // --- Inventory ---
  async getInventoryItems(): Promise<InventoryItem[]> {
    return [...this.inventoryItems];
  }

  async createInventoryItem(
    item: Omit<InventoryItem, 'id' | 'totalValue' | 'lastUpdated'>
  ): Promise<InventoryItem> {
    const newItem: InventoryItem = {
      ...item,
      id: `inv-${Date.now()}`,
      totalValue: item.currentStock * item.unitCost,
      lastUpdated: new Date().toISOString(),
    };
    this.inventoryItems.push(newItem);
    this.sync('inventory', this.inventoryItems);
    return newItem;
  }

  async updateInventoryItem(id: string, updates: Partial<InventoryItem>): Promise<InventoryItem> {
    const index = this.inventoryItems.findIndex((i) => i.id === id);
    if (index === -1) throw new Error('Inventory item not found');
    const updated = {
      ...this.inventoryItems[index],
      ...updates,
      lastUpdated: new Date().toISOString(),
    };
    updated.totalValue = updated.currentStock * updated.unitCost;
    this.inventoryItems[index] = updated;
    this.sync('inventory', this.inventoryItems);
    return updated;
  }

  async recordStockOperation(
    op: Omit<StockTransaction, 'id' | 'createdAt'>
  ): Promise<StockTransaction> {
    const item = this.inventoryItems.find((i) => i.id === op.itemId);
    if (!item) throw new Error('Inventory item not found');

    let newStock = item.currentStock;
    if (op.operationType === 'Stock In') {
      newStock += op.quantity;
    } else {
      // Stock Out, Damaged, Expired
      if (item.currentStock < op.quantity) {
        throw new Error(
          `Insufficient stock: Cannot remove ${op.quantity} ${item.unit}. Only ${item.currentStock} available in inventory.`
        );
      }
      newStock -= op.quantity;
    }

    item.currentStock = newStock;
    item.totalValue = item.currentStock * item.unitCost;
    item.lastUpdated = new Date().toISOString();
    if (op.operationType === 'Stock In') {
      item.lastRestockedDate = new Date().toISOString().split('T')[0];
    }

    const tx: StockTransaction = {
      ...op,
      id: `st-${Date.now()}`,
      previousStock: op.previousStock,
      newStock,
      totalValue: op.quantity * item.unitCost,
      createdAt: new Date().toISOString(),
    };

    this.stockTransactions.unshift(tx);
    this.sync('inventory', this.inventoryItems);
    this.sync('stock_tx', this.stockTransactions);

    await this.logAction({
      userId: op.performedBy,
      userName: op.performedByName,
      userRole: 'inventory_officer',
      module: 'Inventory',
      action: `${op.operationType} Operation`,
      recordId: tx.id,
      recordIdentifier: item.name,
      details: `${op.operationType} ${op.quantity} ${item.unit}. New balance: ${newStock}`,
    });

    return tx;
  }

  async getStockTransactions(): Promise<StockTransaction[]> {
    return [...this.stockTransactions];
  }

  // --- Procurement ---
  async getSuppliers(): Promise<Supplier[]> {
    return [...this.suppliers];
  }

  async createSupplier(supplier: Omit<Supplier, 'id' | 'totalOrders' | 'totalSpend'>): Promise<Supplier> {
    const newSup: Supplier = {
      ...supplier,
      id: `sup-${Date.now()}`,
      totalOrders: 0,
      totalSpend: 0,
    };
    this.suppliers.push(newSup);
    this.sync('suppliers', this.suppliers);
    return newSup;
  }

  async getPurchaseOrders(): Promise<PurchaseOrder[]> {
    return [...this.purchaseOrders].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async createPurchaseOrder(
    po: Omit<PurchaseOrder, 'id' | 'poNumber' | 'createdAt' | 'updatedAt'>
  ): Promise<PurchaseOrder> {
    const poNum = Math.floor(1000 + Math.random() * 9000);
    const newPO: PurchaseOrder = {
      ...po,
      id: `po-${Date.now()}`,
      poNumber: `PO-2026-${poNum}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.purchaseOrders.unshift(newPO);
    this.sync('purchase_orders', this.purchaseOrders);
    return newPO;
  }

  async updatePurchaseOrderStatus(
    id: string,
    status: PurchaseOrder['status'],
    staffName: string = 'Staff'
  ): Promise<PurchaseOrder> {
    const po = this.purchaseOrders.find((p) => p.id === id);
    if (!po) throw new Error('Purchase order not found');

    po.status = status;
    po.updatedAt = new Date().toISOString();

    if (status === 'Approved') {
      po.approvedByName = staffName;
    } else if (status === 'Goods Received') {
      po.receivedByName = staffName;
      // Update supplier stats
      const sup = this.suppliers.find((s) => s.id === po.supplierId);
      if (sup) {
        sup.totalOrders += 1;
        sup.totalSpend += po.totalAmount;
      }
    }

    this.sync('purchase_orders', this.purchaseOrders);
    this.sync('suppliers', this.suppliers);
    return po;
  }

  // --- Finance ---
  async getPayments(): Promise<Payment[]> {
    return [...this.payments].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  async createPayment(data: Omit<Payment, 'id' | 'receiptNumber'>): Promise<Payment> {
    const num = Math.floor(1000 + Math.random() * 9000);
    const payment: Payment = {
      ...data,
      id: `pay-${Date.now()}`,
      receiptNumber: `RCP-2026-${num}`,
    };
    this.payments.unshift(payment);
    this.sync('payments', this.payments);
    return payment;
  }

  async voidPayment(id: string, reason: string): Promise<Payment> {
    const p = this.payments.find((pay) => pay.id === id);
    if (!p) throw new Error('Payment not found');
    p.isVoided = true;
    p.voidReason = reason;
    this.sync('payments', this.payments);

    await this.logAction({
      userId: 'current-user',
      userName: 'Finance Officer',
      userRole: 'finance_officer',
      module: 'Finance',
      action: 'Voided Payment',
      recordId: p.id,
      recordIdentifier: p.receiptNumber,
      details: `Voided payment of ₦${p.amount.toLocaleString()}. Reason: ${reason}`,
    });

    return p;
  }

  async getExpenses(): Promise<Expense[]> {
    return [...this.expenses].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async createExpense(data: Omit<Expense, 'id' | 'voucherNumber' | 'createdAt'>): Promise<Expense> {
    const num = Math.floor(1000 + Math.random() * 9000);
    const expense: Expense = {
      ...data,
      id: `exp-${Date.now()}`,
      voucherNumber: `EXP-2026-${num}`,
      createdAt: new Date().toISOString(),
    };
    this.expenses.unshift(expense);
    this.sync('expenses', this.expenses);

    await this.logAction({
      userId: data.recordedById,
      userName: data.recordedByName,
      userRole: 'finance_officer',
      module: 'Finance',
      action: 'Recorded Expense',
      recordId: expense.id,
      recordIdentifier: expense.voucherNumber,
      details: `Expense ₦${data.amount.toLocaleString()} for ${data.category}`,
    });

    return expense;
  }

  // --- Maintenance ---
  async getMaintenanceRequests(): Promise<MaintenanceRequest[]> {
    return [...this.maintenanceRequests].sort(
      (a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime()
    );
  }

  async createMaintenanceRequest(
    data: Omit<MaintenanceRequest, 'id' | 'ticketNumber' | 'reportedAt'>
  ): Promise<MaintenanceRequest> {
    const num = Math.floor(100 + Math.random() * 900);
    const req: MaintenanceRequest = {
      ...data,
      id: `maint-${Date.now()}`,
      ticketNumber: `MNT-2026-0${num}`,
      reportedAt: new Date().toISOString(),
    };
    this.maintenanceRequests.unshift(req);

    // If room is affected and priority is High/Critical, mark room as Maintenance
    const match = data.roomOrFacility.match(/\b(?:Room\s*)?(\d{3})\b/i);
    if (match) {
      const roomNum = match[1];
      const room = this.rooms.find((r) => r.roomNumber === roomNum);
      if (room && (data.priority === 'High' || data.priority === 'Critical')) {
        room.status = 'Maintenance';
        room.notes = `Under maintenance: ${data.issue}`;
        this.sync('rooms', this.rooms);
      }
    }

    this.sync('maintenance', this.maintenanceRequests);
    return req;
  }

  async updateMaintenanceStatus(
    id: string,
    status: MaintenanceRequest['status'],
    notes?: string
  ): Promise<MaintenanceRequest> {
    const req = this.maintenanceRequests.find((m) => m.id === id);
    if (!req) throw new Error('Maintenance request not found');
    req.status = status;
    if (notes) req.resolutionNotes = notes;
    if (status === 'Resolved' || status === 'Closed') {
      req.resolvedAt = new Date().toISOString();

      // Check if room can be released to Cleaning
      const match = req.roomOrFacility.match(/\b(?:Room\s*)?(\d{3})\b/i);
      if (match) {
        const roomNum = match[1];
        const room = this.rooms.find((r) => r.roomNumber === roomNum);
        if (room && room.status === 'Maintenance') {
          room.status = 'Cleaning';
          room.notes = `Maintenance resolved (${req.issue}). Housekeeping sanitization required.`;
          this.sync('rooms', this.rooms);
        }
      }
    }
    this.sync('maintenance', this.maintenanceRequests);
    return req;
  }

  // --- Audit ---
  async getAuditLogs(): Promise<AuditLog[]> {
    return [...this.auditLogs].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  async logAction(logData: Omit<AuditLog, 'id' | 'timestamp'>): Promise<void> {
    const newLog: AuditLog = {
      ...logData,
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
    };
    this.auditLogs.unshift(newLog);
    if (this.auditLogs.length > 200) this.auditLogs.pop();
    this.sync('audit_logs', this.auditLogs);
  }

  // --- Users ---
  async getUsers(): Promise<UserProfile[]> {
    return [...this.users];
  }

  async createUser(data: Omit<UserProfile, 'id' | 'createdAt' | 'lastLogin'>): Promise<UserProfile> {
    const email = data.email.trim().toLowerCase();
    if (this.users.some((u) => u.email.toLowerCase() === email)) {
      throw new Error('A staff member with this email already exists');
    }
    const newUser: UserProfile = {
      ...data,
      email,
      id: `user-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.users.push(newUser);
    this.sync('users', this.users);
    return newUser;
  }

  async updateUser(id: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    const index = this.users.findIndex((u) => u.id === id);
    if (index === -1) throw new Error('User not found');
    this.users[index] = { ...this.users[index], ...updates };
    this.sync('users', this.users);
    return this.users[index];
  }

  // --- Settings ---
  async getSettings(): Promise<HotelSettings> {
    return { ...this.settings };
  }

  async updateSettings(updates: Partial<HotelSettings>): Promise<HotelSettings> {
    this.settings = { ...this.settings, ...updates };
    this.sync('settings', this.settings);
    return this.settings;
  }
}
