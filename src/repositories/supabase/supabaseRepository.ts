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
import { supabase } from '../../services/supabase/client';
import { IHotelRepository } from '../repositoryInterface';

/**
 * Supabase-backed implementation of IHotelRepository.
 * Maps clean service functions to Supabase tables.
 */
export class SupabaseHotelRepository implements IHotelRepository {
  async getRooms(): Promise<Room[]> {
    const { data, error } = await supabase.from('rooms').select('*, roomType:room_types(*)');
    if (error) throw error;
    return (data as any[]) || [];
  }

  async getRoomById(id: string): Promise<Room | null> {
    const { data, error } = await supabase.from('rooms').select('*, roomType:room_types(*)').eq('id', id).single();
    if (error) return null;
    return data as Room;
  }

  async createRoom(room: Omit<Room, 'id' | 'lastUpdated'>): Promise<Room> {
    const { data, error } = await supabase.from('rooms').insert([room]).select().single();
    if (error) throw error;
    return data as Room;
  }

  async updateRoom(id: string, updates: Partial<Room>): Promise<Room> {
    const { data, error } = await supabase.from('rooms').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data as Room;
  }

  async deleteRoom(id: string): Promise<boolean> {
    const { error } = await supabase.from('rooms').delete().eq('id', id);
    if (error) throw error;
    return true;
  }

  async getRoomTypes(): Promise<RoomType[]> {
    const { data, error } = await supabase.from('room_types').select('*');
    if (error) throw error;
    return (data as RoomType[]) || [];
  }

  async getReservations(): Promise<Reservation[]> {
    const { data, error } = await supabase.from('reservations').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data as Reservation[]) || [];
  }

  async getReservationById(id: string): Promise<Reservation | null> {
    const { data, error } = await supabase.from('reservations').select('*').eq('id', id).single();
    if (error) return null;
    return data as Reservation;
  }

  async createReservation(reservation: Omit<Reservation, 'id' | 'reservationCode' | 'createdAt' | 'updatedAt'>): Promise<Reservation> {
    const { data, error } = await supabase.from('reservations').insert([reservation]).select().single();
    if (error) throw error;
    return data as Reservation;
  }

  async updateReservation(id: string, updates: Partial<Reservation>): Promise<Reservation> {
    const { data, error } = await supabase.from('reservations').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data as Reservation;
  }

  async cancelReservation(id: string, reason?: string): Promise<Reservation> {
    return this.updateReservation(id, { status: 'Cancelled', specialRequests: reason });
  }

  async checkInReservation(reservationId: string, roomId: string, deposit?: number): Promise<{ reservation: Reservation; room: Room }> {
    const { data, error } = await supabase.rpc('check_in_guest', {
      p_reservation_id: reservationId,
      p_room_id: roomId,
      p_deposit: deposit || 0,
    });
    if (error) {
      // Fallback update
      const res = await this.updateReservation(reservationId, { status: 'Checked In', roomId });
      const room = await this.updateRoom(roomId, { status: 'Occupied', currentReservationId: reservationId });
      return { reservation: res, room };
    }
    return data;
  }

  async checkOutReservation(reservationId: string, paymentMethod?: string, paidAmount?: number): Promise<{ reservation: Reservation; room: Room; folio: GuestFolio }> {
    const res = await this.updateReservation(reservationId, { status: 'Checked Out' });
    const room = await this.updateRoom(res.roomId!, { status: 'Cleaning' });
    const folio = (await this.getGuestFolio(reservationId))!;
    return { reservation: res, room, folio };
  }

  async getGuests(): Promise<Guest[]> {
    const { data, error } = await supabase.from('guests').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data as Guest[]) || [];
  }

  async getGuestById(id: string): Promise<Guest | null> {
    const { data, error } = await supabase.from('guests').select('*').eq('id', id).single();
    if (error) return null;
    return data as Guest;
  }

  async createGuest(guest: Omit<Guest, 'id' | 'fullName' | 'createdAt' | 'updatedAt' | 'totalVisits' | 'totalBookings' | 'totalSpent' | 'outstandingBalance'> & { fullName?: string }): Promise<Guest> {
    const payload = {
      ...guest,
      fullName: guest.fullName || `${guest.firstName} ${guest.lastName}`,
    };
    const { data, error } = await supabase.from('guests').insert([payload]).select().single();
    if (error) throw error;
    return data as Guest;
  }

  async updateGuest(id: string, updates: Partial<Guest>): Promise<Guest> {
    const { data, error } = await supabase.from('guests').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data as Guest;
  }

  async getGuestFolio(reservationId: string): Promise<GuestFolio | null> {
    const res = await this.getReservationById(reservationId);
    if (!res) return null;
    return {
      reservationId: res.id,
      guestId: res.guestId,
      guestName: res.guestName,
      roomNumber: res.roomNumber || '—',
      checkInDate: res.checkInDate,
      checkOutDate: res.checkOutDate,
      items: [],
      totalRoomCharges: res.totalRoomCharge,
      totalRestaurantCharges: 0,
      totalBarCharges: 0,
      totalOtherCharges: 0,
      totalCharges: res.totalRoomCharge,
      totalPayments: res.depositPaid,
      balanceDue: res.balanceDue,
    };
  }

  async getHousekeepingTasks(): Promise<HousekeepingTask[]> {
    const { data, error } = await supabase.from('housekeeping_tasks').select('*');
    if (error) throw error;
    return (data as HousekeepingTask[]) || [];
  }

  async updateTaskStatus(taskId: string, status: HousekeepingTask['status'], staffName?: string, notes?: string): Promise<HousekeepingTask> {
    const { data, error } = await supabase.from('housekeeping_tasks').update({ status, notes }).eq('id', taskId).select().single();
    if (error) throw error;
    return data as HousekeepingTask;
  }

  async getMenuItems(): Promise<MenuItem[]> {
    const { data, error } = await supabase.from('menu_items').select('*');
    if (error) throw error;
    return (data as MenuItem[]) || [];
  }

  async createMenuItem(item: Omit<MenuItem, 'id'>): Promise<MenuItem> {
    const { data, error } = await supabase.from('menu_items').insert([item]).select().single();
    if (error) throw error;
    return data as MenuItem;
  }

  async updateMenuItem(id: string, updates: Partial<MenuItem>): Promise<MenuItem> {
    const { data, error } = await supabase.from('menu_items').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data as MenuItem;
  }

  async getOrders(): Promise<RestaurantOrder[]> {
    const { data, error } = await supabase.from('restaurant_orders').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data as RestaurantOrder[]) || [];
  }

  async createOrder(order: Omit<RestaurantOrder, 'id' | 'orderNumber' | 'createdAt'>): Promise<RestaurantOrder> {
    const { data, error } = await supabase.from('restaurant_orders').insert([order]).select().single();
    if (error) throw error;
    return data as RestaurantOrder;
  }

  async getInventoryItems(): Promise<InventoryItem[]> {
    const { data, error } = await supabase.from('inventory_items').select('*');
    if (error) throw error;
    return (data as InventoryItem[]) || [];
  }

  async createInventoryItem(item: Omit<InventoryItem, 'id' | 'totalValue' | 'lastUpdated'>): Promise<InventoryItem> {
    const { data, error } = await supabase.from('inventory_items').insert([item]).select().single();
    if (error) throw error;
    return data as InventoryItem;
  }

  async updateInventoryItem(id: string, updates: Partial<InventoryItem>): Promise<InventoryItem> {
    const { data, error } = await supabase.from('inventory_items').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data as InventoryItem;
  }

  async recordStockOperation(operation: Omit<StockTransaction, 'id' | 'createdAt'>): Promise<StockTransaction> {
    const { data, error } = await supabase.from('stock_transactions').insert([operation]).select().single();
    if (error) throw error;
    return data as StockTransaction;
  }

  async getStockTransactions(): Promise<StockTransaction[]> {
    const { data, error } = await supabase.from('stock_transactions').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data as StockTransaction[]) || [];
  }

  async getSuppliers(): Promise<Supplier[]> {
    const { data, error } = await supabase.from('suppliers').select('*');
    if (error) throw error;
    return (data as Supplier[]) || [];
  }

  async createSupplier(supplier: Omit<Supplier, 'id' | 'totalOrders' | 'totalSpend'>): Promise<Supplier> {
    const { data, error } = await supabase.from('suppliers').insert([supplier]).select().single();
    if (error) throw error;
    return data as Supplier;
  }

  async getPurchaseOrders(): Promise<PurchaseOrder[]> {
    const { data, error } = await supabase.from('purchase_orders').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data as PurchaseOrder[]) || [];
  }

  async createPurchaseOrder(po: Omit<PurchaseOrder, 'id' | 'poNumber' | 'createdAt' | 'updatedAt'>): Promise<PurchaseOrder> {
    const { data, error } = await supabase.from('purchase_orders').insert([po]).select().single();
    if (error) throw error;
    return data as PurchaseOrder;
  }

  async updatePurchaseOrderStatus(id: string, status: PurchaseOrder['status'], staffName?: string): Promise<PurchaseOrder> {
    const { data, error } = await supabase.from('purchase_orders').update({ status }).eq('id', id).select().single();
    if (error) throw error;
    return data as PurchaseOrder;
  }

  async getPayments(): Promise<Payment[]> {
    const { data, error } = await supabase.from('payments').select('*').order('date', { ascending: false });
    if (error) throw error;
    return (data as Payment[]) || [];
  }

  async createPayment(payment: Omit<Payment, 'id' | 'receiptNumber'>): Promise<Payment> {
    const { data, error } = await supabase.from('payments').insert([payment]).select().single();
    if (error) throw error;
    return data as Payment;
  }

  async voidPayment(id: string, reason: string): Promise<Payment> {
    const { data, error } = await supabase.from('payments').update({ is_voided: true, void_reason: reason }).eq('id', id).select().single();
    if (error) throw error;
    return data as Payment;
  }

  async getExpenses(): Promise<Expense[]> {
    const { data, error } = await supabase.from('expenses').select('*').order('date', { ascending: false });
    if (error) throw error;
    return (data as Expense[]) || [];
  }

  async createExpense(expense: Omit<Expense, 'id' | 'voucherNumber' | 'createdAt'>): Promise<Expense> {
    const { data, error } = await supabase.from('expenses').insert([expense]).select().single();
    if (error) throw error;
    return data as Expense;
  }

  async getMaintenanceRequests(): Promise<MaintenanceRequest[]> {
    const { data, error } = await supabase.from('maintenance_requests').select('*').order('reported_at', { ascending: false });
    if (error) throw error;
    return (data as MaintenanceRequest[]) || [];
  }

  async createMaintenanceRequest(req: Omit<MaintenanceRequest, 'id' | 'ticketNumber' | 'reportedAt'>): Promise<MaintenanceRequest> {
    const { data, error } = await supabase.from('maintenance_requests').insert([req]).select().single();
    if (error) throw error;
    return data as MaintenanceRequest;
  }

  async updateMaintenanceStatus(id: string, status: MaintenanceRequest['status'], notes?: string): Promise<MaintenanceRequest> {
    const { data, error } = await supabase.from('maintenance_requests').update({ status, resolution_notes: notes }).eq('id', id).select().single();
    if (error) throw error;
    return data as MaintenanceRequest;
  }

  async getAuditLogs(): Promise<AuditLog[]> {
    const { data, error } = await supabase.from('audit_logs').select('*').order('timestamp', { ascending: false }).limit(200);
    if (error) throw error;
    return (data as AuditLog[]) || [];
  }

  async logAction(log: Omit<AuditLog, 'id' | 'timestamp'>): Promise<void> {
    await supabase.from('audit_logs').insert([log]);
  }

  async getUsers(): Promise<UserProfile[]> {
    const { data, error } = await supabase.from('user_profiles').select('*');
    if (error) throw error;
    return (data as UserProfile[]) || [];
  }

  async createUser(user: Omit<UserProfile, 'id' | 'createdAt' | 'lastLogin'>): Promise<UserProfile> {
    const { data, error } = await supabase.from('user_profiles').insert([user]).select().single();
    if (error) throw error;
    return data as UserProfile;
  }

  async updateUser(id: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    const { data, error } = await supabase.from('user_profiles').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data as UserProfile;
  }

  async getSettings(): Promise<HotelSettings> {
    const { data, error } = await supabase.from('hotel_settings').select('*').single();
    if (error) throw error;
    return data as HotelSettings;
  }

  async updateSettings(settings: Partial<HotelSettings>): Promise<HotelSettings> {
    const { data, error } = await supabase.from('hotel_settings').update(settings).select().single();
    if (error) throw error;
    return data as HotelSettings;
  }
}
