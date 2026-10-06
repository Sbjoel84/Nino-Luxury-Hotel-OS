export type UserRole =
  | 'super_admin'
  | 'management'
  | 'reception'
  | 'housekeeping'
  | 'restaurant_bar'
  | 'inventory_officer'
  | 'procurement_officer'
  | 'finance_officer'
  | 'maintenance_officer';

export type Permission =
  | 'dashboard.view'
  | 'rooms.view'
  | 'rooms.manage'
  | 'reservations.view'
  | 'reservations.create'
  | 'reservations.edit'
  | 'reservations.cancel'
  | 'frontdesk.checkin'
  | 'frontdesk.checkout'
  | 'guests.view'
  | 'guests.manage'
  | 'housekeeping.view'
  | 'housekeeping.manage'
  | 'pos.access'
  | 'pos.discount'
  | 'inventory.view'
  | 'inventory.manage'
  | 'procurement.manage'
  | 'finance.view'
  | 'finance.manage'
  | 'maintenance.view'
  | 'maintenance.manage'
  | 'reports.view'
  | 'users.manage'
  | 'audit.view'
  | 'settings.manage';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  /** Custom page access. When set, replaces the role's default permissions. */
  permissions?: Permission[] | null;
  department: string;
  phone?: string;
  avatarUrl?: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

export type RoomStatus =
  | 'Available'
  | 'Occupied'
  | 'Reserved'
  | 'Cleaning'
  | 'Inspected'
  | 'Maintenance'
  | 'Out of Service';

export interface RoomType {
  id: string;
  name: string;
  code: string;
  baseRate: number; // in NGN ₦
  capacityAdults: number;
  capacityChildren: number;
  description: string;
  amenities: string[];
  totalRooms: number;
  image?: string;
}

export interface Room {
  id: string;
  roomNumber: string;
  roomTypeId: string;
  roomType?: RoomType;
  floor: number;
  status: RoomStatus;
  currentReservationId?: string;
  currentGuestName?: string;
  currentGuestId?: string;
  ratePerNight: number;
  isSmoking: boolean;
  notes?: string;
  lastCleanedAt?: string;
  cleanedBy?: string;
  lastInspectedAt?: string;
  inspectedBy?: string;
  lastUpdated: string;
}

export type ReservationStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Checked In'
  | 'Checked Out'
  | 'Cancelled'
  | 'No Show';

export type BookingSource =
  | 'Walk-in'
  | 'Direct Phone'
  | 'Hotel Website'
  | 'Booking.com'
  | 'Corporate Partner'
  | 'Travel Agent'
  | 'Government/Diplomatic';

export interface Reservation {
  id: string;
  reservationCode: string;
  guestId: string;
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  roomId?: string;
  roomNumber?: string;
  roomTypeId: string;
  roomTypeName?: string;
  checkInDate: string; // YYYY-MM-DD
  checkOutDate: string; // YYYY-MM-DD
  nights: number;
  numberOfAdults: number;
  numberOfChildren: number;
  ratePerNight: number;
  discountAmount: number;
  discountPercentage: number;
  totalRoomCharge: number;
  depositPaid: number;
  balanceDue: number;
  bookingSource: BookingSource;
  status: ReservationStatus;
  specialRequests?: string;
  flightDetails?: string;
  notes?: string;
  createdById: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
}

export interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  altPhone?: string;
  address?: string;
  city: string;
  state: string;
  country: string;
  identificationType: 'National ID (NIN)' | 'International Passport' | "Driver's License" | "Voter's Card";
  identificationNumber: string;
  nationality: string;
  isVIP: boolean;
  totalVisits: number;
  totalBookings: number;
  totalSpent: number; // in NGN ₦
  outstandingBalance: number;
  lastVisitDate?: string;
  notes?: string;
  companyName?: string;
  carPlateNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export type HousekeepingStatus =
  | 'Needs Cleaning'
  | 'Cleaning'
  | 'Inspection'
  | 'Ready'
  | 'Maintenance';

export interface HousekeepingTask {
  id: string;
  roomId: string;
  roomNumber: string;
  roomType: string;
  floor: number;
  status: HousekeepingStatus;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  assignedTo?: string;
  assignedToName?: string;
  startedAt?: string;
  completedAt?: string;
  inspectedBy?: string;
  inspectedAt?: string;
  notes?: string;
  guestOccupied: boolean;
  updatedAt: string;
}

export type POSPaymentMethod = 'Cash' | 'Transfer' | 'POS' | 'Room Charge' | 'Other';

export interface MenuItem {
  id: string;
  name: string;
  code: string;
  category: 'Food' | 'Beverage' | 'Cocktails' | 'Wine & Spirits' | 'Snacks' | 'Dessert';
  price: number; // in NGN ₦
  description?: string;
  available: boolean;
  preparationTimeMins?: number;
  costPrice?: number;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
  subtotal: number;
}

export interface RestaurantOrder {
  id: string;
  orderNumber: string;
  tableOrRoom: string;
  isRoomService: boolean;
  roomId?: string;
  roomNumber?: string;
  guestId?: string;
  guestName?: string;
  items: OrderItem[];
  subtotal: number;
  taxAmount: number; // 7.5% VAT in Nigeria
  discountAmount: number;
  totalAmount: number;
  paymentMethod: POSPaymentMethod;
  paymentStatus: 'Paid' | 'Charged to Room' | 'Pending';
  waiterId: string;
  waiterName: string;
  createdAt: string;
  notes?: string;
}

export type InventoryCategory =
  | 'Food'
  | 'Beverage'
  | 'Cleaning'
  | 'Toiletries'
  | 'Maintenance'
  | 'Kitchen'
  | 'Laundry'
  | 'Office'
  | 'Guest Amenities'
  | 'Other';

export interface InventoryItem {
  id: string;
  name: string;
  code: string;
  category: InventoryCategory;
  unit: string; // e.g. Pack, Bottle, Kg, Crate, Box, Roll
  currentStock: number;
  minimumStock: number;
  reorderPoint: number;
  unitCost: number; // in NGN ₦
  totalValue: number;
  supplierId?: string;
  supplierName?: string;
  location: string; // e.g. Main Store, Kitchen Store, Bar Chiller, Housekeeping Linen Room
  lastRestockedDate?: string;
  lastUpdated: string;
}

export type StockOperationType =
  | 'Stock In'
  | 'Stock Out'
  | 'Adjustment'
  | 'Damaged'
  | 'Expired'
  | 'Transfer';

export interface StockTransaction {
  id: string;
  itemId: string;
  itemName: string;
  operationType: StockOperationType;
  quantity: number;
  previousStock: number;
  newStock: number;
  unitCost: number;
  totalValue: number;
  referenceDoc?: string;
  department: string;
  performedBy: string;
  performedByName: string;
  reason?: string;
  createdAt: string;
}

export interface Supplier {
  id: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  categories: InventoryCategory[];
  paymentTerms: string;
  bankDetails?: string;
  totalOrders: number;
  totalSpend: number;
  rating: number;
  notes?: string;
  isActive: boolean;
}

export type PurchaseStatus =
  | 'Purchase Request'
  | 'Approved'
  | 'Purchased'
  | 'Goods Received'
  | 'Cancelled';

export interface PurchaseOrderItem {
  itemId?: string;
  itemName: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  supplierPhone?: string;
  requestedBy: string;
  requestedByName: string;
  department: string;
  items: PurchaseOrderItem[];
  totalAmount: number;
  status: PurchaseStatus;
  approvedBy?: string;
  approvedByName?: string;
  receivedBy?: string;
  receivedByName?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type PaymentDepartment = 'Rooms' | 'Restaurant' | 'Bar' | 'Laundry' | 'Conferences' | 'Other';

export interface Payment {
  id: string;
  receiptNumber: string;
  reservationId?: string;
  guestId?: string;
  guestName: string;
  roomNumber?: string;
  department: PaymentDepartment;
  amount: number;
  method: 'Cash' | 'Transfer' | 'POS' | 'Cheque' | 'Credit';
  reference: string; // Transfer ref or POS terminal trace
  collectedById: string;
  collectedByName: string;
  date: string;
  notes?: string;
  isVoided?: boolean;
  voidReason?: string;
}

export type ExpenseCategory =
  | 'Utilities & Diesel (Power Generator)'
  | 'Food & Beverage Procurement'
  | 'Housekeeping & Laundry Supplies'
  | 'Maintenance & Repairs'
  | 'Salaries & Staff Welfare'
  | 'Internet & Subscriptions'
  | 'Government Rates & Licenses (AMAC/Abuja)'
  | 'Marketing & Guest Relations'
  | 'Petty Cash & Miscellaneous';

export interface Expense {
  id: string;
  voucherNumber: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  description: string;
  paymentMethod: 'Cash' | 'Transfer' | 'Bank Cheque';
  reference: string;
  recordedById: string;
  recordedByName: string;
  approvedBy?: string;
  beneficiary: string;
  createdAt: string;
  isVoided?: boolean;
}

export type MaintenancePriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type MaintenanceStatus = 'Open' | 'Assigned' | 'In Progress' | 'Resolved' | 'Closed';

export interface MaintenanceRequest {
  id: string;
  ticketNumber: string;
  roomOrFacility: string; // e.g. Room 204, Gen House, Central Chiller, Restaurant AC 2
  category: 'Plumbing' | 'Electrical' | 'HVAC / AC' | 'Carpentry & Furniture' | 'Electronics' | 'Civil Works';
  issue: string;
  description: string;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  reportedById: string;
  reportedByName: string;
  assignedTo?: string;
  assignedToName?: string;
  estimatedCost?: number;
  actualCost?: number;
  reportedAt: string;
  resolvedAt?: string;
  resolutionNotes?: string;
}

export interface FolioItem {
  id: string;
  date: string;
  description: string;
  department: 'Room Charge' | 'Restaurant' | 'Bar' | 'Laundry' | 'Service Fee' | 'Payment';
  amount: number; // positive for charges, negative for payments
  reference?: string;
  postedBy: string;
}

export interface GuestFolio {
  reservationId: string;
  guestId: string;
  guestName: string;
  roomNumber: string;
  checkInDate: string;
  checkOutDate: string;
  items: FolioItem[];
  totalRoomCharges: number;
  totalRestaurantCharges: number;
  totalBarCharges: number;
  totalOtherCharges: number;
  totalCharges: number;
  totalPayments: number;
  balanceDue: number;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  module:
    | 'Front Desk'
    | 'Rooms'
    | 'Reservations'
    | 'Guests'
    | 'Housekeeping'
    | 'POS'
    | 'Inventory'
    | 'Procurement'
    | 'Finance'
    | 'Maintenance'
    | 'Users'
    | 'Settings';
  action: string;
  recordId: string;
  recordIdentifier: string;
  details: string;
  ipAddress?: string;
}

export interface HotelSettings {
  hotelName: string;
  address: string;
  district: string;
  city: string;
  state: string;
  country: string;
  phone: string;
  altPhone: string;
  email: string;
  website: string;
  checkInTime: string;
  checkOutTime: string;
  vatRate: number; // 7.5%
  serviceChargeRate: number; // 5%
  currencySymbol: string; // ₦
  currencyCode: string; // NGN
  generatorRunHoursPerDay?: number;
  bankDetails: {
    bankName: string;
    accountName: string;
    accountNumber: string;
  };
}
