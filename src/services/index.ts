import { IHotelRepository } from '../repositories/repositoryInterface';
import { MockHotelRepository } from '../repositories/mock/mockRepository';
import { SupabaseHotelRepository } from '../repositories/supabase/supabaseRepository';
import { isSupabaseConfigured } from './supabase/client';

// Choose repository: Supabase if configured, otherwise full Mock repository
const mockRepo = new MockHotelRepository();
const supabaseRepo = new SupabaseHotelRepository();

let currentRepo: IHotelRepository = isSupabaseConfigured() ? supabaseRepo : mockRepo;
let activeMode: 'supabase' | 'mock' = isSupabaseConfigured() ? 'supabase' : 'mock';

export function getRepository(): IHotelRepository {
  return currentRepo;
}

export function getRepositoryMode(): 'supabase' | 'mock' {
  return activeMode;
}

export function setRepositoryMode(mode: 'supabase' | 'mock'): void {
  activeMode = mode;
  currentRepo = mode === 'supabase' ? supabaseRepo : mockRepo;
}

// Domain Services wrapper for components
export const roomService = {
  getRooms: () => getRepository().getRooms(),
  getRoomById: (id: string) => getRepository().getRoomById(id),
  createRoom: (data: Parameters<IHotelRepository['createRoom']>[0]) => getRepository().createRoom(data),
  updateRoom: (id: string, data: Parameters<IHotelRepository['updateRoom']>[1]) => getRepository().updateRoom(id, data),
  deleteRoom: (id: string) => getRepository().deleteRoom(id),
  getRoomTypes: () => getRepository().getRoomTypes(),
};

export const reservationService = {
  getReservations: () => getRepository().getReservations(),
  getReservationById: (id: string) => getRepository().getReservationById(id),
  createReservation: (data: Parameters<IHotelRepository['createReservation']>[0]) => getRepository().createReservation(data),
  updateReservation: (id: string, data: Parameters<IHotelRepository['updateReservation']>[1]) => getRepository().updateReservation(id, data),
  cancelReservation: (id: string, reason?: string) => getRepository().cancelReservation(id, reason),
  checkInReservation: (reservationId: string, roomId: string, deposit?: number) => getRepository().checkInReservation(reservationId, roomId, deposit),
  checkOutReservation: (reservationId: string, paymentMethod?: string, paidAmount?: number) => getRepository().checkOutReservation(reservationId, paymentMethod, paidAmount),
  getGuestFolio: (reservationId: string) => getRepository().getGuestFolio(reservationId),
};

export const guestService = {
  getGuests: () => getRepository().getGuests(),
  getGuestById: (id: string) => getRepository().getGuestById(id),
  createGuest: (data: Parameters<IHotelRepository['createGuest']>[0]) => getRepository().createGuest(data),
  updateGuest: (id: string, data: Parameters<IHotelRepository['updateGuest']>[1]) => getRepository().updateGuest(id, data),
};

export const housekeepingService = {
  getTasks: () => getRepository().getHousekeepingTasks(),
  updateTaskStatus: (taskId: string, status: Parameters<IHotelRepository['updateTaskStatus']>[1], staffName?: string, notes?: string) =>
    getRepository().updateTaskStatus(taskId, status, staffName, notes),
};

export const restaurantService = {
  getMenuItems: () => getRepository().getMenuItems(),
  createMenuItem: (data: Parameters<IHotelRepository['createMenuItem']>[0]) => getRepository().createMenuItem(data),
  updateMenuItem: (id: string, data: Parameters<IHotelRepository['updateMenuItem']>[1]) => getRepository().updateMenuItem(id, data),
  getOrders: () => getRepository().getOrders(),
  createOrder: (data: Parameters<IHotelRepository['createOrder']>[0]) => getRepository().createOrder(data),
};

export const inventoryService = {
  getItems: () => getRepository().getInventoryItems(),
  createItem: (data: Parameters<IHotelRepository['createInventoryItem']>[0]) => getRepository().createInventoryItem(data),
  updateItem: (id: string, data: Parameters<IHotelRepository['updateInventoryItem']>[1]) => getRepository().updateInventoryItem(id, data),
  recordStockOperation: (data: Parameters<IHotelRepository['recordStockOperation']>[0]) => getRepository().recordStockOperation(data),
  getStockTransactions: () => getRepository().getStockTransactions(),
};

export const procurementService = {
  getSuppliers: () => getRepository().getSuppliers(),
  createSupplier: (data: Parameters<IHotelRepository['createSupplier']>[0]) => getRepository().createSupplier(data),
  getPurchaseOrders: () => getRepository().getPurchaseOrders(),
  createPurchaseOrder: (data: Parameters<IHotelRepository['createPurchaseOrder']>[0]) => getRepository().createPurchaseOrder(data),
  updatePurchaseOrderStatus: (id: string, status: Parameters<IHotelRepository['updatePurchaseOrderStatus']>[1], staffName?: string) =>
    getRepository().updatePurchaseOrderStatus(id, status, staffName),
};

export const financeService = {
  getPayments: () => getRepository().getPayments(),
  createPayment: (data: Parameters<IHotelRepository['createPayment']>[0]) => getRepository().createPayment(data),
  voidPayment: (id: string, reason: string) => getRepository().voidPayment(id, reason),
  getExpenses: () => getRepository().getExpenses(),
  createExpense: (data: Parameters<IHotelRepository['createExpense']>[0]) => getRepository().createExpense(data),
};

export const maintenanceService = {
  getRequests: () => getRepository().getMaintenanceRequests(),
  createRequest: (data: Parameters<IHotelRepository['createMaintenanceRequest']>[0]) => getRepository().createMaintenanceRequest(data),
  updateStatus: (id: string, status: Parameters<IHotelRepository['updateMaintenanceStatus']>[1], notes?: string) =>
    getRepository().updateMaintenanceStatus(id, status, notes),
};

export const userService = {
  getUsers: () => getRepository().getUsers(),
  createUser: (data: Parameters<IHotelRepository['createUser']>[0]) => getRepository().createUser(data),
  updateUser: (id: string, data: Parameters<IHotelRepository['updateUser']>[1]) => getRepository().updateUser(id, data),
};

export const auditService = {
  getLogs: () => getRepository().getAuditLogs(),
  logAction: (data: Parameters<IHotelRepository['logAction']>[0]) => getRepository().logAction(data),
};

export const settingsService = {
  getSettings: () => getRepository().getSettings(),
  updateSettings: (data: Parameters<IHotelRepository['updateSettings']>[0]) => getRepository().updateSettings(data),
};
