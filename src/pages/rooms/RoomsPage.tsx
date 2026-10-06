import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bed,
  CheckCircle,
  Eye,
  Filter,
  History,
  Hotel,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Wrench,
} from 'lucide-react';
import {
  useHousekeeping,
  useMaintenance,
  useReservations,
  useRooms,
  useRoomTypes,
} from '../../hooks/useHotelData';
import { formatCurrency } from '../../utils/currency';
import { formatDate, formatDateTime } from '../../utils/date';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { DataTable } from '../../components/ui/DataTable';
import { Room, RoomStatus } from '../../types';

export const RoomsPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: rooms = [], isLoading, createRoom, updateRoom } = useRooms();
  const { data: roomTypes = [] } = useRoomTypes();
  const { data: reservations = [] } = useReservations();
  const { data: maintenance = [] } = useMaintenance();
  const { data: housekeeping = [] } = useHousekeeping();

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [floorFilter, setFloorFilter] = useState<string>('all');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedRoomDetail, setSelectedRoomDetail] = useState<Room | null>(null);
  const [editRoomModal, setEditRoomModal] = useState<Room | null>(null);

  // Form states
  const [roomNumber, setRoomNumber] = useState('');
  const [roomTypeId, setRoomTypeId] = useState('');
  const [floor, setFloor] = useState(1);
  const [ratePerNight, setRatePerNight] = useState(35000);
  const [notes, setNotes] = useState('');

  // Status Change State
  const [statusChangeRoom, setStatusChangeRoom] = useState<Room | null>(null);
  const [newStatus, setNewStatus] = useState<RoomStatus>('Available');

  // Filtered dataset
  const filteredRooms = useMemo(() => {
    return rooms.filter((r) => {
      const matchStatus = statusFilter === 'all' || r.status === statusFilter;
      const matchType = typeFilter === 'all' || r.roomTypeId === typeFilter;
      const matchFloor = floorFilter === 'all' || String(r.floor) === floorFilter;
      return matchStatus && matchType && matchFloor;
    });
  }, [rooms, statusFilter, typeFilter, floorFilter]);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    await createRoom.mutateAsync({
      roomNumber,
      roomTypeId: roomTypeId || roomTypes[0]?.id || 'rt-standard',
      floor,
      status: 'Available',
      ratePerNight,
      isSmoking: false,
      notes,
    });
    setIsCreateOpen(false);
    setRoomNumber('');
    setNotes('');
  };

  const handleStatusChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusChangeRoom) return;

    await updateRoom.mutateAsync({
      id: statusChangeRoom.id,
      updates: {
        status: newStatus,
        lastUpdated: new Date().toISOString(),
      },
    });

    setStatusChangeRoom(null);
  };

  // Columns for DataTable
  const columns = [
    {
      header: 'Room Number',
      accessorKey: 'roomNumber' as keyof Room,
      sortable: true,
      cell: (r: Room) => (
        <span className="font-mono font-bold text-white text-sm">Room {r.roomNumber}</span>
      ),
    },
    {
      header: 'Room Type',
      cell: (r: Room) => (
        <div>
          <span className="font-medium text-neutral-200">{r.roomType?.name || 'Standard'}</span>
          <p className="text-[10px] text-neutral-400 font-mono">Floor {r.floor}</p>
        </div>
      ),
    },
    {
      header: 'Rate / Night',
      accessorKey: 'ratePerNight' as keyof Room,
      sortable: true,
      cell: (r: Room) => (
        <span className="font-mono tabular-nums text-neutral-200 font-medium">
          {formatCurrency(r.ratePerNight)}
        </span>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status' as keyof Room,
      sortable: true,
      cell: (r: Room) => <StatusBadge status={r.status} />,
    },
    {
      header: 'Current Guest',
      cell: (r: Room) => (
        <span className="text-neutral-300 font-medium">
          {r.currentGuestName || <span className="text-neutral-500">—</span>}
        </span>
      ),
    },
    {
      header: 'Last Cleaned / Inspected',
      cell: (r: Room) => (
        <div className="text-[11px] text-neutral-400 font-mono">
          {r.lastCleanedAt ? formatDate(r.lastCleanedAt, 'short') : '—'}
          {r.inspectedBy && <span className="text-emerald-400 ml-1">✓</span>}
        </div>
      ),
    },
    {
      header: 'Actions',
      align: 'right' as const,
      cell: (r: Room) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedRoomDetail(r)}
            icon={<Eye className="w-3.5 h-3.5" />}
          >
            Details
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setStatusChangeRoom(r);
              setNewStatus(r.status);
            }}
          >
            Status
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-neutral-900 border border-neutral-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Room Inventory & Status</h1>
          <p className="text-xs text-neutral-400 mt-1">
            24 active rooms across 3 floors • Turnovers, inspections, and guest allocations
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/room-types')}
          >
            Room Types & Pricing
          </Button>
          <Button
            variant="gold"
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            icon={<Plus className="w-4 h-4" />}
          >
            Add New Room
          </Button>
        </div>
      </div>

      {/* Main Table with Filters */}
      <DataTable
        columns={columns}
        data={filteredRooms}
        isLoading={isLoading}
        searchPlaceholder="Search by room number or guest name..."
        filterComponent={
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-neutral-200 px-3 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="Available">Available</option>
              <option value="Occupied">Occupied</option>
              <option value="Reserved">Reserved</option>
              <option value="Cleaning">Cleaning</option>
              <option value="Inspected">Inspected</option>
              <option value="Maintenance">Maintenance</option>
            </select>

            {/* Room Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="h-9 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-neutral-200 px-3 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
            >
              <option value="all">All Categories</option>
              {roomTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>

            {/* Floor Filter */}
            <select
              value={floorFilter}
              onChange={(e) => setFloorFilter(e.target.value)}
              className="h-9 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-neutral-200 px-3 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
            >
              <option value="all">All Floors</option>
              <option value="1">Floor 1</option>
              <option value="2">Floor 2</option>
              <option value="3">Floor 3</option>
            </select>
          </div>
        }
      />

      {/* Modal 1: Add New Room */}
      {isCreateOpen && (
        <Modal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          title="Register New Hotel Room"
          description="Add a new room key to the Nino Luxury Hotel inventory catalog."
        >
          <form onSubmit={handleCreateRoom} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Room Number"
                required
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                placeholder="e.g. 209"
              />
              <Select
                label="Room Category"
                required
                value={roomTypeId}
                onChange={(e) => {
                  setRoomTypeId(e.target.value);
                  const rt = roomTypes.find((t) => t.id === e.target.value);
                  if (rt) setRatePerNight(rt.baseRate);
                }}
              >
                {roomTypes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </Select>
              <Input
                label="Floor Number"
                type="number"
                min={1}
                max={5}
                required
                value={floor}
                onChange={(e) => setFloor(parseInt(e.target.value) || 1)}
              />
              <Input
                label="Nightly Base Rate (₦)"
                type="number"
                min={5000}
                required
                value={ratePerNight}
                onChange={(e) => setRatePerNight(parseFloat(e.target.value) || 0)}
              />
            </div>
            <Input
              label="Room Notes / Features"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Balcony overlooking Arab road, king orthopaedic bed"
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" size="sm" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button variant="gold" size="sm" type="submit">
                Create Room
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal 2: Change Room Status */}
      {statusChangeRoom && (
        <Modal
          isOpen={Boolean(statusChangeRoom)}
          onClose={() => setStatusChangeRoom(null)}
          title={`Override Status: Room ${statusChangeRoom.roomNumber}`}
          description="Update room operational state (Available, Cleaning, Inspected, Maintenance)."
        >
          <form onSubmit={handleStatusChangeSubmit} className="space-y-4">
            <Select
              label="Operational Status"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as any)}
            >
              <option value="Available">Available (Clean & Ready for Guest)</option>
              <option value="Occupied">Occupied</option>
              <option value="Reserved">Reserved</option>
              <option value="Cleaning">Cleaning (Housekeeping Service)</option>
              <option value="Inspected">Inspected (Supervisor Approved)</option>
              <option value="Maintenance">Maintenance (Out of Service for Repairs)</option>
              <option value="Out of Service">Out of Service</option>
            </Select>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" size="sm" onClick={() => setStatusChangeRoom(null)}>
                Cancel
              </Button>
              <Button variant="gold" size="sm" type="submit">
                Update Status
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal 3: Room Details Drawer */}
      {selectedRoomDetail && (
        <Modal
          isOpen={Boolean(selectedRoomDetail)}
          onClose={() => setSelectedRoomDetail(null)}
          title={`Room ${selectedRoomDetail.roomNumber} Comprehensive Profile`}
          size="lg"
        >
          <div className="space-y-5">
            {/* Header info */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-neutral-950 p-4 rounded-xl border border-neutral-800 text-xs font-mono">
              <div>
                <span className="text-neutral-400">Category:</span>
                <p className="text-white font-bold">{selectedRoomDetail.roomType?.name}</p>
              </div>
              <div>
                <span className="text-neutral-400">Rate:</span>
                <p className="text-amber-400 font-bold">
                  {formatCurrency(selectedRoomDetail.ratePerNight)}/nt
                </p>
              </div>
              <div>
                <span className="text-neutral-400">Current Status:</span>
                <div className="mt-1">
                  <StatusBadge status={selectedRoomDetail.status} />
                </div>
              </div>
              <div>
                <span className="text-neutral-400">Current Occupant:</span>
                <p className="text-white font-semibold">
                  {selectedRoomDetail.currentGuestName || 'None (Vacant)'}
                </p>
              </div>
            </div>

            {/* Room Amenities */}
            <div>
              <h4 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
                Room Amenities & Specifications
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {(selectedRoomDetail.roomType?.amenities || []).map((amenity, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-2.5 py-1 rounded bg-neutral-800/80 text-neutral-300 border border-neutral-700/60"
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            </div>

            {/* Booking History for this room */}
            <div>
              <h4 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
                Reservation History
              </h4>
              <div className="overflow-x-auto rounded-lg border border-neutral-800 bg-neutral-950">
                <table className="w-full text-left text-xs">
                  <thead className="text-neutral-400 border-b border-neutral-800 font-medium">
                    <tr>
                      <th className="py-2 px-3">Res Code</th>
                      <th className="py-2 px-3">Guest</th>
                      <th className="py-2 px-3">Dates</th>
                      <th className="py-2 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/60">
                    {reservations
                      .filter((r) => r.roomId === selectedRoomDetail.id)
                      .slice(0, 5)
                      .map((res) => (
                        <tr key={res.id}>
                          <td className="py-2 px-3 font-mono text-amber-400">
                            {res.reservationCode}
                          </td>
                          <td className="py-2 px-3 text-neutral-200">{res.guestName}</td>
                          <td className="py-2 px-3 font-mono text-neutral-300 tabular-nums">
                            {formatDate(res.checkInDate)} - {formatDate(res.checkOutDate)}
                          </td>
                          <td className="py-2 px-3">
                            <StatusBadge status={res.status} />
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Maintenance History */}
            <div>
              <h4 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
                Maintenance Log
              </h4>
              <div className="space-y-2">
                {maintenance.filter((m) =>
                  m.roomOrFacility.includes(selectedRoomDetail.roomNumber)
                ).length === 0 ? (
                  <p className="text-xs text-neutral-500 italic">No maintenance tickets logged.</p>
                ) : (
                  maintenance
                    .filter((m) => m.roomOrFacility.includes(selectedRoomDetail.roomNumber))
                    .map((m) => (
                      <div
                        key={m.id}
                        className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 text-xs flex justify-between items-center"
                      >
                        <div>
                          <p className="font-semibold text-neutral-200">{m.issue}</p>
                          <p className="text-neutral-400 text-[11px] mt-0.5">{m.description}</p>
                        </div>
                        <StatusBadge status={m.status} />
                      </div>
                    ))
                )}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-neutral-800">
              <Button variant="secondary" size="sm" onClick={() => setSelectedRoomDetail(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
