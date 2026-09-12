'use client';

import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { deleteCholi, deleteCholiApi } from '@/store/choliSlice';
import { openBookingModal } from '@/store/bookingSlice';
import { DateCheckModal } from '@/components/showroom/DateCheckModal';
import { CholiQrModal } from '@/components/choli/CholiQrModal';
import { ConfirmationModal } from '@/components/common/ConfirmationModal';
import { UpdateStatusModal } from '@/components/choli/UpdateStatusModal';
import { Choli, CholiCategory, CholiStatus } from '@/types';
import { BoutiqueAutocomplete } from '@/components/common/BoutiqueAutocomplete';
import { 
  Search, 
  Filter, 
  PlusCircle, 
  Calendar as CalendarIcon, 
  Trash2, 
  ChevronRight, 
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  CheckCircle2, 
  Clock, 
  RotateCcw, 
  Sparkles, 
  TrendingUp, 
  DollarSign, 
  Layers, 
  Award, 
  Table, 
  LayoutGrid, 
  Images, 
  X, 
  ExternalLink, 
  ShoppingBag, 
  QrCode, 
  AlertCircle, 
  Edit3,
  Shirt,
  Scissors,
  Waves,
  Archive
} from 'lucide-react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';
import InstagramIcon from '@mui/icons-material/Instagram';
import { APP_CONFIG } from '@/constants';
import { toast } from 'sonner';
import { OutfitPhotoCarousel } from '@/components/showroom/OutfitPhotoCarousel';
import { CholiGridSkeleton, AdminTableSkeleton } from '@/components/common/BoutiqueLoader';
import { openInstagram } from '@/lib/instagram';
import { AddCholiModal } from '@/components/admin/AddCholiModal';

interface AdminCholiTableProps {
  onCheckCalendar?: (choliId: string) => void;
  onOpenAddModal?: () => void;
  onSwitchToShowroom?: () => void;
  onEditCholi?: (choli: Choli) => void;
}

const CATEGORIES: (CholiCategory | 'All')[] = [
  'All',
  'Bridal',
  'Sangeet',
  'Navratri',
  'Reception',
  'Partywear',
];

interface PaginationBarProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  pageSizeOptions: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

function PaginationBar({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  pageSizeOptions,
  onPageChange,
  onPageSizeChange,
}: PaginationBarProps) {
  if (totalItems === 0) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs select-none">
      {/* Left: Info & Per Page selector */}
      <div className="flex flex-wrap items-center justify-between sm:justify-start w-full sm:w-auto gap-3 text-[#78716C] dark:text-[#9CA3AF]">
        <span>
          Showing <strong className="text-[#084C42] dark:text-[#DFBD76]">{startItem}</strong>–<strong className="text-[#084C42] dark:text-[#DFBD76]">{endItem}</strong> of <strong className="text-[#1C1917] dark:text-[#FAF6EC]">{totalItems}</strong> items
        </span>

        <div className="flex items-center gap-1.5 pl-2 border-l border-[#EADFC9] dark:border-[#1A3E38]">
          <span className="text-[11px] whitespace-nowrap">Per page:</span>
          <BoutiqueAutocomplete
            value={String(pageSize)}
            onChange={(val) => {
              onPageSizeChange(Number(val));
              onPageChange(1);
            }}
            options={pageSizeOptions.map((opt) => ({
              value: String(opt),
              label: String(opt),
            }))}
            className="w-24"
            size="small"
          />
        </div>
      </div>

      {/* Right: Page Buttons */}
      <div className="flex items-center justify-center flex-wrap gap-1 w-full sm:w-auto">
        {/* First Page */}
        <button
          type="button"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="p-1.5 rounded-lg border border-[#EADFC9] dark:border-[#1A3E38] text-stone-600 dark:text-stone-300 hover:bg-[#FAF8F5] dark:hover:bg-[#041A17] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          title="First Page"
          aria-label="First Page"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>

        {/* Prev Page */}
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="p-1.5 rounded-lg border border-[#EADFC9] dark:border-[#1A3E38] text-stone-600 dark:text-stone-300 hover:bg-[#FAF8F5] dark:hover:bg-[#041A17] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          title="Previous Page"
          aria-label="Previous Page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Number Buttons */}
        <div className="flex items-center gap-1 mx-0.5">
          {pages.map((p, idx) => {
            if (p === '...') {
              return (
                <span key={`ellipsis-${idx}`} className="px-1 text-stone-400">
                  ...
                </span>
              );
            }
            const isCurrent = p === currentPage;
            return (
              <button
                key={`page-${p}`}
                type="button"
                onClick={() => onPageChange(p as number)}
                className={`min-w-[28px] sm:min-w-[32px] h-7 sm:h-8 px-2 rounded-lg font-bold text-xs transition-all flex items-center justify-center ${
                  isCurrent
                    ? 'bg-gradient-to-r from-[#084C42] to-[#0D6357] text-[#FAF6EC] shadow-sm shadow-[#084C42]/20 border border-[#DFBD76]/50'
                    : 'border border-[#EADFC9] dark:border-[#1A3E38] text-stone-700 dark:text-stone-300 hover:bg-[#FAF8F5] dark:hover:bg-[#041A17]'
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>

        {/* Next Page */}
        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded-lg border border-[#EADFC9] dark:border-[#1A3E38] text-stone-600 dark:text-stone-300 hover:bg-[#FAF8F5] dark:hover:bg-[#041A17] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          title="Next Page"
          aria-label="Next Page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Last Page */}
        <button
          type="button"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded-lg border border-[#EADFC9] dark:border-[#1A3E38] text-stone-600 dark:text-stone-300 hover:bg-[#FAF8F5] dark:hover:bg-[#041A17] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          title="Last Page"
          aria-label="Last Page"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export function AdminCholiTable({ onCheckCalendar, onOpenAddModal, onSwitchToShowroom, onEditCholi }: AdminCholiTableProps) {
  const dispatch = useAppDispatch();
  const cholis = useAppSelector((state) => state.cholis.items);
  const cholisLoading = useAppSelector((state) => state.cholis.loading);
  const bookings = useAppSelector((state) => state.bookings.items);
  const { currentUser } = useAppSelector((state) => state.auth);

  const [viewMode, setViewMode] = useState<'table' | 'card'>('card');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CholiCategory | 'All'>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [filterEventDate, setFilterEventDate] = useState('');
  const [onlyAvailableOnDate, setOnlyAvailableOnDate] = useState(false);
  const [selectedCholiForDateCheck, setSelectedCholiForDateCheck] = useState<Choli | null>(null);
  const [selectedCholiForQr, setSelectedCholiForQr] = useState<Choli | null>(null);
  const [choliToDelete, setCholiToDelete] = useState<Choli | null>(null);
  const [statusCholi, setStatusCholi] = useState<Choli | null>(null);
  const [editingCholi, setEditingCholi] = useState<Choli | null>(null);
  const [previewCholi, setPreviewCholi] = useState<Choli | null>(null);
  const [selectedPreviewImageIdx, setSelectedPreviewImageIdx] = useState(0);
  const [modalTouchStartX, setModalTouchStartX] = useState<number | null>(null);
  const [modalTouchStartY, setModalTouchStartY] = useState<number | null>(null);

  const handleModalTouchStart = (e: React.TouchEvent) => {
    if (!previewCholi || previewCholi.images.length <= 1) return;
    setModalTouchStartX(e.touches[0].clientX);
    setModalTouchStartY(e.touches[0].clientY);
  };

  const handleModalTouchEnd = (e: React.TouchEvent) => {
    if (modalTouchStartX === null || modalTouchStartY === null || !previewCholi || previewCholi.images.length <= 1) return;
    const diffX = e.changedTouches[0].clientX - modalTouchStartX;
    const diffY = e.changedTouches[0].clientY - modalTouchStartY;

    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 35) {
      if (diffX < 0) {
        // Slide right-to-left -> Next photo
        setSelectedPreviewImageIdx((prev) => (prev === previewCholi.images.length - 1 ? 0 : prev + 1));
      } else {
        // Slide left-to-right -> Prev photo
        setSelectedPreviewImageIdx((prev) => (prev === 0 ? previewCholi.images.length - 1 : prev - 1));
      }
    }
    setModalTouchStartX(null);
    setModalTouchStartY(null);
  };

  // Helper to check SKU availability for a specific date or today
  const getCholiAvailability = (choli: Choli, targetDate?: string) => {
    const choliBookings = bookings.filter(
      (b) => (b.choliId === choli._id || b.choliSku.toLowerCase() === choli.sku.toLowerCase()) && b.status !== 'CANCELLED'
    );

    if (targetDate) {
      const conflict = choliBookings.find(
        (b) => targetDate >= b.pickupDate && targetDate <= b.returnExpectedDate
      );
      return {
        isAvailable: !conflict,
        targetDate,
        conflictBooking: conflict,
        totalBookings: choliBookings.length,
        currentRental: undefined,
        upcomingCount: 0,
      };
    }

    const today = new Date().toISOString().split('T')[0];
    const currentRental = choliBookings.find(
      (b) => today >= b.pickupDate && today <= b.returnExpectedDate
    );
    const upcoming = choliBookings.filter((b) => b.returnExpectedDate >= today);

    return {
      isAvailable: !currentRental,
      targetDate: undefined,
      conflictBooking: undefined,
      currentRental,
      upcomingCount: upcoming.length,
      totalBookings: choliBookings.length,
      nextBooking: upcoming.sort((a, b) => a.pickupDate.localeCompare(b.pickupDate))[0],
    };
  };

  // Financial summary metrics
  const totalCost = cholis.reduce((acc, c) => acc + (c.totalCosting || 0), 0);
  const totalRentEarned = cholis.reduce((acc, c) => acc + (c.totalEarnedFromRent || 0), 0);
  const breakevenPassedCount = cholis.filter((c) => c.isBreakEvenReached).length;
  const inRecoveryCount = cholis.length - breakevenPassedCount;

  // Filter cholis with search, category, status, and SKU date availability
  const filteredCholis = cholis.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.color.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.fabric.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'All' || c.category === selectedCategory;

    const matchesStatus =
      statusFilter === 'All' || c.status === statusFilter;

    const avail = getCholiAvailability(c, filterEventDate);
    const matchesDate = !filterEventDate || !onlyAvailableOnDate || avail.isAvailable;

    return matchesSearch && matchesCategory && matchesStatus && matchesDate;
  });

  // Pagination State for Table & Card views
  const [tablePage, setTablePage] = useState(1);
  const [tablePageSize, setTablePageSize] = useState(10);
  const [cardPage, setCardPage] = useState(1);
  const [cardPageSize, setCardPageSize] = useState(12);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setTablePage(1);
    setCardPage(1);
  }, [searchQuery, selectedCategory, statusFilter, filterEventDate, onlyAvailableOnDate]);

  // Table pagination calculations
  const totalTablePages = Math.max(1, Math.ceil(filteredCholis.length / tablePageSize));
  const safeTablePage = Math.min(tablePage, totalTablePages);
  const tableStartIndex = (safeTablePage - 1) * tablePageSize;
  const paginatedTableCholis = filteredCholis.slice(tableStartIndex, tableStartIndex + tablePageSize);

  // Card pagination calculations
  const totalCardPages = Math.max(1, Math.ceil(filteredCholis.length / cardPageSize));
  const safeCardPage = Math.min(cardPage, totalCardPages);
  const cardStartIndex = (safeCardPage - 1) * cardPageSize;
  const paginatedCardCholis = filteredCholis.slice(cardStartIndex, cardStartIndex + cardPageSize);

  const handleEdit = (choli: Choli) => {
    if (currentUser?.role !== 'ADMIN') {
      toast.error('Only Admin has permission to edit outfits.');
      return;
    }
    if (onEditCholi) {
      onEditCholi(choli);
    } else {
      setEditingCholi(choli);
    }
  };

  const handleDelete = (choli: Choli) => {
    if (currentUser?.role !== 'ADMIN') {
      toast.error('Only Admin has permission to delete outfits.');
      return;
    }
    setCholiToDelete(choli);
  };

  const handleBookOutfit = (choliId: string) => {
    const target = cholis.find((c) => c._id === choliId);
    if (target?.status === 'AT_DRY_CLEANER') {
      toast.error(`"${target.name}" (${target.sku}) is currently at the dry cleaner and cannot be booked.`);
      return;
    }
    dispatch(openBookingModal(choliId));
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Quick Action */}
      <div className="bg-white dark:bg-[#072622] p-5 sm:p-6 rounded-3xl border border-[#EADFC9] dark:border-[#1A3E38] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-[#084C42]/10 dark:bg-[#DFBD76]/15 text-[#084C42] dark:text-[#DFBD76] text-xs font-bold font-serif">
              👑 Executive Admin View
            </span>
            <span suppressHydrationWarning className="text-xs text-[#78716C] dark:text-[#9CA3AF]">
              • Total {cholis.length} Outfits in Vault
            </span>
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#1C1917] dark:text-[#FAF6EC] mt-1">
            Choli Inventory & Financial Register
          </h2>
          <p className="text-xs text-[#78716C] dark:text-[#9CA3AF]">
            Complete master view with confidential capital acquisition costs, rent earned, break-even recovery, and specs.
          </p>
        </div>

        {onOpenAddModal && (
          <button
            onClick={onOpenAddModal}
            className="py-2.5 px-4 rounded-2xl text-xs sm:text-sm font-bold bg-[#084C42] hover:bg-[#0D6357] text-[#FAF6EC] border border-[#DFBD76]/50 shadow-md flex items-center justify-center gap-2 transition-all w-full sm:w-auto flex-shrink-0"
          >
            <PlusCircle className="w-4 h-4 text-[#DFBD76]" />
            <span>Catalog New Choli</span>
          </button>
        )}
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-[#072622] p-4 rounded-2xl border border-[#EADFC9] dark:border-[#1A3E38] shadow-sm space-y-1">
          <div className="flex items-center justify-between text-[#78716C] dark:text-[#9CA3AF] text-xs font-medium">
            <span>Total Outfits</span>
            <Layers className="w-4 h-4 text-[#084C42] dark:text-[#DFBD76]" />
          </div>
          <p suppressHydrationWarning className="font-serif text-xl sm:text-2xl font-bold text-[#1C1917] dark:text-[#FAF6EC]">
            {cholis.length}
          </p>
          <p className="text-[10px] text-[#78716C] dark:text-[#9CA3AF]">
            In boutique catalog
          </p>
        </div>

        <div className="bg-white dark:bg-[#072622] p-4 rounded-2xl border border-[#EADFC9] dark:border-[#1A3E38] shadow-sm space-y-1">
          <div className="flex items-center justify-between text-[#78716C] dark:text-[#9CA3AF] text-xs font-medium">
            <span>Capital Invested</span>
            <DollarSign className="w-4 h-4 text-[#DFBD76]" />
          </div>
          <p suppressHydrationWarning className="font-serif text-xl sm:text-2xl font-bold text-[#1C1917] dark:text-[#FAF6EC]">
            ₹{(totalCost ?? 0).toLocaleString('en-IN')}
          </p>
          <p className="text-[10px] text-[#78716C] dark:text-[#9CA3AF]">
            Total acquisition & tailoring
          </p>
        </div>

        <div className="bg-white dark:bg-[#072622] p-4 rounded-2xl border border-[#EADFC9] dark:border-[#1A3E38] shadow-sm space-y-1">
          <div className="flex items-center justify-between text-[#78716C] dark:text-[#9CA3AF] text-xs font-medium">
            <span>Rent Cleared</span>
            <TrendingUp className="w-4 h-4 text-[#15803D]" />
          </div>
          <p suppressHydrationWarning className="font-serif text-xl sm:text-2xl font-bold text-[#15803D] dark:text-[#22C55E]">
            ₹{(totalRentEarned ?? 0).toLocaleString('en-IN')}
          </p>
          <p suppressHydrationWarning className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">
            {totalCost > 0 ? Math.round((totalRentEarned / totalCost) * 100) : 0}% Capital recovered
          </p>
        </div>

        <div className="bg-white dark:bg-[#072622] p-4 rounded-2xl border border-[#EADFC9] dark:border-[#1A3E38] shadow-sm space-y-1">
          <div className="flex items-center justify-between text-[#78716C] dark:text-[#9CA3AF] text-xs font-medium">
            <span>100% Breakeven</span>
            <Award className="w-4 h-4 text-[#DFBD76]" />
          </div>
          <p suppressHydrationWarning className="font-serif text-xl sm:text-2xl font-bold text-[#084C42] dark:text-[#DFBD76]">
            {breakevenPassedCount} Outfits
          </p>
          <p suppressHydrationWarning className="text-[10px] text-[#78716C] dark:text-[#9CA3AF]">
            {inRecoveryCount} in recovery cycle
          </p>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white dark:bg-[#072622] p-4 rounded-3xl border border-[#EADFC9] dark:border-[#1A3E38] shadow-sm flex flex-col sm:flex-row items-center gap-3">
        {/* Search Input Bar */}
        <div className="relative flex-1 min-w-[200px] w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#78716C] dark:text-[#9BB5AF]" />
          <input
            type="text"
            placeholder="Search by SKU, Name, Color, Fabric..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl text-xs sm:text-sm bg-[#FAF8F5] dark:bg-[#041A17] border border-[#EADFC9] dark:border-[#1A3E38] text-[#1C1917] dark:text-[#FAF6EC] placeholder-[#78716C] dark:placeholder-[#9BB5AF] focus:outline-none focus:border-[#DFBD76] shadow-sm"
          />
        </div>

        {/* Category Autocomplete Dropdown */}
        <div className="w-full sm:w-52">
          <BoutiqueAutocomplete
            value={selectedCategory}
            onChange={(val) => setSelectedCategory(val as any)}
            options={CATEGORIES.map((cat) => ({
              value: cat,
              label: cat === 'All' ? 'All Categories' : `${cat} Cholis`,
            }))}
            placeholder="Filter Category..."
          />
        </div>

        {/* Status Autocomplete Dropdown */}
        <div className="w-full sm:w-48">
          <BoutiqueAutocomplete
            value={statusFilter}
            onChange={(val) => setStatusFilter(val)}
            options={[
              { value: 'All', label: 'All Statuses' },
              { value: 'AVAILABLE', label: 'Available (Ready for Rent)', badge: 'Available' },
              { value: 'RENTED', label: 'Currently Rented', badge: 'Rented' },
              { value: 'IN_ALTERATION', label: 'In Alteration', badge: 'Alteration' },
              { value: 'AT_DRY_CLEANER', label: 'At Dry Cleaner', badge: 'Cleaning' },
              { value: 'RETIRED', label: 'Archived / Retired', badge: 'Archived' },
            ]}
            placeholder="Filter Status..."
          />
        </div>

        {/* Date Availability Checker (MUI DatePicker) */}
        <div className="w-full sm:w-auto flex items-center justify-between gap-1.5 py-1 px-3.5 rounded-2xl bg-[#FAF8F5] dark:bg-[#041A17] border border-[#EADFC9] dark:border-[#1A3E38] text-xs shadow-sm">
          <div className="flex items-center gap-2 flex-1">
            <CalendarIcon className="w-4 h-4 text-[#084C42] dark:text-[#DFBD76] flex-shrink-0" />
            <DatePicker
              value={filterEventDate ? dayjs(filterEventDate) : null}
              onChange={(newValue: Dayjs | null) => {
                const val = newValue && newValue.isValid() ? newValue.format('YYYY-MM-DD') : '';
                setFilterEventDate(val);
                if (val) {
                  toast.info(`Filtering choli availability for ${val}`);
                }
              }}
              slotProps={{
                textField: {
                  size: 'small',
                  variant: 'standard',
                  fullWidth: true,
                  slotProps: {
                    input: { disableUnderline: true },
                    htmlInput: { placeholder: 'Filter Event Date' },
                  },
                  sx: {
                    width: '100%',
                    flex: 1,
                    '& .MuiInputBase-input': {
                      fontSize: '0.8125rem',
                      py: 0.35,
                      fontWeight: 600,
                      color: 'inherit',
                    },
                  },
                },
                popper: {
                  sx: { zIndex: 9999 },
                },
              }}
            />
          </div>
          {filterEventDate && (
            <button
              type="button"
              onClick={() => {
                setFilterEventDate('');
                setOnlyAvailableOnDate(false);
              }}
              className="p-1 rounded-full hover:bg-stone-200 dark:hover:bg-[#0A2E28] text-[#78716C] dark:text-[#9BB5AF] flex-shrink-0"
              title="Clear date"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Only Available on Date Checkbox */}
        {filterEventDate && (
          <label className="w-full sm:w-auto flex items-center justify-center gap-1.5 text-xs text-[#084C42] dark:text-[#DFBD76] font-bold cursor-pointer select-none bg-[#084C42]/10 dark:bg-[#DFBD76]/15 px-3 py-2.5 rounded-2xl border border-[#DFBD76]/40">
            <input
              type="checkbox"
              checked={onlyAvailableOnDate}
              onChange={(e) => setOnlyAvailableOnDate(e.target.checked)}
              className="rounded accent-[#084C42]"
            />
            <span className="whitespace-nowrap">Only Free on Date</span>
          </label>
        )}

        {/* Reset */}
        {(searchQuery || selectedCategory !== 'All' || statusFilter !== 'All' || filterEventDate) && (
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
              setStatusFilter('All');
              setFilterEventDate('');
              setOnlyAvailableOnDate(false);
            }}
            className="w-full sm:w-auto p-2.5 sm:p-2 rounded-xl text-xs font-semibold text-[#78716C] hover:text-[#084C42] dark:hover:text-[#DFBD76] flex items-center justify-center gap-1 flex-shrink-0 border border-[#EADFC9]/70 sm:border-transparent"
            title="Reset filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset filters</span>
          </button>
        )}
      </div>

      {/* Showing Count Banner & Luxury View Mode Tabs (Directly on Top of Table) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[#78716C] dark:text-[#9CA3AF] px-1 pb-1">
        <div className="flex items-center gap-2">
          <span suppressHydrationWarning>
            {filteredCholis.length === 0 ? (
              <>Showing <strong className="text-[#084C42] dark:text-[#DFBD76]">0</strong> of <strong className="text-[#1C1917] dark:text-[#FAF6EC]">{cholis.length}</strong> total cholis in vault</>
            ) : viewMode === 'table' ? (
              <>
                Showing <strong className="text-[#084C42] dark:text-[#DFBD76]">{tableStartIndex + 1}–{Math.min(tableStartIndex + tablePageSize, filteredCholis.length)}</strong> of <strong className="text-[#1C1917] dark:text-[#FAF6EC]">{filteredCholis.length}</strong> matching cholis (Page {safeTablePage} of {totalTablePages})
              </>
            ) : (
              <>
                Showing <strong className="text-[#084C42] dark:text-[#DFBD76]">{cardStartIndex + 1}–{Math.min(cardStartIndex + cardPageSize, filteredCholis.length)}</strong> of <strong className="text-[#1C1917] dark:text-[#FAF6EC]">{filteredCholis.length}</strong> matching cholis (Page {safeCardPage} of {totalCardPages})
              </>
            )}
          </span>
          {filterEventDate && (
            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#084C42]/10 dark:bg-[#DFBD76]/15 text-[#084C42] dark:text-[#DFBD76]">
              Target Date: {filterEventDate}
            </span>
          )}
        </div>

        {/* View Mode Switcher: Proper Luxury Tabs Directly at Top of Table */}
        <div className="w-full sm:w-auto flex items-center p-1 rounded-2xl bg-[#FAF8F5] dark:bg-[#041A17] border border-[#DFBD76]/40 shadow-inner">
          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2.5 sm:py-1.5 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'table'
                ? 'bg-gradient-to-r from-[#084C42] to-[#0D6357] text-[#FAF6EC] shadow-md shadow-[#084C42]/30 border border-[#DFBD76]/40'
                : 'text-[#78716C] dark:text-[#9CA3AF] hover:text-[#1C1917] dark:hover:text-[#FAF6EC] hover:bg-white dark:hover:bg-[#072622]'
            }`}
            title="Switch to Master Table View"
          >
            <Table className="w-4 h-4 text-[#DFBD76]" />
            <span>Table View</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('card')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2.5 sm:py-1.5 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'card'
                ? 'bg-gradient-to-r from-[#084C42] to-[#0D6357] text-[#FAF6EC] shadow-md shadow-[#084C42]/30 border border-[#DFBD76]/40'
                : 'text-[#78716C] dark:text-[#9CA3AF] hover:text-[#1C1917] dark:hover:text-[#FAF6EC] hover:bg-white dark:hover:bg-[#072622]'
            }`}
            title="Switch to Card Visual View"
          >
            <LayoutGrid className="w-4 h-4 text-[#DFBD76]" />
            <span>Card View</span>
          </button>
        </div>
      </div>

      {/* View Mode Conditional: Table View (Mode 1) vs Admin Card View (Mode 2) */}
      {viewMode === 'table' ? (
        <div className="bg-white dark:bg-[#072622] rounded-3xl border border-[#EADFC9] dark:border-[#1A3E38] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="border-b border-[#EADFC9] dark:border-[#1A3E38] bg-[#FAF8F5] dark:bg-[#041A17] text-[11px] font-bold uppercase tracking-wider text-[#78716C] dark:text-[#9CA3AF]">
                  <th className="py-3.5 px-4">Choli / SKU</th>
                  <th className="py-3.5 px-4">Category & Specs</th>
                  <th className="py-3.5 px-4">Rental & Laundry</th>
                  <th className="py-3.5 px-4">Security Deposit</th>
                  <th className="py-3.5 px-4">Capital Cost (Admin)</th>
                  <th className="py-3.5 px-4">ROI & Breakeven</th>
                  <th className="py-3.5 px-4">Status & Availability</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EADFC9]/60 dark:divide-[#1A3E38] text-xs">
                {cholisLoading && cholis.length === 0 ? (
                  <AdminTableSkeleton rows={8} />
                ) : filteredCholis.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-[#78716C] dark:text-[#9CA3AF]">
                      No cholis match your filter criteria.
                    </td>
                  </tr>
                ) : (
                  paginatedTableCholis.map((c) => {
                    const totalCost = c.totalCosting ?? 0;
                    const rentEarned = c.totalEarnedFromRent ?? 0;
                    const breakEvenPct = totalCost > 0
                      ? Math.round((rentEarned / totalCost) * 100)
                      : 0;

                    const choliBookings = bookings.filter((b) => (b.choliId === c._id || b.choliSku?.toLowerCase() === c.sku?.toLowerCase()) && b.status !== 'CANCELLED');
                    const netProfit = rentEarned - totalCost;
                    const avail = getCholiAvailability(c, filterEventDate);

                    return (
                      <tr 
                        key={c._id}
                        className="hover:bg-[#FAF8F5]/60 dark:hover:bg-[#0A2E28]/40 transition-colors"
                      >
                        {/* Thumbnail & SKU */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => {
                                setPreviewCholi(c);
                                setSelectedPreviewImageIdx(0);
                              }}
                              className="relative group w-12 h-16 rounded-xl overflow-hidden border border-[#EADFC9] dark:border-[#1A3E38] flex-shrink-0 shadow-sm cursor-pointer"
                              title="Click to preview outfit photos"
                            >
                              <img
                                src={c.images[0] || '/logo.jpg'}
                                alt={c.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              />
                              {c.images.length > 1 && (
                                <div className="absolute bottom-0 right-0 left-0 bg-black/60 text-[9px] text-white text-center py-0.5 font-bold flex items-center justify-center gap-0.5">
                                  <Images className="w-2.5 h-2.5 text-[#DFBD76]" />
                                  <span>{c.images.length}</span>
                                </div>
                              )}
                            </button>
                            <div className="min-w-0">
                              <span className="font-mono text-xs font-bold text-[#084C42] dark:text-[#DFBD76] block">
                                {c.sku}
                              </span>
                              <p className="font-serif font-bold text-sm text-[#1C1917] dark:text-[#F5F5F7] line-clamp-1">
                                {c.name}
                              </p>
                              <span className="text-[10px] text-[#78716C] dark:text-[#9CA3AF]">
                                {c.images.length} Angle Photos
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Category & Specs */}
                        <td className="py-3.5 px-4">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#DFBD76]/20 text-[#084C42] dark:text-[#DFBD76]">
                                {c.category}
                              </span>
                            </div>
                            <p className="text-[11px] font-medium text-[#1C1917] dark:text-[#F5F5F7] mt-1">
                              {c.color} • {c.fabric}
                            </p>
                            <div className="text-[10px] text-[#78716C] dark:text-[#9CA3AF] mt-0.5 space-y-0.5">
                              <p>Blouse: <span className="font-semibold text-[#1C1917] dark:text-[#F5F5F7]">{c.blouseSize}</span> | Skirt: <span className="font-semibold text-[#1C1917] dark:text-[#F5F5F7]">{c.skirtLength}&quot;</span></p>
                              <p className="text-[9px] text-[#78716C]">Buffer: ±{c.bufferDaysBefore || 1}/{c.bufferDaysAfter || 2}d turnaround</p>
                            </div>
                          </div>
                        </td>

                        {/* Rental Rate & Dry Clean */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-[#084C42] dark:text-[#DFBD76] text-sm">
                            ₹{(c.rentalPricePerEvent ?? 0).toLocaleString('en-IN')}
                          </div>
                          <span className="text-[10px] text-[#78716C] block">per 3 days rent</span>
                          {(c.dryCleaningFee ?? 0) > 0 && (
                            <span className="text-[10px] font-medium text-amber-700 dark:text-amber-400 block mt-0.5">
                              + ₹{(c.dryCleaningFee ?? 0).toLocaleString('en-IN')} dry clean
                            </span>
                          )}
                        </td>

                        {/* Security Deposit */}
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-[#1C1917] dark:text-[#F5F5F7]">
                            ₹{(c.securityDeposit ?? 0).toLocaleString('en-IN')}
                          </div>
                          <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold block">
                            100% refundable
                          </span>
                        </td>

                        {/* Capital Costing (Admin Confidential) */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-[#1C1917] dark:text-[#F5F5F7]">
                            ₹{(c.totalCosting ?? 0).toLocaleString('en-IN')}
                          </div>
                          <span className="text-[10px] text-[#78716C] block">wholesale cost</span>
                          <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#084C42]/10 dark:bg-[#DFBD76]/15 text-[#084C42] dark:text-[#DFBD76]">
                            {choliBookings.length} bookings done
                          </span>
                        </td>

                        {/* ROI / Breakeven Progress */}
                        <td className="py-3.5 px-4 min-w-[150px]">
                          <div>
                            <div className="flex justify-between items-center text-[11px] mb-1">
                              <span className="font-bold text-[#15803D] dark:text-[#22C55E]">
                                ₹{(c.totalEarnedFromRent ?? 0).toLocaleString('en-IN')}
                              </span>
                              <span className="text-[10px] font-bold text-[#DFBD76]">
                                {breakEvenPct}%
                              </span>
                            </div>

                            <div className="w-full bg-[#EADFC9]/50 dark:bg-[#0A2E28] h-2 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  c.isBreakEvenReached
                                    ? 'bg-[#15803D]'
                                    : 'bg-gradient-to-r from-[#084C42] to-[#DFBD76]'
                                }`}
                                style={{ width: `${Math.min(100, breakEvenPct)}%` }}
                              />
                            </div>

                            <div className="text-[10px] mt-1 font-semibold">
                              {c.isBreakEvenReached ? (
                                <span className="text-[#15803D] dark:text-[#22C55E] flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3 flex-shrink-0" />
                                  <span>+₹{(netProfit ?? 0).toLocaleString('en-IN')} Net Profit</span>
                                </span>
                              ) : (
                                <span className="text-amber-700 dark:text-amber-400">
                                  ₹{Math.max(0, (c.totalCosting ?? 0) - (c.totalEarnedFromRent ?? 0)).toLocaleString('en-IN')} to breakeven
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Status & Live SKU Date Availability */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-1">
                            {filterEventDate ? (
                              avail.isAvailable ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  <span>Free on {filterEventDate}</span>
                                </span>
                              ) : (
                                <span 
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border border-red-300 dark:border-red-800 cursor-help"
                                  title={`Booked by ${avail.conflictBooking?.customer.name} (${avail.conflictBooking?.bookingNumber}) from ${avail.conflictBooking?.pickupDate} to ${avail.conflictBooking?.returnExpectedDate}`}
                                >
                                  <AlertCircle className="w-3 h-3 text-red-600" />
                                  <span>Booked ({avail.conflictBooking?.customer.name})</span>
                                </span>
                              )
                            ) : (
                              <button
                                type="button"
                                onClick={() => setStatusCholi(c)}
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-sm ${
                                  c.status === 'AVAILABLE'
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300'
                                    : c.status === 'AT_DRY_CLEANER'
                                    ? 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-300'
                                    : c.status === 'IN_ALTERATION'
                                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300'
                                    : c.status === 'RENTED'
                                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-300'
                                    : 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300 border border-stone-300'
                                }`}
                                title="Click to update outfit status (Cleaning, Alteration, Available, etc.)"
                              >
                                <span>
                                  {c.status === 'AVAILABLE'
                                    ? '🟢 Available'
                                    : c.status === 'AT_DRY_CLEANER'
                                    ? '🧺 Dry Cleaning'
                                    : c.status === 'IN_ALTERATION'
                                    ? '🪡 In Alteration'
                                    : c.status === 'RENTED'
                                    ? '👗 Rented'
                                    : '📦 Archived'}
                                </span>
                                <span className="text-[9px] opacity-70 underline">Change</span>
                              </button>
                            )}
                            {avail.upcomingCount !== undefined && avail.upcomingCount > 0 && !filterEventDate && (
                              <span className="block text-[9px] text-[#78716C] dark:text-[#9CA3AF]">
                                {avail.upcomingCount} upcoming booking(s)
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Action Buttons */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Staff / Admin Quick Status Button */}
                            <button
                              onClick={() => setStatusCholi(c)}
                              className="p-1.5 rounded-lg border border-[#DFBD76]/60 bg-[#FAF8F5] dark:bg-[#0A2E28] text-[#084C42] dark:text-[#DFBD76] hover:bg-[#DFBD76]/20 transition-all shadow-sm"
                              title="Update Outfit Status (Cleaning, Alteration, Available, etc.)"
                            >
                              <Shirt className="w-4 h-4" />
                            </button>

                            {/* Book Button */}
                            {c.status === 'AT_DRY_CLEANER' ? (
                              <button
                                disabled
                                className="p-1.5 rounded-lg bg-sky-100 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 border border-sky-300 dark:border-sky-800/40 opacity-80 cursor-not-allowed"
                                title="At Dry Cleaner (Cannot be booked)"
                              >
                                <Waves className="w-4 h-4" />
                              </button>
                            ) : c.status === 'IN_ALTERATION' ? (
                              <button
                                disabled
                                className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800/40 opacity-80 cursor-not-allowed"
                                title="In Alteration (Cannot be booked)"
                              >
                                <Scissors className="w-4 h-4" />
                              </button>
                            ) : c.status === 'RETIRED' ? (
                              <button
                                disabled
                                className="p-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-300 dark:border-stone-700 opacity-80 cursor-not-allowed"
                                title="Archived (Cannot be booked)"
                              >
                                <Archive className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleBookOutfit(c._id)}
                                className="p-1.5 rounded-lg bg-[#084C42] hover:bg-[#0D6357] text-[#FAF6EC] transition-all shadow-sm"
                                title="Create Booking for this Choli"
                              >
                                <ChevronRight className="w-4 h-4" />
                              </button>
                            )}

                            {/* Check Date Availability */}
                            <button
                              onClick={() => setSelectedCholiForDateCheck(c)}
                              className="p-1.5 rounded-lg border border-[#EADFC9] dark:border-[#1A3E38] hover:border-[#DFBD76] bg-[#FAF8F5] dark:bg-[#041A17] text-[#1C1917] dark:text-[#FAF6EC] transition-all"
                              title="Check Date Availability"
                            >
                              <CalendarIcon className="w-4 h-4 text-[#DFBD76]" />
                            </button>

                            {/* QR Code Hangtag */}
                            <button
                              onClick={() => setSelectedCholiForQr(c)}
                              className="p-1.5 rounded-lg border border-[#EADFC9] dark:border-[#1A3E38] hover:border-[#DFBD76] bg-[#FAF8F5] dark:bg-[#041A17] text-[#084C42] dark:text-[#DFBD76] transition-all"
                              title="Generate & Print QR Code Hangtag"
                            >
                              <QrCode className="w-4 h-4" />
                            </button>

                            {/* Open in Instagram App */}
                            <a
                              href={c.instagramUrl || APP_CONFIG.DEFAULT_INSTAGRAM_PROFILE}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => openInstagram(c.instagramUrl || APP_CONFIG.DEFAULT_INSTAGRAM_PROFILE, e)}
                              className="p-1.5 rounded-lg border border-[#EADFC9] dark:border-[#1A3E38] hover:border-pink-500 hover:bg-pink-50 dark:hover:bg-pink-950/30 bg-[#FAF8F5] dark:bg-[#041A17] text-pink-600 dark:text-pink-400 transition-all flex items-center justify-center"
                              title="Open in Instagram App"
                              aria-label="Open in Instagram App"
                            >
                              <InstagramIcon sx={{ fontSize: 16 }} />
                            </a>

                            {/* Edit Choli (Admin) */}
                            {currentUser?.role === 'ADMIN' && (
                              <button
                                onClick={() => handleEdit(c)}
                                className="p-1.5 rounded-lg border border-[#EADFC9] dark:border-[#1A3E38] hover:border-[#084C42] dark:hover:border-[#DFBD76] hover:bg-[#084C42]/10 dark:hover:bg-[#DFBD76]/15 text-[#084C42] dark:text-[#DFBD76] transition-all"
                                title="Edit Choli Details (Admin)"
                                aria-label="Edit Choli Details"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                            )}

                            {/* Delete Choli */}
                            <button
                              onClick={() => handleDelete(c)}
                              className="p-1.5 rounded-lg border border-red-200 dark:border-red-900/40 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 transition-all"
                              title="Delete Choli (Admin)"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Pagination Bar */}
          <div className="px-4 py-3 border-t border-[#EADFC9] dark:border-[#1A3E38] bg-[#FAF8F5]/60 dark:bg-[#041A17]/60">
            <PaginationBar
              currentPage={safeTablePage}
              totalPages={totalTablePages}
              totalItems={filteredCholis.length}
              pageSize={tablePageSize}
              pageSizeOptions={[10, 25, 50, 100]}
              onPageChange={(p) => setTablePage(p)}
              onPageSizeChange={(sz) => {
                setTablePageSize(sz);
                setTablePage(1);
              }}
            />
          </div>
        </div>
      ) : (
        /* Mode 2: Dedicated Admin Card Grid (Shows All Confidential Details) */
        <div className="space-y-6">
          {cholisLoading && cholis.length === 0 ? (
            <CholiGridSkeleton />
          ) : filteredCholis.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-[#072622] rounded-3xl border border-dashed border-[#EADFC9] dark:border-[#1A3E38] p-6 space-y-2">
              <CalendarIcon className="w-8 h-8 text-[#DFBD76] mx-auto opacity-50" />
              <p className="font-serif text-lg text-[#1C1917] dark:text-[#FAF6EC]">
                {filterEventDate && onlyAvailableOnDate 
                  ? `No cholis are available on ${new Date(filterEventDate).toDateString()}.`
                  : 'No cholis match your search criteria.'}
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  setStatusFilter('All');
                  setFilterEventDate('');
                  setOnlyAvailableOnDate(false);
                }}
                className="mt-2 text-xs text-[#084C42] dark:text-[#DFBD76] font-bold underline"
              >
                Reset all filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
                {paginatedCardCholis.map((c) => {
                const totalCost = c.totalCosting ?? 0;
                const rentEarned = c.totalEarnedFromRent ?? 0;
                const breakEvenPct = totalCost > 0
                  ? Math.min(100, Math.round((rentEarned / totalCost) * 100))
                  : 100;
                const remainingToBreakeven = Math.max(0, totalCost - rentEarned);
                const netProfit = rentEarned - totalCost;
                const avail = getCholiAvailability(c, filterEventDate);

                return (
                  <div 
                    key={c._id}
                    className="bg-white dark:bg-[#072622] rounded-3xl border border-[#EADFC9] dark:border-[#1A3E38] shadow-sm hover:shadow-xl hover:border-[#DFBD76]/50 transition-all overflow-hidden flex flex-col justify-between"
                  >
                    <div>
                      {/* Card Top: Multi-Photo Carousel + Badges */}
                      <div className="relative overflow-hidden group">
                        <OutfitPhotoCarousel
                          images={c.images}
                          title={c.name}
                          sku={c.sku}
                          aspectRatio="aspect-[4/3]"
                          onOpenLightbox={(imgUrl) => {
                            setPreviewCholi(c);
                            const idx = c.images.indexOf(imgUrl);
                            setSelectedPreviewImageIdx(idx !== -1 ? idx : 0);
                          }}
                        />

                        {/* Top Badges */}
                        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10 pointer-events-none">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-[#084C42] text-[#FAF6EC] border border-[#DFBD76]/50 shadow-md">
                            {c.sku}
                          </span>
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#DFBD76] text-stone-950 uppercase tracking-wider shadow-sm">
                            {c.category}
                          </span>
                        </div>

                        {/* Bottom Identity in Image */}
                        <div className="absolute bottom-8 left-3 right-3 z-10 pointer-events-none">
                          <h3 className="font-serif font-bold text-base text-white line-clamp-1 drop-shadow-md">
                            {c.name}
                          </h3>
                          <p className="text-[11px] text-stone-200 line-clamp-1 drop-shadow-sm">
                            {c.color} • {c.fabric}
                          </p>
                        </div>
                      </div>

                      {/* Body Section */}
                      <div className="p-4 sm:p-5 space-y-4">
                        
                        {/* Live SKU Date Availability Banner */}
                        <div className="p-2.5 rounded-2xl bg-[#FAF8F5] dark:bg-[#041A17] border border-[#EADFC9] dark:border-[#1A3E38] space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] uppercase tracking-wider text-[#78716C] dark:text-[#9CA3AF] font-bold">
                              SKU Availability
                            </span>
                            {avail.isAvailable ? (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>{filterEventDate ? `Free on ${filterEventDate}` : 'Ready in Vault'}</span>
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border border-red-300 dark:border-red-800 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3 text-red-600" />
                                <span>{filterEventDate ? `Booked on ${filterEventDate}` : 'Currently Rented'}</span>
                              </span>
                            )}
                          </div>

                          {/* Booking Conflict Details if booked */}
                          {!avail.isAvailable && (avail.conflictBooking || avail.currentRental) && (
                            <div className="text-[11px] text-[#78716C] dark:text-[#9CA3AF] pt-1 border-t border-[#EADFC9]/50 dark:border-[#1A3E38] flex items-center justify-between">
                              <span className="truncate">
                                Client: <strong className="text-[#1C1917] dark:text-[#FAF6EC]">{(avail.conflictBooking || avail.currentRental)?.customer.name}</strong>
                              </span>
                              <span className="font-mono text-[10px] text-[#084C42] dark:text-[#DFBD76] font-bold flex-shrink-0">
                                {(avail.conflictBooking || avail.currentRental)?.bookingNumber}
                              </span>
                            </div>
                          )}

                          {/* Upcoming bookings indicator */}
                          {avail.isAvailable && avail.upcomingCount !== undefined && avail.upcomingCount > 0 && (
                            <p className="text-[10px] text-[#78716C] dark:text-[#9CA3AF]">
                              {avail.upcomingCount} upcoming booking(s) scheduled
                            </p>
                          )}
                        </div>

                        {/* Sizing Specs Row */}
                        <div className="grid grid-cols-2 gap-2 text-xs py-1 border-b border-[#EADFC9]/60 dark:border-[#1A3E38]">
                          <div>
                            <span className="text-[10px] uppercase tracking-wider text-[#78716C] dark:text-[#9CA3AF] block font-semibold">
                              Blouse Size
                            </span>
                            <span className="font-semibold text-[#1C1917] dark:text-[#FAF6EC]">
                              {c.blouseSize}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase tracking-wider text-[#78716C] dark:text-[#9CA3AF] block font-semibold">
                              Skirt Length
                            </span>
                            <span className="font-semibold text-[#1C1917] dark:text-[#FAF6EC]">
                              {c.skirtLength}&quot; (Flare)
                            </span>
                          </div>
                        </div>

                        {/* Financials & Rental Pricing */}
                        <div className="space-y-2">
                          <div className="grid grid-cols-3 gap-2 p-2.5 rounded-2xl bg-[#FAF8F5] dark:bg-[#041A17] border border-[#EADFC9]/70 dark:border-[#1A3E38] text-center">
                            <div>
                              <span className="text-[9px] uppercase tracking-wider text-[#78716C] dark:text-[#9CA3AF] block font-bold">
                                3-Day Rent
                              </span>
                              <span className="font-serif font-bold text-xs sm:text-sm text-[#084C42] dark:text-[#DFBD76]">
                                ₹{(c.rentalPricePerEvent ?? 0).toLocaleString('en-IN')}
                              </span>
                            </div>
                            <div>
                              <span className="text-[9px] uppercase tracking-wider text-[#78716C] dark:text-[#9CA3AF] block font-bold">
                                Laundry
                              </span>
                              <span className="font-semibold text-xs text-[#1C1917] dark:text-[#FAF6EC]">
                                ₹{(c.dryCleaningFee ?? 0).toLocaleString('en-IN')}
                              </span>
                            </div>
                            <div>
                              <span className="text-[9px] uppercase tracking-wider text-[#78716C] dark:text-[#9CA3AF] block font-bold">
                                Deposit
                              </span>
                              <span className="font-semibold text-xs text-[#1C1917] dark:text-[#FAF6EC]">
                                ₹{(c.securityDeposit ?? 0).toLocaleString('en-IN')}
                              </span>
                            </div>
                          </div>

                          {/* Confidential Capital Costing & Breakeven Recovery Bar */}
                          <div className="p-3 rounded-2xl bg-[#084C42]/5 dark:bg-[#041A17] border border-[#084C42]/15 dark:border-[#1A3E38] space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-[10px] uppercase tracking-wider text-[#78716C] dark:text-[#9CA3AF] font-bold">
                                Capital Cost: <strong className="text-[#1C1917] dark:text-[#FAF6EC]">₹{(c.totalCosting ?? 0).toLocaleString('en-IN')}</strong>
                              </span>
                              <span className="font-mono font-bold text-[11px] text-[#084C42] dark:text-[#DFBD76]">
                                {breakEvenPct}% Recovered
                              </span>
                            </div>

                            {/* Progress Bar */}
                            <div className="w-full bg-[#EADFC9]/70 dark:bg-[#0A2E28] h-2 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all duration-500 ${
                                  c.isBreakEvenReached 
                                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400' 
                                    : 'bg-gradient-to-r from-[#DFBD76] to-[#084C42]'
                                }`}
                                style={{ width: `${breakEvenPct}%` }}
                              />
                            </div>

                            <div className="flex items-center justify-between text-[10px] text-[#78716C] dark:text-[#9CA3AF] pt-0.5">
                              <span>
                                Earned: <strong className="text-[#084C42] dark:text-[#DFBD76]">₹{(c.totalEarnedFromRent ?? 0).toLocaleString('en-IN')}</strong>
                              </span>
                              {c.isBreakEvenReached ? (
                                <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-0.5">
                                  <TrendingUp className="w-2.5 h-2.5" /> +₹{(netProfit ?? 0).toLocaleString('en-IN')} Profit
                                </span>
                              ) : (
                                <span className="text-[#78716C] dark:text-[#9CA3AF]">
                                  ₹{(remainingToBreakeven ?? 0).toLocaleString('en-IN')} left
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* Card Footer Actions */}
                    <div className="p-4 bg-[#FAF8F5]/80 dark:bg-[#041A17]/80 border-t border-[#EADFC9]/60 dark:border-[#1A3E38] flex items-center justify-between gap-2">
                      {/* Left Actions: QR + Calendar + Details Link + Instagram */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setSelectedCholiForQr(c)}
                          className="p-2 rounded-xl bg-white dark:bg-[#0A2E28] border border-[#EADFC9] dark:border-[#1A3E38] text-[#084C42] dark:text-[#DFBD76] hover:bg-[#FAF8F5] dark:hover:bg-[#072622] transition-all shadow-sm"
                          title="Print Choli QR Hangtag"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onCheckCalendar?.(c._id)}
                          className="p-2 rounded-xl bg-white dark:bg-[#0A2E28] border border-[#EADFC9] dark:border-[#1A3E38] text-[#084C42] dark:text-[#DFBD76] hover:bg-[#FAF8F5] dark:hover:bg-[#072622] transition-all shadow-sm"
                          title="View Rental Calendar for this SKU"
                        >
                          <CalendarIcon className="w-3.5 h-3.5" />
                        </button>
                        <a
                          href={c.instagramUrl || APP_CONFIG.DEFAULT_INSTAGRAM_PROFILE}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => openInstagram(c.instagramUrl || APP_CONFIG.DEFAULT_INSTAGRAM_PROFILE, e)}
                          className="p-2 rounded-xl bg-white dark:bg-[#0A2E28] border border-[#EADFC9] dark:border-[#1A3E38] text-pink-600 dark:text-pink-400 hover:border-pink-500 hover:bg-pink-50 dark:hover:bg-pink-950/30 transition-all shadow-sm flex items-center justify-center"
                          title="Open in Instagram App"
                          aria-label="Open in Instagram App"
                        >
                          <InstagramIcon sx={{ fontSize: 14 }} />
                        </a>
                        <a
                          href={`/choli/${c._id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-xl bg-white dark:bg-[#0A2E28] border border-[#EADFC9] dark:border-[#1A3E38] text-[#78716C] hover:text-[#084C42] dark:hover:text-[#DFBD76] transition-all shadow-sm"
                          title="Open Public Showcase Page"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>

                      {/* Right Actions: Book + Delete */}
                      <div className="flex items-center gap-1.5">
                        {/* Status update button on mobile card */}
                        <button
                          onClick={() => setStatusCholi(c)}
                          className="p-2 rounded-xl bg-white dark:bg-[#0A2E28] border border-[#DFBD76]/60 text-[#084C42] dark:text-[#DFBD76] hover:bg-[#DFBD76]/20 transition-all shadow-sm"
                          title="Update Status (Cleaning, Alteration, Ready)"
                        >
                          <Shirt className="w-3.5 h-3.5" />
                        </button>

                        {c.status === 'AT_DRY_CLEANER' ? (
                          <button
                            onClick={() => setStatusCholi(c)}
                            className="py-1.5 px-3 rounded-xl bg-sky-100 text-sky-800 dark:bg-sky-950/40 dark:text-sky-300 border border-sky-300 dark:border-sky-800/50 text-xs font-bold shadow-sm transition-all flex items-center gap-1 cursor-pointer"
                            title="At dry cleaner — Click to update status"
                          >
                            <Waves className="w-3 h-3" />
                            <span>Dry Cleaning</span>
                          </button>
                        ) : c.status === 'IN_ALTERATION' ? (
                          <button
                            onClick={() => setStatusCholi(c)}
                            className="py-1.5 px-3 rounded-xl bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-300 dark:border-amber-800/50 text-xs font-bold shadow-sm transition-all flex items-center gap-1 cursor-pointer"
                            title="In alteration — Click to update status"
                          >
                            <Scissors className="w-3 h-3" />
                            <span>In Alteration</span>
                          </button>
                        ) : c.status === 'RETIRED' ? (
                          <button
                            onClick={() => setStatusCholi(c)}
                            className="py-1.5 px-3 rounded-xl bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300 border border-stone-300 dark:border-stone-700 text-xs font-bold shadow-sm transition-all flex items-center gap-1 cursor-pointer"
                            title="Archived — Click to update status"
                          >
                            <Archive className="w-3 h-3" />
                            <span>Archived</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleBookOutfit(c._id)}
                            className="py-1.5 px-3 rounded-xl bg-[#084C42] hover:bg-[#0D6357] text-[#FAF6EC] border border-[#DFBD76]/50 text-xs font-bold shadow-sm transition-all flex items-center gap-1"
                            title="Book this outfit"
                          >
                            <ShoppingBag className="w-3.5 h-3.5 text-[#DFBD76]" />
                            <span>Book</span>
                          </button>
                        )}
                        {currentUser?.role === 'ADMIN' && (
                          <button
                            onClick={() => handleEdit(c)}
                            className="p-2 rounded-xl bg-white dark:bg-[#0A2E28] border border-[#EADFC9] dark:border-[#1A3E38] text-[#084C42] dark:text-[#DFBD76] hover:border-[#DFBD76] hover:bg-[#FAF8F5] dark:hover:bg-[#072622] transition-all shadow-sm"
                            title="Edit Choli Details (Admin)"
                            aria-label="Edit Choli Details"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {currentUser?.role === 'ADMIN' && (
                          <button
                            onClick={() => handleDelete(c)}
                            className="p-2 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/60 border border-red-200 dark:border-red-900/40 transition-all shadow-sm"
                            title="Delete from Inventory"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>

            {/* Card View Pagination Bar */}
            <div className="bg-white dark:bg-[#072622] rounded-2xl border border-[#EADFC9] dark:border-[#1A3E38] p-3 sm:p-4 shadow-sm">
              <PaginationBar
                currentPage={safeCardPage}
                totalPages={totalCardPages}
                totalItems={filteredCholis.length}
                pageSize={cardPageSize}
                pageSizeOptions={[8, 12, 24, 48]}
                onPageChange={(p) => setCardPage(p)}
                onPageSizeChange={(sz) => {
                  setCardPageSize(sz);
                  setCardPage(1);
                }}
              />
            </div>
          </>
        )}
        </div>
      )}

      {/* Edit Choli Modal */}
      {editingCholi && (
        <AddCholiModal
          isOpen={Boolean(editingCholi)}
          choliToEdit={editingCholi}
          onClose={() => setEditingCholi(null)}
        />
      )}

      {/* Date Availability Checker Modal */}
      {selectedCholiForDateCheck && (
        <DateCheckModal
          choli={selectedCholiForDateCheck}
          isOpen={Boolean(selectedCholiForDateCheck)}
          onClose={() => setSelectedCholiForDateCheck(null)}
        />
      )}

      {/* Boutique QR Code Hangtag Modal */}
      <CholiQrModal
        choli={selectedCholiForQr}
        isOpen={Boolean(selectedCholiForQr)}
        onClose={() => setSelectedCholiForQr(null)}
      />

      {/* Staff / Admin Update Choli Status Modal */}
      <UpdateStatusModal
        choli={statusCholi}
        isOpen={Boolean(statusCholi)}
        onClose={() => setStatusCholi(null)}
      />

      {/* Custom Confirmation Popup for Deleting Choli from Table */}
      <ConfirmationModal
        isOpen={Boolean(choliToDelete)}
        onClose={() => setCholiToDelete(null)}
        onConfirm={() => {
          if (choliToDelete) {
            dispatch(deleteCholiApi(choliToDelete._id));
            toast.success(`"${choliToDelete.name}" removed from MongoDB inventory.`);
            setCholiToDelete(null);
          }
        }}
        title="Remove Outfit from Inventory?"
        description={`Are you sure you want to delete "${choliToDelete?.name}" (${choliToDelete?.sku}) from the master register? This action cannot be undone.`}
        confirmText="Yes, Delete Outfit"
        cancelText="Cancel"
        type="danger"
        itemPreview={choliToDelete ? {
          title: choliToDelete.name,
          badge: choliToDelete.sku,
          image: choliToDelete.images[0] || '/logo.jpg',
          subtitle: `${choliToDelete.category} • ${choliToDelete.fabric}`,
          details: [
            { label: 'Wholesale Cost', value: `₹${(choliToDelete?.totalCosting ?? 0).toLocaleString('en-IN')}` },
            { label: 'Rental Rate', value: `₹${(choliToDelete?.rentalPricePerEvent ?? 0).toLocaleString('en-IN')}` },
          ]
        } : undefined}
      />

      {/* Multi-Photo Lightbox Modal for Admin Table */}
      {previewCholi && (
        <div 
          className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
          onClick={() => setPreviewCholi(null)}
        >
          <div 
            className="bg-white dark:bg-[#072622] rounded-3xl border border-[#DFBD76]/50 max-w-xl w-full p-4 sm:p-5 shadow-2xl space-y-4 max-h-[calc(100dvh-1.5rem)] overflow-y-auto custom-scrollbar my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#EADFC9] dark:border-[#1A3E38]">
              <div>
                <h3 className="font-serif font-bold text-lg text-[#1C1917] dark:text-[#FAF6EC]">
                  {previewCholi.name}
                </h3>
                <span className="text-xs font-mono font-bold text-[#084C42] dark:text-[#DFBD76]">
                  {previewCholi.sku} • {previewCholi.category}
                </span>
              </div>
              <button
                onClick={() => setPreviewCholi(null)}
                className="p-1.5 rounded-full hover:bg-stone-200 dark:hover:bg-[#0A2E28] text-stone-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Main Preview Image with Touch Swipe Support */}
            <div 
              className="relative aspect-[3/4] max-h-[380px] w-full rounded-2xl overflow-hidden bg-black/5 border border-[#EADFC9] dark:border-[#1A3E38] select-none touch-pan-y"
              onTouchStart={handleModalTouchStart}
              onTouchEnd={handleModalTouchEnd}
            >
              <img
                src={previewCholi.images[selectedPreviewImageIdx] || '/logo.jpg'}
                alt={previewCholi.name}
                className="w-full h-full object-cover pointer-events-none"
                draggable={false}
              />

              {/* Photo Counter Pill */}
              {previewCholi.images.length > 1 && (
                <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-black/60 text-[#DFBD76] backdrop-blur-md border border-[#DFBD76]/30">
                  {selectedPreviewImageIdx + 1} / {previewCholi.images.length}
                </div>
              )}
            </div>

            {/* Thumbnail Strip */}
            {previewCholi.images.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {previewCholi.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedPreviewImageIdx(idx)}
                    className={`w-14 h-16 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                      selectedPreviewImageIdx === idx
                        ? 'border-[#084C42] dark:border-[#DFBD76] ring-2 ring-[#DFBD76]/40'
                        : 'border-[#EADFC9] dark:border-[#1A3E38] opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Quick Specs Footer */}
            <div className="grid grid-cols-3 gap-2 text-center p-3 rounded-2xl bg-[#FAF8F5] dark:bg-[#041A17] border border-[#EADFC9] dark:border-[#1A3E38] text-xs">
              <div>
                <span className="text-[10px] text-[#78716C] dark:text-[#9CA3AF] block">Rental Rate</span>
                <strong className="text-[#084C42] dark:text-[#DFBD76]">₹{(previewCholi.rentalPricePerEvent ?? 0).toLocaleString('en-IN')}</strong>
              </div>
              <div>
                <span className="text-[10px] text-[#78716C] dark:text-[#9CA3AF] block">Deposit</span>
                <strong className="text-[#1C1917] dark:text-[#FAF6EC]">₹{(previewCholi.securityDeposit ?? 0).toLocaleString('en-IN')}</strong>
              </div>
              <div>
                <span className="text-[10px] text-[#78716C] dark:text-[#9CA3AF] block">Capital Cost</span>
                <strong className="text-[#15803D] dark:text-[#22C55E]">₹{(previewCholi.totalCosting ?? 0).toLocaleString('en-IN')}</strong>
              </div>
            </div>

            {/* View Full Choli Details Page & All Photos Action */}
            <div className="pt-1 flex items-center justify-between gap-3">
              <span className="text-xs text-[#78716C] dark:text-[#9CA3AF]">
                📸 {previewCholi.images.length} High-Res Photos
              </span>
              <a
                href={`/choli/${previewCholi._id}`}
                target="_blank"
                rel="noreferrer"
                className="py-2 px-4 rounded-xl text-xs font-bold bg-[#084C42] hover:bg-[#0D6357] text-[#FAF6EC] border border-[#DFBD76]/50 flex items-center gap-1.5 transition-all shadow-sm"
              >
                <span>Open Details & All Photos</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#DFBD76]" />
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
