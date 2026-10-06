import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  auditService,
  financeService,
  guestService,
  housekeepingService,
  inventoryService,
  maintenanceService,
  procurementService,
  reservationService,
  restaurantService,
  roomService,
  settingsService,
  userService,
} from '../services';
import { useUIStore } from '../stores/uiStore';
import { useAuthStore } from '../stores/authStore';

export const QUERY_KEYS = {
  rooms: ['rooms'],
  roomTypes: ['roomTypes'],
  reservations: ['reservations'],
  guests: ['guests'],
  housekeeping: ['housekeeping'],
  menuItems: ['menuItems'],
  orders: ['orders'],
  inventory: ['inventory'],
  stockTransactions: ['stockTransactions'],
  suppliers: ['suppliers'],
  purchaseOrders: ['purchaseOrders'],
  payments: ['payments'],
  expenses: ['expenses'],
  maintenance: ['maintenance'],
  auditLogs: ['auditLogs'],
  users: ['users'],
  settings: ['settings'],
  folio: (resId: string) => ['folio', resId],
};

export function useRooms() {
  const qc = useQueryClient();
  const { addToast } = useUIStore();

  const query = useQuery({
    queryKey: QUERY_KEYS.rooms,
    queryFn: roomService.getRooms,
  });

  const createRoom = useMutation({
    mutationFn: roomService.createRoom,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.rooms });
      addToast({ type: 'success', title: 'Room Created', message: 'New room added successfully' });
    },
    onError: (err: any) => {
      addToast({ type: 'error', title: 'Error', message: err.message || 'Failed to create room' });
    },
  });

  const updateRoom = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) => roomService.updateRoom(id, updates),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.rooms });
      addToast({ type: 'success', title: 'Room Updated', message: 'Room details updated' });
    },
  });

  return { ...query, createRoom, updateRoom };
}

export function useRoomTypes() {
  return useQuery({
    queryKey: QUERY_KEYS.roomTypes,
    queryFn: roomService.getRoomTypes,
  });
}

export function useReservations() {
  const qc = useQueryClient();
  const { addToast } = useUIStore();

  const query = useQuery({
    queryKey: QUERY_KEYS.reservations,
    queryFn: reservationService.getReservations,
  });

  const createReservation = useMutation({
    mutationFn: reservationService.createReservation,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.reservations });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.rooms });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.payments });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.guests });
      addToast({ type: 'success', title: 'Reservation Confirmed', message: 'Booking successfully created' });
    },
    onError: (err: any) => {
      addToast({ type: 'error', title: 'Booking Conflict', message: err.message || 'Failed to create reservation' });
    },
  });

  const updateReservation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) => reservationService.updateReservation(id, updates),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.reservations });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.rooms });
      addToast({ type: 'success', title: 'Updated', message: 'Reservation updated successfully' });
    },
  });

  const cancelReservation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => reservationService.cancelReservation(id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.reservations });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.rooms });
      addToast({ type: 'info', title: 'Cancelled', message: 'Reservation has been cancelled and room released' });
    },
  });

  const checkIn = useMutation({
    mutationFn: ({ reservationId, roomId, deposit }: { reservationId: string; roomId: string; deposit?: number }) =>
      reservationService.checkInReservation(reservationId, roomId, deposit),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.reservations });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.rooms });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.payments });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.guests });
      addToast({ type: 'success', title: 'Check-In Complete', message: 'Guest has been checked into room' });
    },
    onError: (err: any) => {
      addToast({ type: 'error', title: 'Check-In Failed', message: err.message });
    },
  });

  const checkOut = useMutation({
    mutationFn: ({ reservationId, paymentMethod, paidAmount }: { reservationId: string; paymentMethod?: string; paidAmount?: number }) =>
      reservationService.checkOutReservation(reservationId, paymentMethod, paidAmount),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.reservations });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.rooms });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.housekeeping });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.payments });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.guests });
      addToast({ type: 'success', title: 'Check-Out Settled', message: 'Room released to Housekeeping for sanitization' });
    },
    onError: (err: any) => {
      addToast({ type: 'error', title: 'Check-Out Failed', message: err.message });
    },
  });

  return { ...query, createReservation, updateReservation, cancelReservation, checkIn, checkOut };
}

export function useGuestFolio(reservationId: string | null) {
  return useQuery({
    queryKey: QUERY_KEYS.folio(reservationId || ''),
    queryFn: () => (reservationId ? reservationService.getGuestFolio(reservationId) : null),
    enabled: Boolean(reservationId),
  });
}

export function useGuests() {
  const qc = useQueryClient();
  const { addToast } = useUIStore();

  const query = useQuery({
    queryKey: QUERY_KEYS.guests,
    queryFn: guestService.getGuests,
  });

  const createGuest = useMutation({
    mutationFn: guestService.createGuest,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.guests });
      addToast({ type: 'success', title: 'Guest Added', message: 'New guest profile registered' });
    },
  });

  const updateGuest = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) => guestService.updateGuest(id, updates),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.guests });
      addToast({ type: 'success', title: 'Updated', message: 'Guest profile updated' });
    },
  });

  return { ...query, createGuest, updateGuest };
}

export function useHousekeeping() {
  const qc = useQueryClient();
  const { addToast } = useUIStore();

  const query = useQuery({
    queryKey: QUERY_KEYS.housekeeping,
    queryFn: housekeepingService.getTasks,
  });

  const updateTask = useMutation({
    mutationFn: ({ taskId, status, staffName, notes }: { taskId: string; status: any; staffName?: string; notes?: string }) =>
      housekeepingService.updateTaskStatus(taskId, status, staffName, notes),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.housekeeping });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.rooms });
      addToast({ type: 'success', title: 'Task Updated', message: 'Housekeeping status changed' });
    },
  });

  return { ...query, updateTask };
}

export function useRestaurant() {
  const qc = useQueryClient();
  const { addToast } = useUIStore();

  const menuQuery = useQuery({
    queryKey: QUERY_KEYS.menuItems,
    queryFn: restaurantService.getMenuItems,
  });

  const ordersQuery = useQuery({
    queryKey: QUERY_KEYS.orders,
    queryFn: restaurantService.getOrders,
  });

  const createOrder = useMutation({
    mutationFn: restaurantService.createOrder,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.orders });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.payments });
      qc.invalidateQueries({ queryKey: ['reservations'] });
      addToast({ type: 'success', title: 'Order Submitted', message: 'Restaurant order billed successfully' });
    },
  });

  const createMenuItem = useMutation({
    mutationFn: restaurantService.createMenuItem,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.menuItems });
      addToast({ type: 'success', title: 'Item Created', message: 'New menu item available' });
    },
  });

  const updateMenuItem = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) => restaurantService.updateMenuItem(id, updates),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.menuItems });
      addToast({ type: 'success', title: 'Menu Updated', message: 'Menu item modified' });
    },
  });

  return {
    menuItems: menuQuery.data || [],
    orders: ordersQuery.data || [],
    isLoadingMenu: menuQuery.isLoading,
    isLoadingOrders: ordersQuery.isLoading,
    createOrder,
    createMenuItem,
    updateMenuItem,
    refetchMenu: menuQuery.refetch,
    refetchOrders: ordersQuery.refetch,
  };
}

export function useInventory() {
  const qc = useQueryClient();
  const { addToast } = useUIStore();

  const itemsQuery = useQuery({
    queryKey: QUERY_KEYS.inventory,
    queryFn: inventoryService.getItems,
  });

  const txQuery = useQuery({
    queryKey: QUERY_KEYS.stockTransactions,
    queryFn: inventoryService.getStockTransactions,
  });

  const recordOperation = useMutation({
    mutationFn: inventoryService.recordStockOperation,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.inventory });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.stockTransactions });
      addToast({ type: 'success', title: 'Stock Updated', message: 'Stock transaction recorded successfully' });
    },
    onError: (err: any) => {
      addToast({ type: 'error', title: 'Stock Error', message: err.message });
    },
  });

  const createItem = useMutation({
    mutationFn: inventoryService.createItem,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.inventory });
      addToast({ type: 'success', title: 'Item Added', message: 'New inventory item tracked' });
    },
  });

  return {
    items: itemsQuery.data || [],
    transactions: txQuery.data || [],
    isLoading: itemsQuery.isLoading,
    recordOperation,
    createItem,
  };
}

export function useProcurement() {
  const qc = useQueryClient();
  const { addToast } = useUIStore();

  const suppliersQuery = useQuery({
    queryKey: QUERY_KEYS.suppliers,
    queryFn: procurementService.getSuppliers,
  });

  const poQuery = useQuery({
    queryKey: QUERY_KEYS.purchaseOrders,
    queryFn: procurementService.getPurchaseOrders,
  });

  const createPO = useMutation({
    mutationFn: procurementService.createPurchaseOrder,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.purchaseOrders });
      addToast({ type: 'success', title: 'PO Raised', message: 'Purchase order created' });
    },
  });

  const updatePOStatus = useMutation({
    mutationFn: ({ id, status, staffName }: { id: string; status: any; staffName?: string }) =>
      procurementService.updatePurchaseOrderStatus(id, status, staffName),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.purchaseOrders });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.suppliers });
      addToast({ type: 'success', title: 'PO Updated', message: 'Purchase order status changed' });
    },
  });

  const createSupplier = useMutation({
    mutationFn: procurementService.createSupplier,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.suppliers });
      addToast({ type: 'success', title: 'Supplier Registered', message: 'Vendor added to registry' });
    },
  });

  return {
    suppliers: suppliersQuery.data || [],
    purchaseOrders: poQuery.data || [],
    isLoading: poQuery.isLoading,
    createPO,
    updatePOStatus,
    createSupplier,
  };
}

export function useFinance() {
  const qc = useQueryClient();
  const { addToast } = useUIStore();

  const paymentsQuery = useQuery({
    queryKey: QUERY_KEYS.payments,
    queryFn: financeService.getPayments,
  });

  const expensesQuery = useQuery({
    queryKey: QUERY_KEYS.expenses,
    queryFn: financeService.getExpenses,
  });

  const createPayment = useMutation({
    mutationFn: financeService.createPayment,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.payments });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.reservations });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.guests });
      addToast({ type: 'success', title: 'Payment Recorded', message: 'Receipt generated' });
    },
  });

  const voidPayment = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => financeService.voidPayment(id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.payments });
      addToast({ type: 'info', title: 'Payment Voided', message: 'Transaction marked as void' });
    },
  });

  const createExpense = useMutation({
    mutationFn: financeService.createExpense,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.expenses });
      addToast({ type: 'success', title: 'Expense Logged', message: 'Expense voucher recorded' });
    },
  });

  return {
    payments: paymentsQuery.data || [],
    expenses: expensesQuery.data || [],
    isLoading: paymentsQuery.isLoading || expensesQuery.isLoading,
    createPayment,
    voidPayment,
    createExpense,
  };
}

export function useMaintenance() {
  const qc = useQueryClient();
  const { addToast } = useUIStore();

  const query = useQuery({
    queryKey: QUERY_KEYS.maintenance,
    queryFn: maintenanceService.getRequests,
  });

  const createRequest = useMutation({
    mutationFn: maintenanceService.createRequest,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.maintenance });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.rooms });
      addToast({ type: 'success', title: 'Request Logged', message: 'Maintenance ticket created' });
    },
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status, notes }: { id: string; status: any; notes?: string }) =>
      maintenanceService.updateStatus(id, status, notes),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.maintenance });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.rooms });
      addToast({ type: 'success', title: 'Ticket Updated', message: 'Maintenance status changed' });
    },
  });

  return { ...query, createRequest, updateStatus };
}

export function useAuditLogs() {
  return useQuery({
    queryKey: QUERY_KEYS.auditLogs,
    queryFn: auditService.getLogs,
  });
}

export function useUsers() {
  const qc = useQueryClient();
  const { addToast } = useUIStore();

  const query = useQuery({
    queryKey: QUERY_KEYS.users,
    queryFn: userService.getUsers,
  });

  const createUser = useMutation({
    mutationFn: userService.createUser,
    onSuccess: (user) => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.users });
      addToast({ type: 'success', title: 'Staff Added', message: `${user.fullName} can now sign in` });
    },
    onError: (err: any) => {
      addToast({ type: 'error', title: 'Error', message: err.message || 'Failed to add staff member' });
    },
  });

  const updateUser = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) => userService.updateUser(id, updates),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.users });
      // Apply access changes immediately if the signed-in user edited themselves.
      const auth = useAuthStore.getState();
      if (auth.user?.id === updated.id) auth.setUser(updated);
      addToast({ type: 'success', title: 'Staff Updated', message: 'User profile updated' });
    },
    onError: (err: any) => {
      addToast({ type: 'error', title: 'Error', message: err.message || 'Failed to update staff member' });
    },
  });

  return { ...query, createUser, updateUser };
}

export function useHotelSettings() {
  const qc = useQueryClient();
  const { addToast } = useUIStore();

  const query = useQuery({
    queryKey: QUERY_KEYS.settings,
    queryFn: settingsService.getSettings,
  });

  const updateSettings = useMutation({
    mutationFn: settingsService.updateSettings,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.settings });
      addToast({ type: 'success', title: 'Settings Saved', message: 'Hotel preferences updated' });
    },
  });

  return { ...query, updateSettings };
}
