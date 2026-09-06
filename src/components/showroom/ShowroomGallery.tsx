'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { 
  setSelectedCategory, 
  setSearchQuery, 
  deleteCholi,
  deleteCholiApi 
} from '@/store/choliSlice';
import { openBookingModal } from '@/store/bookingSlice';
import { openAuthModal, toggleTheme, logoutUser } from '@/store/authSlice';
import { BreakEvenTracker } from '@/components/choli/BreakEvenTracker';
import { OutfitPhotoCarousel } from '@/components/showroom/OutfitPhotoCarousel';
import { DateCheckModal } from '@/components/showroom/DateCheckModal';
import { CholiQrModal } from '@/components/choli/CholiQrModal';
import { ConfirmationModal } from '@/components/common/ConfirmationModal';
import { CholiCategory, Choli } from '@/types';
import { 
  Search, 
  Filter, 
  Calendar as CalendarIcon, 
  Sparkles, 
  Ruler, 
  Trash2, 
  Tag, 
  Share2, 
  ChevronRight,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  Moon,
  Sun,
  Lock,
  LogOut,
  User,
  Layers,
  Table,
  LayoutGrid,
  QrCode,
  Images
} from 'lucide-react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';
import InstagramIcon from '@mui/icons-material/Instagram';
import { APP_CONFIG } from '@/constants';
import { toast } from 'sonner';
import { openInstagram } from '@/lib/instagram';

interface ShowroomGalleryProps {
  onCheckCalendar: (choliId: string) => void;
  onSwitchToTable?: () => void;
}

const CATEGORIES: (CholiCategory | 'All')[] = [
  'All',
  'Bridal',
  'Sangeet',
  'Navratri',
  'Reception',
  'Partywear'
];

export function ShowroomGallery({ onCheckCalendar, onSwitchToTable }: ShowroomGalleryProps) {
  const dispatch = useAppDispatch();
  const { items, loading, searchQuery, selectedCategory } = useAppSelector(
    (state) => state.cholis
  );
  const bookings = useAppSelector((state) => state.bookings.items);
  const { currentUser, theme } = useAppSelector((state) => state.auth);

  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [selectedCholiForDateCheck, setSelectedCholiForDateCheck] = useState<Choli | null>(null);
  const [selectedCholiForQr, setSelectedCholiForQr] = useState<Choli | null>(null);
  const [choliToDelete, setCholiToDelete] = useState<Choli | null>(null);

  // Date availability filter state
  const [filterEventDate, setFilterEventDate] = useState<string>('');
  const [onlyAvailableOnDate, setOnlyAvailableOnDate] = useState<boolean>(false);

  // Helper to check if a choli is available on a specific date
  const isCholiAvailableOnDate = (choliId: string, date: string) => {
    if (!date) return true;
    const overlap = bookings.find((b) => {
      if (b.status === 'CANCELLED' || b.choliId !== choliId) return false;
      return date >= b.pickupDate && date <= b.returnExpectedDate;
    });
    return !overlap;
  };

  // Filter items (No choli status filter)
  const filteredItems = items.filter((choli) => {
    const matchesSearch =
      choli.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      choli.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      choli.color.toLowerCase().includes(searchQuery.toLowerCase()) ||
      choli.fabric.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'All' || choli.category === selectedCategory;

    // Date availability filter
    const matchesDate = !filterEventDate || !onlyAvailableOnDate || isCholiAvailableOnDate(choli._id, filterEventDate);

    return matchesSearch && matchesCategory && matchesDate;
  });

  const handleCopyLink = (choli: Choli) => {
    navigator.clipboard?.writeText(
      `Explore "${choli.name}" (${choli.sku}) available for rent at ShreeSakhi Boutique! Rental Rate: ₹${choli.rentalPricePerEvent}/event.`
    );
    toast.success('Outfit details copied for WhatsApp sharing!');
  };

  const handleDelete = (choli: Choli) => {
    if (currentUser?.role !== 'ADMIN') {
      toast.error('Only Admin has permission to delete outfits.');
      return;
    }
    setCholiToDelete(choli);
  };

  const handleBookOutfit = (choliId: string) => {
    if (!currentUser) {
      toast.warning('Staff or Owner sign-in required', {
        description: 'Please sign in with your Staff or Owner account to record customer bookings.'
      });
      dispatch(openAuthModal());
      return;
    }
    dispatch(openBookingModal(choliId));
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Filter & Search Bar with Real-Time Date Availability Checker */}
      <div className="bg-white/80 dark:bg-[#072622]/90 backdrop-blur-xl p-4 sm:p-5 rounded-3xl border border-[#EADFC9] dark:border-[#1A3E38] shadow-sm space-y-4">
        
        {/* Top Search & Event Date Checker Row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          
          {/* Search Input (6 Cols) */}
          <div className="relative md:col-span-6">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#78716C] dark:text-[#9BB5AF]" />
            <input
              type="text"
              placeholder="Search cholis by name, SKU, color..."
              value={searchQuery}
              onChange={(e) => dispatch(setSearchQuery(e.target.value))}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl text-xs sm:text-sm bg-[#FAF8F5] dark:bg-[#041A17] border border-[#EADFC9] dark:border-[#1A3E38] focus:outline-none focus:border-[#DFBD76] transition-all text-[#1C1917] dark:text-[#FAF6EC] placeholder-[#78716C] dark:placeholder-[#9BB5AF]"
            />
          </div>

          {/* Real-Time Event Date Availability Checker (6 Cols, MUI DatePicker) */}
          <div className="md:col-span-6 flex items-center gap-2 p-1.5 rounded-2xl bg-[#FAF8F5] dark:bg-[#041A17] border border-[#DFBD76]/50 shadow-inner">
            <CalendarIcon className="w-4 h-4 text-[#DFBD76] ml-2 flex-shrink-0" />
            <DatePicker
              value={filterEventDate ? dayjs(filterEventDate) : null}
              onChange={(newValue: Dayjs | null) => {
                const val = newValue && newValue.isValid() ? newValue.format('YYYY-MM-DD') : '';
                setFilterEventDate(val);
                if (val) {
                  toast.info(`Checking choli availability for ${val}`);
                }
              }}
              slotProps={{
                textField: {
                  size: 'small',
                  variant: 'standard',
                  slotProps: {
                    input: { disableUnderline: true },
                    htmlInput: { placeholder: 'Select Event Date to Check Availability' },
                  },
                  sx: {
                    flex: 1,
                    '& .MuiInputBase-input': {
                      fontSize: '0.8125rem',
                      py: 0.5,
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
            {filterEventDate && (
              <button
                onClick={() => {
                  setFilterEventDate('');
                  setOnlyAvailableOnDate(false);
                }}
                className="p-1.5 rounded-lg hover:bg-stone-200 dark:hover:bg-[#0A2E28] text-[#78716C] dark:text-[#9BB5AF]"
                title="Clear date filter"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Date Filter Active Toggle Banner */}
        {filterEventDate && (
          <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-2xl bg-[#DFBD76]/15 dark:bg-[#0A2E28] border border-[#DFBD76]/40 text-xs">
            <span className="text-[#1C1917] dark:text-[#FAF6EC]">
              Checking availability for event date: <strong className="text-[#084C42] dark:text-[#DFBD76]">{new Date(filterEventDate).toDateString()}</strong>
            </span>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={onlyAvailableOnDate}
                onChange={(e) => setOnlyAvailableOnDate(e.target.checked)}
                className="w-4 h-4 rounded text-[#084C42] focus:ring-[#DFBD76] cursor-pointer"
              />
              <span className="font-bold text-[#084C42] dark:text-[#DFBD76]">
                Show Only Available Cholis
              </span>
            </label>
          </div>
        )}

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => dispatch(setSelectedCategory(cat))}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-[#084C42] text-[#FAF6EC] shadow-md shadow-[#084C42]/25 border border-[#DFBD76]'
                  : 'bg-[#FAF8F5] dark:bg-[#041A17] text-[#78716C] dark:text-[#9BB5AF] border border-[#EADFC9]/70 dark:border-[#1A3E38] hover:border-[#DFBD76]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

      </div>

      {/* Total Choli Count Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1 text-xs text-[#78716C] dark:text-[#9CA3AF]">
        <div className="flex items-center gap-2">
          <span suppressHydrationWarning className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#084C42]/10 dark:bg-[#DFBD76]/15 text-[#084C42] dark:text-[#DFBD76] font-bold">
            <Layers className="w-3.5 h-3.5" />
            Total Collection: {items.length} Cholis
          </span>
          <span suppressHydrationWarning>
            • Showing <strong suppressHydrationWarning className="text-[#1C1917] dark:text-[#F5F5F7]">{filteredItems.length}</strong> of <strong suppressHydrationWarning className="text-[#1C1917] dark:text-[#F5F5F7]">{items.length}</strong> outfits in vault
          </span>
        </div>
      </div>

      {/* Grid of Cholis with Multi-Photo Carousels & Instant Date Status */}
      {loading && items.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-[#072622] rounded-3xl border border-[#EADFC9] dark:border-[#1A3E38] p-6 space-y-3">
          <div className="w-10 h-10 rounded-full border-3 border-[#DFBD76] border-t-transparent animate-spin mx-auto" />
          <p className="font-serif text-base font-bold text-[#084C42] dark:text-[#DFBD76]">
            Loading Shree Sakhi Choli Collection...
          </p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-[#072622] rounded-3xl border border-dashed border-[#EADFC9] dark:border-[#1A3E38] p-6 space-y-2">
          <CalendarIcon className="w-8 h-8 text-[#DFBD76] mx-auto opacity-50" />
          <p className="font-serif text-lg text-[#1C1917] dark:text-[#FAF6EC]">
            {filterEventDate && onlyAvailableOnDate 
              ? `No outfits are available on ${new Date(filterEventDate).toDateString()}. Try another date!`
              : 'No cholis found matching your search.'}
          </p>
          <button
            onClick={() => {
              dispatch(setSearchQuery(''));
              dispatch(setSelectedCategory('All'));
              setFilterEventDate('');
              setOnlyAvailableOnDate(false);
            }}
            className="mt-2 text-xs text-[#084C42] dark:text-[#DFBD76] font-bold underline"
          >
            Reset all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredItems.map((choli) => {
            const hasDateSelected = !!filterEventDate;
            const isAvailableForSelectedDate = isCholiAvailableOnDate(choli._id, filterEventDate);

            return (
              <div
                key={choli._id}
                className="group flex flex-col bg-white dark:bg-[#072622] rounded-3xl border border-[#EADFC9] dark:border-[#1A3E38] overflow-hidden shadow-md hover:shadow-2xl hover:border-[#DFBD76]/50 transition-all duration-300 hover:-translate-y-1"
              >
                {/* Multi-Angle Photo Carousel */}
                <div className="relative">
                  <OutfitPhotoCarousel
                    images={choli.images}
                    title={choli.name}
                    sku={choli.sku}
                    onOpenLightbox={(img) => setLightboxImage(img)}
                  />

                  {/* SKU & Category Floating Badges */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider bg-black/70 text-white backdrop-blur-md border border-white/10">
                      {choli.sku}
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#C5A059] text-stone-950 backdrop-blur-md shadow-sm">
                      {choli.category}
                    </span>
                  </div>

                  {/* Date Availability Indicator Badge (Only shown when an event date is actively being checked) */}
                  {hasDateSelected && (
                    <div className="absolute top-3 right-3 z-10">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-bold backdrop-blur-md shadow-md flex items-center gap-1 ${
                          isAvailableForSelectedDate
                            ? 'bg-emerald-600 text-white'
                            : 'bg-red-600 text-white animate-pulse'
                        }`}
                      >
                        {isAvailableForSelectedDate ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Available on Date</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3" />
                            <span>Booked on Date</span>
                          </>
                        )}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content Details */}
                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                  
                  <div className="space-y-2">
                    <Link 
                      href={`/choli/${choli._id}`}
                      className="font-serif text-lg font-bold text-[#1C1917] dark:text-[#FAF6EC] line-clamp-1 hover:text-[#084C42] dark:hover:text-[#DFBD76] transition-colors block"
                      title="View Full Details & All Photos"
                    >
                      {choli.name}
                    </Link>

                    {/* Metadata Specs & All Photos Link */}
                    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs text-[#78716C] dark:text-[#9CA3AF]">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 font-medium">
                          <Tag className="w-3 h-3 text-[#DFBD76]" />
                          {choli.color}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-medium">
                          <Ruler className="w-3 h-3 text-[#DFBD76]" />
                          {choli.blouseSize}
                        </span>
                      </div>

                      <Link
                        href={`/choli/${choli._id}`}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#084C42] dark:text-[#DFBD76] hover:underline"
                        title="View All Photos of this Choli"
                      >
                        <Images className="w-3 h-3" />
                        <span>All {choli.images.length} Photos →</span>
                      </Link>
                    </div>

                    <p className="text-xs text-[#78716C] dark:text-[#9CA3AF] line-clamp-2 leading-relaxed">
                      {choli.fabric} — {choli.description}
                    </p>
                  </div>

                  {/* Rental Pricing Box */}
                  <div className="bg-[#FAF8F5] dark:bg-[#041A17] p-3.5 rounded-2xl border border-[#EADFC9]/70 dark:border-[#1A3E38] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#78716C] dark:text-[#9CA3AF] block">
                        Rent per Event
                      </span>
                      <div className="flex items-baseline gap-1">
                        <span className="font-serif text-xl font-bold text-[#084C42] dark:text-[#DFBD76]">
                          ₹{(choli.rentalPricePerEvent ?? 0).toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] text-[#78716C] dark:text-[#9CA3AF]">/ 3 days</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#78716C] dark:text-[#9CA3AF] block">
                        Refundable Deposit
                      </span>
                      <span className="text-xs font-bold text-[#1C1917] dark:text-[#FAF6EC]">
                        ₹{(choli.securityDeposit ?? 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* STRICTLY ADMIN ONLY: Break-Even ROI Tracker */}
                  {currentUser?.role === 'ADMIN' && (
                    <div className="pt-1">
                      <BreakEvenTracker choli={choli} compact={true} />
                    </div>
                  )}

                  {/* Action Buttons with Check Date Modal Trigger */}
                  <div className="pt-2 flex items-center gap-2">
                    <button
                      onClick={() => handleBookOutfit(choli._id)}
                      className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold bg-gradient-to-r from-[#084C42] to-[#0D6357] text-white hover:opacity-95 shadow-md shadow-[#084C42]/25 flex items-center justify-center gap-1.5 transition-all"
                    >
                      <span>Book Outfit</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    {/* Instant Check Date Availability Button */}
                    <button
                      onClick={() => setSelectedCholiForDateCheck(choli)}
                      className="py-2.5 px-3 rounded-xl border border-[#EADFC9] dark:border-[#1A3E38] hover:border-[#DFBD76] bg-[#FAF8F5] dark:bg-[#0A2E28] text-[#1C1917] dark:text-[#FAF6EC] font-semibold text-xs flex items-center gap-1.5 transition-all"
                      title="Check if this choli is available on your target date"
                    >
                      <CalendarIcon className="w-3.5 h-3.5 text-[#DFBD76]" />
                      <span className="hidden sm:inline">Check Date</span>
                    </button>

                    {/* QR Code Hangtag Modal Trigger */}
                    <button
                      onClick={() => setSelectedCholiForQr(choli)}
                      className="p-2.5 rounded-xl border border-[#EADFC9] dark:border-[#1A3E38] hover:border-[#DFBD76] bg-[#FAF8F5] dark:bg-[#0A2E28] text-[#084C42] dark:text-[#DFBD76] transition-all"
                      title="View & Print Choli QR Hangtag"
                    >
                      <QrCode className="w-4 h-4" />
                    </button>

                    {/* Open in Instagram App */}
                    <a
                      href={choli.instagramUrl || APP_CONFIG.DEFAULT_INSTAGRAM_PROFILE}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => openInstagram(choli.instagramUrl || APP_CONFIG.DEFAULT_INSTAGRAM_PROFILE, e)}
                      className="p-2.5 rounded-xl border border-[#EADFC9] dark:border-[#1A3E38] hover:border-pink-500 hover:bg-pink-50 dark:hover:bg-pink-950/30 bg-[#FAF8F5] dark:bg-[#0A2E28] text-pink-600 dark:text-pink-400 transition-all flex items-center justify-center"
                      title="Open in Instagram App"
                      aria-label="Open in Instagram App"
                    >
                      <InstagramIcon sx={{ fontSize: 16 }} />
                    </a>

                    <button
                      onClick={() => handleCopyLink(choli)}
                      className="p-2.5 rounded-xl border border-[#EADFC9] dark:border-[#1A3E38] hover:border-[#15803D] bg-[#FAF8F5] dark:bg-[#0A2E28] text-[#1C1917] dark:text-[#FAF6EC] transition-all"
                      title="Share to WhatsApp"
                    >
                      <Share2 className="w-4 h-4 text-[#15803D]" />
                    </button>

                    {currentUser?.role === 'ADMIN' && (
                      <button
                        onClick={() => handleDelete(choli)}
                        className="p-2.5 rounded-xl border border-red-200 dark:border-red-900/40 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 dark:bg-[#0A2E28] transition-all"
                        title="Delete Outfit (Admin)"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Date Availability Checker Modal */}
      <DateCheckModal
        choli={selectedCholiForDateCheck}
        isOpen={!!selectedCholiForDateCheck}
        onClose={() => setSelectedCholiForDateCheck(null)}
      />

      {/* Boutique QR Code Hangtag Modal */}
      <CholiQrModal
        choli={selectedCholiForQr}
        isOpen={!!selectedCholiForQr}
        onClose={() => setSelectedCholiForQr(null)}
      />

      {/* Custom Confirmation Popup for Deleting Outfit */}
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
        title="Remove Outfit from Vault?"
        description={`Are you sure you want to remove "${choliToDelete?.name}" (${choliToDelete?.sku}) from the boutique inventory? This will permanently erase its historical costing and records.`}
        confirmText="Yes, Remove Outfit"
        cancelText="No, Keep Outfit"
        type="danger"
        itemPreview={choliToDelete ? {
          title: choliToDelete.name,
          badge: choliToDelete.sku,
          image: choliToDelete.images[0] || '/logo.jpg',
          subtitle: `${choliToDelete.category} • ${choliToDelete.color}`,
          details: [
            { label: 'Rental Fee', value: `₹${(choliToDelete?.rentalPricePerEvent ?? 0).toLocaleString('en-IN')}` },
            { label: 'Deposit', value: `₹${(choliToDelete?.securityDeposit ?? 0).toLocaleString('en-IN')}` },
          ]
        } : undefined}
      />

      {/* Fullscreen Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-3xl w-full max-h-[92vh] flex items-center justify-center">
            <img
              src={lightboxImage}
              alt="Expanded preview"
              className="max-h-[88vh] w-auto rounded-3xl shadow-2xl object-contain border border-white/20"
            />
          </div>
        </div>
      )}

    </div>
  );
}
