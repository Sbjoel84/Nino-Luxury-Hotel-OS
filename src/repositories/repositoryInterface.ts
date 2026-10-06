import {
  AuditLog,
  Expense,
  Guest,
  GuestFolio,
  HousekeepingTask,
  HotelSettings,
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
} from '../types';

export interface IHotelRepository {
  // Rooms
  getRooms(): Promise<Room[]>;
  getRoomById(id: string): Promise<Room | null>;
  createRoom(room: Omit<Room, 'id' | 'lastUpdated'>): Promise<Room>;
  updateRoom(id: string, updates: Partial<Room>): Promise<Room>;
  deleteRoom(id: string): Promise<boolean>;
  getRoomTypes(): Promise<RoomType[]>;

  // Reservations
  getReservations(): Promise<Reservation[]>;
  getReservationById(id: string): Promise<Reservation | null>;
  createReservation(reservation: Omit<Reservation, 'id' | 'reservationCode' | 'createdAt' | 'updatedAt'>): Promise<Reservation>;
  updateReservation(id: string, updates: Partial<Reservation>): Promise<Reservation>;
  cancelReservation(id: string, reason?: string): Promise<Reservation>;
  checkInReservation(reservationId: string, roomId: string, deposit?: number): Promise<{ reservation: Reservation; room: Room }>;
  checkOutReservation(reservationId: string, paymentMethod?: string, paidAmount?: number): Promise<{ reservation: Reservation; room: Room; folio: GuestFolio }>;

  // Guests
  getGuests(): Promise<Guest[]>;
  getGuestById(id: string): Promise<Guest | null>;
  createGuest(guest: Omit<Guest, 'id' | 'fullName' | 'createdAt' | 'updatedAt' | 'totalVisits' | 'totalBookings' | 'totalSpent' | 'outstandingBalance'> & { fullName?: string }): Promise<Guest>;
  updateGuest(id: string, updates: Partial<Guest>): Promise<Guest>;
  getGuestFolio(reservationId: string): Promise<GuestFolio | null>;

  // Housekeeping
  getHousekeepingTasks(): Promise<HousekeepingTask[]>;
  updateTaskStatus(taskId: string, status: HousekeepingTask['status'], staffName?: string, notes?: string): Promise<HousekeepingTask>;

  // Restaurant & POS
  getMenuItems(): Promise<MenuItem[]>;
  createMenuItem(item: Omit<MenuItem, 'id'>): Promise<MenuItem>;
  updateMenuItem(id: string, updates: Partial<MenuItem>): Promise<MenuItem>;
  getOrders(): Promise<RestaurantOrder[]>;
  createOrder(order: Omit<RestaurantOrder, 'id' | 'orderNumber' | 'createdAt'>): Promise<RestaurantOrder>;

  // Inventory
  getInventoryItems(): Promise<InventoryItem[]>;
  createInventoryItem(item: Omit<InventoryItem, 'id' | 'totalValue' | 'lastUpdated'>): Promise<InventoryItem>;
  updateInventoryItem(id: string, updates: Partial<InventoryItem>): Promise<InventoryItem>;
  recordStockOperation(operation: Omit<StockTransaction, 'id' | 'createdAt'>): Promise<StockTransaction>;
  getStockTransactions(): Promise<StockTransaction[]>;

  // Procurement
  getSuppliers(): Promise<Supplier[]>;
  createSupplier(supplier: Omit<Supplier, 'id' | 'totalOrders' | 'totalSpend'>): Promise<Supplier>;
  getPurchaseOrders(): Promise<PurchaseOrder[]>;
  createPurchaseOrder(po: Omit<PurchaseOrder, 'id' | 'poNumber' | 'createdAt' | 'updatedAt'>): Promise<PurchaseOrder>;
  updatePurchaseOrderStatus(id: string, status: PurchaseOrder['status'], staffName?: string): Promise<PurchaseOrder>;

  // Finance
  getPayments(): Promise<Payment[]>;
  createPayment(payment: Omit<Payment, 'id' | 'receiptNumber'>): Promise<Payment>;
  voidPayment(id: string, reason: string): Promise<Payment>;
  getExpenses(): Promise<Expense[]>;
  createExpense(expense: Omit<Expense, 'id' | 'voucherNumber' | 'createdAt'>): Promise<Expense>;

  // Maintenance
  getMaintenanceRequests(): Promise<MaintenanceRequest[]>;
  createMaintenanceRequest(req: Omit<MaintenanceRequest, 'id' | 'ticketNumber' | 'reportedAt'>): Promise<MaintenanceRequest>;
  updateMaintenanceStatus(id: string, status: MaintenanceRequest['status'], notes?: string): Promise<MaintenanceRequest>;

  // Audit Logs
  getAuditLogs(): Promise<AuditLog[]>;
  logAction(log: Omit<AuditLog, 'id' | 'timestamp'>): Promise<void>;

  // Users
  getUsers(): Promise<UserProfile[]>;
  createUser(user: Omit<UserProfile, 'id' | 'createdAt' | 'lastLogin'>): Promise<UserProfile>;
  updateUser(id: string, updates: Partial<UserProfile>): Promise<UserProfile>;

  // Settings
  getSettings(): Promise<HotelSettings>;
  updateSettings(settings: Partial<HotelSettings>): Promise<HotelSettings>;
}
