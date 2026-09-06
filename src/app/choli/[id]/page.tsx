'use client';

import React, { use, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { toggleTheme, openAuthModal } from '@/store/authSlice';
import { Choli } from '@/types';
import { openBookingModal, fetchBookings } from '@/store/bookingSlice';
import { CholiQrModal } from '@/components/choli/CholiQrModal';
import { BookingModal } from '@/components/booking/BookingModal';
import { AuthModal } from '@/components/auth/AuthModal';
import { 
  ArrowLeft, 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  XCircle, 
  Share2, 
  Sparkles, 
  ShieldCheck, 
  QrCode, 
  Tag, 
  Ruler, 
  Layers, 
  Moon, 
  Sun, 
  Phone,
  MessageCircle,
  Scissors,
  Images,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  ZoomIn
} from 'lucide-react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';
import InstagramIcon from '@mui/icons-material/Instagram';
import { APP_CONFIG } from '@/constants';
import { toast } from 'sonner';

interface CholiPageProps {
  params: Promise<{ id: string }>;
}

const ANGLE_LABELS = [
  'Front Look & Silhouette',
  'Full Skirt Flare & Kalis',
  'Back Cut & Blouse Work',
  'Handcrafted Zardozi & Embroidery',
  'Dupatta Draping & Borders',
  'Artisanal Craftsmanship Detail'
];

export default function CholiDetailsPage({ params }: CholiPageProps) {
  const resolvedParams = use(params);
  const choliId = resolvedParams.id;

  const dispatch = useAppDispatch();
  const cholis = useAppSelector((state) => state.cholis.items);
  const bookings = useAppSelector((state) => state.bookings.items);
  const { currentUser, theme } = useAppSelector((state) => state.auth);
  const isDark = theme === 'dark';

  const [remoteCholi, setRemoteCholi] = useState<Choli | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Find choli in Redux state or dynamically fetched from MongoDB
  const storeCholi = cholis.find((c) => c._id === choliId || c.sku === choliId);
  const choli = storeCholi || remoteCholi;

  useEffect(() => {
    if (!storeCholi) {
      setIsLoading(true);
      fetch(`/api/cholis/${choliId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data) {
            setRemoteCholi(data.data);
          }
        })
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [choliId, storeCholi]);

  useEffect(() => {
    if (bookings.length === 0) {
      dispatch(fetchBookings());
    }
  }, [dispatch, bookings.length]);

  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [lightboxImageIdx, setLightboxImageIdx] = useState<number | null>(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [checkEventDate, setCheckEventDate] = useState<string>('');

  const safeImages = choli?.images && choli.images.length > 0 
    ? choli.images 
    : ['/logo.jpg'];

  // Keyboard navigation for fullscreen lightbox
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (lightboxImageIdx === null) return;
    if (e.key === 'Escape') {
      setLightboxImageIdx(null);
    } else if (e.key === 'ArrowRight') {
      setLightboxImageIdx((prev) => (prev === null ? 0 : (prev + 1) % safeImages.length));
    } else if (e.key === 'ArrowLeft') {
      setLightboxImageIdx((prev) => (prev === null ? 0 : (prev === 0 ? safeImages.length - 1 : prev - 1)));
    }
  }, [lightboxImageIdx, safeImages.length]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (isLoading && !choli) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-4 bg-[#FAF8F5] dark:bg-[#041A17]">
        <div className="w-12 h-12 rounded-full border-3 border-[#DFBD76] border-t-transparent animate-spin" />
        <p className="font-serif text-sm font-bold text-[#084C42] dark:text-[#DFBD76]">
          Loading Choli from Shree Sakhi Vault...
        </p>
      </div>
    );
  }

  if (!choli) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center">
          <Tag className="w-8 h-8" />
        </div>
        <h1 className="font-serif text-2xl font-bold text-[#1C1917] dark:text-[#F5F5F7]">
          Outfit Not Found
        </h1>
        <p className="text-xs text-[#78716C] max-w-sm">
          The choli tag you scanned does not match any current active choli in our boutique register.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#084C42] text-[#FAF6EC] font-bold text-xs shadow-md"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Showroom Catalog</span>
        </Link>
      </div>
    );
  }

  // Check date availability
  const conflictingBooking = checkEventDate 
    ? bookings.find((b) => {
        if (b.status === 'CANCELLED' || b.choliId !== choli._id) return false;
        return checkEventDate >= b.pickupDate && checkEventDate <= b.returnExpectedDate;
      })
    : null;

  const handleBookOutfit = () => {
    if (!currentUser) {
      toast.warning('Staff or Owner sign-in required', {
        description: 'Please sign in with your Staff or Owner account to record customer bookings.'
      });
      dispatch(openAuthModal());
      return;
    }
    dispatch(openBookingModal(choli._id));
  };

  const handleWhatsAppInquiry = () => {
    const text = encodeURIComponent(
      `Hello ShreeSakhi Boutique! I am viewing "${choli.name}" (${choli.sku}). I would like to inquire about renting this outfit for my upcoming event. Rental rate: ₹${choli.rentalPricePerEvent}.`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Outfit link copied to clipboard!');
    }
  };

  const handlePrevImage = () => {
    setSelectedImageIdx((prev) => (prev === 0 ? safeImages.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setSelectedImageIdx((prev) => (prev === safeImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#041A17] text-[#1C1917] dark:text-[#F5F5F7] transition-colors pb-20">
      
      {/* Top Floating Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#072622]/95 backdrop-blur-md border-b border-[#EADFC9] dark:border-[#1A3E38] transition-colors shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-bold text-[#084C42] dark:text-[#DFBD76] hover:opacity-85 transition-opacity"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Showroom Collection</span>
          </Link>

          {/* Center Brand Identity */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <div className="h-9 px-2.5 rounded-xl bg-[#025151] border border-[#DFBD76]/70 flex items-center justify-center shadow-sm">
              <img src="/logo-cropped.png" alt="श्री SAKHI BOUTIQUE" className="h-6 w-auto object-contain" />
            </div>
          </Link>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsQrModalOpen(true)}
              className="p-2 rounded-full border border-[#EADFC9] dark:border-[#1A3E38] hover:bg-[#FAF8F5] dark:hover:bg-[#0A2E28] text-[#084C42] dark:text-[#DFBD76] transition-all"
              title="View & Print QR Hangtag"
            >
              <QrCode className="w-4 h-4" />
            </button>
            <button
              onClick={() => dispatch(toggleTheme())}
              className="p-2 rounded-full border border-[#EADFC9] dark:border-[#1A3E38] hover:bg-[#FAF8F5] dark:hover:bg-[#0A2E28] text-[#1C1917] dark:text-[#DFBD76] transition-all"
              title="Toggle Dark/Light Mode"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
        
        {/* Top Split Section: Main Photo & Choli Specs/Rent */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Interactive Featured Photo Viewer & Thumbnails (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Main Featured Photo Box */}
            <div className="bg-white dark:bg-[#072622] rounded-3xl border border-[#EADFC9] dark:border-[#1A3E38] overflow-hidden shadow-lg p-2 sm:p-3 relative group">
              <div className="relative aspect-[3/4] max-h-[560px] w-full rounded-2xl overflow-hidden bg-stone-100 dark:bg-stone-900">
                <img
                  src={safeImages[selectedImageIdx]}
                  alt={`${choli.name} - ${ANGLE_LABELS[selectedImageIdx] || 'Angle'}`}
                  className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105 cursor-pointer"
                  onClick={() => setLightboxImageIdx(selectedImageIdx)}
                />

                {/* Subtle Luxury Gradient Vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/25 pointer-events-none" />

                {/* Top Badges */}
                <div className="absolute top-4 left-4 flex flex-wrap gap-2 z-10">
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-black/75 text-white backdrop-blur-md border border-white/20 shadow-md">
                    {choli.sku}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#DFBD76] text-[#041A17] shadow-md">
                    {choli.category}
                  </span>
                </div>

                {/* Photo Angle Counter & Description Badge */}
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold bg-black/70 text-[#DFBD76] backdrop-blur-md border border-[#DFBD76]/30 shadow-md flex items-center gap-1.5">
                  <Images className="w-3.5 h-3.5 text-[#DFBD76]" />
                  <span>{selectedImageIdx + 1} / {safeImages.length}</span>
                </div>

                {/* Bottom Active Angle Name */}
                <div className="absolute bottom-4 left-4 right-16 z-10 text-white">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#DFBD76] block">
                    Current Angle View
                  </span>
                  <p className="font-serif font-bold text-sm sm:text-base drop-shadow-md truncate">
                    {ANGLE_LABELS[selectedImageIdx] || `View Angle ${selectedImageIdx + 1}`}
                  </p>
                </div>

                {/* Fullscreen Zoom Lightbox Button */}
                <button
                  onClick={() => setLightboxImageIdx(selectedImageIdx)}
                  className="absolute bottom-4 right-4 p-2.5 rounded-full bg-black/60 hover:bg-[#084C42] text-white backdrop-blur-md border border-white/20 transition-all active:scale-95 shadow-lg"
                  title="Open Fullscreen Lightbox"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>

                {/* Previous / Next Arrow Controls */}
                {safeImages.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePrevImage();
                      }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-all backdrop-blur-md shadow-md active:scale-90"
                      title="Previous Photo"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNextImage();
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-all backdrop-blur-md shadow-md active:scale-90"
                      title="Next Photo"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Micro-Thumbnail Strip Below Main Photo */}
            {safeImages.length > 1 && (
              <div className="flex items-center gap-2.5 overflow-x-auto pb-1 custom-scrollbar">
                {safeImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIdx(idx)}
                    className={`relative w-20 h-24 rounded-2xl overflow-hidden border-2 flex-shrink-0 transition-all shadow-sm ${
                      selectedImageIdx === idx
                        ? 'border-[#084C42] dark:border-[#DFBD76] ring-2 ring-[#DFBD76]/50 scale-105 opacity-100'
                        : 'border-[#EADFC9] dark:border-[#1A3E38] opacity-60 hover:opacity-100 hover:border-[#DFBD76]'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-black/75 text-white">
                      #{idx + 1}
                    </span>
                  </button>
                ))}
              </div>
            )}

          </div>

          {/* Right Column: Choli Details & Rent Info (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Title & Metadata Card */}
            <div className="bg-white dark:bg-[#072622] p-5 sm:p-6 rounded-3xl border border-[#EADFC9] dark:border-[#1A3E38] shadow-sm space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#084C42]/10 dark:bg-[#DFBD76]/15 text-[#084C42] dark:text-[#DFBD76]">
                  ✨ Authentic Designer Atelier
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      const url = choli.instagramUrl || APP_CONFIG.DEFAULT_INSTAGRAM_PROFILE;
                      navigator.clipboard?.writeText(url);
                      toast.success('Instagram post URL copied to clipboard!', { description: url });
                    }}
                    className="p-1.5 rounded-xl border border-[#EADFC9] dark:border-[#1A3E38] hover:border-pink-500 bg-[#FAF8F5] dark:bg-[#041A17] text-pink-600 dark:text-pink-400 transition-colors flex items-center justify-center"
                    title="Copy Instagram Post / Reel URL"
                  >
                    <InstagramIcon sx={{ fontSize: 16 }} />
                  </button>
                  <button
                    onClick={handleShare}
                    className="p-1.5 rounded-xl border border-[#EADFC9] dark:border-[#1A3E38] hover:bg-[#FAF8F5] dark:hover:bg-[#041A17] text-stone-500 hover:text-[#084C42] dark:hover:text-[#DFBD76] transition-colors"
                    title="Share outfit link"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1C1917] dark:text-[#FAF6EC] leading-tight">
                {choli.name}
              </h1>

              <p className="text-xs text-[#78716C] dark:text-[#9BB5AF] leading-relaxed">
                {choli.description}
              </p>

              {/* Choli Specifications Grid */}
              <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-[#EADFC9]/60 dark:border-[#1A3E38]">
                <div className="p-2.5 rounded-2xl bg-[#FAF8F5] dark:bg-[#041A17] border border-[#EADFC9]/70 dark:border-[#1A3E38]">
                  <span className="text-[10px] uppercase font-bold text-[#78716C] dark:text-[#9BB5AF] block">
                    Color & Palette
                  </span>
                  <span className="font-bold text-xs text-[#1C1917] dark:text-[#FAF6EC]">
                    {choli.color}
                  </span>
                </div>

                <div className="p-2.5 rounded-2xl bg-[#FAF8F5] dark:bg-[#041A17] border border-[#EADFC9]/70 dark:border-[#1A3E38]">
                  <span className="text-[10px] uppercase font-bold text-[#78716C] dark:text-[#9BB5AF] block">
                    Fabric & Craft
                  </span>
                  <span className="font-bold text-xs text-[#1C1917] dark:text-[#FAF6EC] truncate block">
                    {choli.fabric}
                  </span>
                </div>

                <div className="p-2.5 rounded-2xl bg-[#FAF8F5] dark:bg-[#041A17] border border-[#EADFC9]/70 dark:border-[#1A3E38]">
                  <span className="text-[10px] uppercase font-bold text-[#78716C] dark:text-[#9BB5AF] block">
                    Blouse Sizing
                  </span>
                  <span className="font-bold text-xs text-[#084C42] dark:text-[#DFBD76]">
                    {choli.blouseSize}
                  </span>
                </div>

                <div className="p-2.5 rounded-2xl bg-[#FAF8F5] dark:bg-[#041A17] border border-[#EADFC9]/70 dark:border-[#1A3E38]">
                  <span className="text-[10px] uppercase font-bold text-[#78716C] dark:text-[#9BB5AF] block">
                    Skirt Flare Length
                  </span>
                  <span className="font-bold text-xs text-[#1C1917] dark:text-[#FAF6EC]">
                    {choli.skirtLength} inches
                  </span>
                </div>
              </div>

              {/* Turnaround Guidelines */}
              <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-[#DFBD76]/15 border border-[#DFBD76]/40 text-xs text-[#084C42] dark:text-[#DFBD76]">
                <Scissors className="w-4 h-4 flex-shrink-0" />
                <span className="text-[11px] font-medium">
                  Custom in-house alteration available • ±{choli.bufferDaysBefore}/{choli.bufferDaysAfter} days turnaround buffer
                </span>
              </div>
            </div>

            {/* Rent Information & Pricing Box */}
            <div className="bg-gradient-to-br from-white via-[#FAF8F5] to-white dark:from-[#072622] dark:via-[#041A17] dark:to-[#072622] p-5 sm:p-6 rounded-3xl border-2 border-[#DFBD76] shadow-md space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#EADFC9] dark:border-[#1A3E38]">
                <span className="text-xs font-bold uppercase tracking-wider text-[#084C42] dark:text-[#DFBD76]">
                  💎 Rental Tariff & Terms
                </span>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                  Standard 3-Day Event Window
                </span>
              </div>

              {/* Rates Breakdown */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-white dark:bg-[#072622] border border-[#EADFC9] dark:border-[#1A3E38]">
                  <span className="text-[10px] text-[#78716C] dark:text-[#9BB5AF] block uppercase font-semibold">
                    Rental Price
                  </span>
                  <div className="font-serif font-bold text-2xl text-[#084C42] dark:text-[#DFBD76]">
                    ₹{(choli.rentalPricePerEvent ?? 0).toLocaleString('en-IN')}
                  </div>
                  <span className="text-[10px] text-[#78716C] dark:text-[#9BB5AF] block">Full 3 days access</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white dark:bg-[#072622] border border-[#EADFC9] dark:border-[#1A3E38]">
                  <span className="text-[10px] text-[#78716C] dark:text-[#9BB5AF] block uppercase font-semibold">
                    Security Deposit
                  </span>
                  <div className="font-serif font-bold text-2xl text-[#1C1917] dark:text-[#FAF6EC]">
                    ₹{(choli.securityDeposit ?? 0).toLocaleString('en-IN')}
                  </div>
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold block">
                    100% Refundable
                  </span>
                </div>
              </div>

              {(choli.dryCleaningFee ?? 0) > 0 && (
                <div className="flex items-center justify-between text-xs px-1 text-[#78716C] dark:text-[#9BB5AF]">
                  <span>Professional Dry Cleaning & Sanitization:</span>
                  <strong className="text-[#1C1917] dark:text-[#FAF6EC]">₹{(choli.dryCleaningFee ?? 0).toLocaleString('en-IN')}</strong>
                </div>
              )}

              {/* Instant Real-Time Date Availability Checker (MUI DatePicker) */}
              <div className="pt-2 space-y-2 border-t border-[#EADFC9]/60 dark:border-[#1A3E38]">
                <label className="font-bold text-xs text-[#1C1917] dark:text-[#FAF6EC] flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <CalendarIcon className="w-3.5 h-3.5 text-[#DFBD76]" />
                    <span>Check Date Availability:</span>
                  </span>
                  {checkEventDate && (
                    <button
                      onClick={() => setCheckEventDate('')}
                      className="text-[10px] text-[#78716C] underline hover:text-[#084C42] dark:hover:text-[#DFBD76]"
                    >
                      Clear
                    </button>
                  )}
                </label>

                <div className="rounded-2xl bg-white dark:bg-[#0A2E28] border border-[#DFBD76] p-1.5 shadow-sm">
                  <DatePicker
                    value={checkEventDate ? dayjs(checkEventDate) : null}
                    onChange={(newValue: Dayjs | null) => {
                      setCheckEventDate(newValue && newValue.isValid() ? newValue.format('YYYY-MM-DD') : '');
                    }}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: 'small',
                        variant: 'standard',
                        slotProps: {
                          input: { disableUnderline: true },
                          htmlInput: { placeholder: 'Select Event Date' },
                        },
                        sx: {
                          px: 1,
                          '& .MuiInputBase-input': {
                            fontSize: '0.8125rem',
                            fontWeight: 700,
                            color: isDark ? '#DFBD76' : '#084C42',
                          },
                        },
                      },
                      popper: {
                        sx: { zIndex: 9999 },
                      },
                    }}
                  />
                </div>

                {checkEventDate && (
                  <div>
                    {!conflictingBooking ? (
                      <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2 font-semibold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span>100% Available on {new Date(checkEventDate).toDateString()}! Ready to reserve.</span>
                      </div>
                    ) : (
                      <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-300 dark:border-red-800 text-red-800 dark:text-red-300 text-xs flex items-center gap-2 font-semibold">
                        <XCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                        <span>Already booked on {new Date(checkEventDate).toDateString()}. Please pick another date!</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons (Converted to MUI Buttons) */}
              <div className="space-y-2.5 pt-2">
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  onClick={handleBookOutfit}
                  startIcon={<Sparkles style={{ width: 17, height: 17, color: '#DFBD76' }} />}
                  sx={{
                    borderRadius: '16px',
                    py: 1.5,
                    fontSize: '0.875rem',
                    fontWeight: 800,
                    letterSpacing: '0.01em',
                    boxShadow: '0 4px 16px rgba(8, 76, 66, 0.35)',
                  }}
                >
                  Book / Reserve This Choli
                </Button>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outlined"
                    onClick={handleWhatsAppInquiry}
                    startIcon={<MessageCircle style={{ width: 15, height: 15, color: '#15803D' }} />}
                    sx={{
                      borderRadius: '14px',
                      py: 1,
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      borderColor: isDark ? '#1A3E38' : '#EADFC9',
                      color: isDark ? '#4ADE80' : '#15803D',
                      bgcolor: isDark ? '#072622' : '#FAF8F5',
                      '&:hover': {
                        borderColor: '#15803D',
                        bgcolor: isDark ? '#0A2E28' : 'rgba(21, 128, 61, 0.08)',
                      },
                    }}
                  >
                    WhatsApp
                  </Button>

                  <Button
                    variant="outlined"
                    onClick={() => setIsQrModalOpen(true)}
                    startIcon={<QrCode style={{ width: 15, height: 15, color: '#DFBD76' }} />}
                    sx={{
                      borderRadius: '14px',
                      py: 1,
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      borderColor: isDark ? '#1A3E38' : '#EADFC9',
                      color: isDark ? '#DFBD76' : '#084C42',
                      bgcolor: isDark ? '#072622' : '#FAF8F5',
                      '&:hover': {
                        borderColor: '#DFBD76',
                        bgcolor: isDark ? '#0A2E28' : 'rgba(223, 189, 118, 0.08)',
                      },
                    }}
                  >
                    Choli QR
                  </Button>
                </div>

                {/* Dedicated Copy Instagram Post URL Button */}
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => {
                    const url = choli.instagramUrl || APP_CONFIG.DEFAULT_INSTAGRAM_PROFILE;
                    navigator.clipboard?.writeText(url);
                    toast.success('Instagram post URL copied to clipboard!', { description: url });
                  }}
                  startIcon={<InstagramIcon sx={{ fontSize: 18, color: '#E1306C' }} />}
                  sx={{
                    borderRadius: '14px',
                    py: 1.1,
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    borderColor: 'rgba(225, 48, 108, 0.35)',
                    color: isDark ? '#F472B6' : '#E1306C',
                    bgcolor: isDark ? '#072622' : '#FAF8F5',
                    '&:hover': {
                      borderColor: '#E1306C',
                      bgcolor: 'rgba(225, 48, 108, 0.08)',
                    },
                  }}
                >
                  Copy Instagram Post URL
                </Button>
              </div>

            </div>

          </div>

        </div>

        {/* PROMINENT DEDICATED SECTION: ALL PHOTOS OF THIS CHOLI */}
        <section className="bg-white dark:bg-[#072622] p-5 sm:p-8 rounded-3xl border border-[#EADFC9] dark:border-[#1A3E38] shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#EADFC9]/60 dark:border-[#1A3E38]">
            <div>
              <div className="flex items-center gap-2">
                <Images className="w-5 h-5 text-[#084C42] dark:text-[#DFBD76]" />
                <h2 className="font-serif font-bold text-lg sm:text-xl text-[#1C1917] dark:text-[#FAF6EC]">
                  All Photos & Angles ({safeImages.length} High-Resolution Shots)
                </h2>
              </div>
              <p className="text-xs text-[#78716C] dark:text-[#9BB5AF] mt-0.5">
                Every craftsmanship angle of {choli.name} captured in ultra-detail. Tap any photo to enlarge in full screen.
              </p>
            </div>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#DFBD76]/15 text-[#084C42] dark:text-[#DFBD76] border border-[#DFBD76]/30 self-start sm:self-auto">
              <ZoomIn className="w-3.5 h-3.5" />
              <span>Click photo to expand</span>
            </span>
          </div>

          {/* Grid of ALL Choli Photos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {safeImages.map((img, idx) => {
              const isSelected = selectedImageIdx === idx;
              const label = ANGLE_LABELS[idx] || `Angle ${idx + 1}`;

              return (
                <div
                  key={idx}
                  onClick={() => {
                    setSelectedImageIdx(idx);
                    setLightboxImageIdx(idx);
                  }}
                  className={`group relative rounded-3xl overflow-hidden border-2 cursor-pointer transition-all duration-300 bg-[#FAF8F5] dark:bg-[#041A17] shadow-sm hover:shadow-xl ${
                    isSelected
                      ? 'border-[#084C42] dark:border-[#DFBD76] ring-2 ring-[#DFBD76]/50'
                      : 'border-[#EADFC9] dark:border-[#1A3E38] hover:border-[#DFBD76]'
                  }`}
                >
                  {/* Photo Container */}
                  <div className="aspect-[3/4] w-full overflow-hidden relative">
                    <img
                      src={img}
                      alt={`${choli.name} - ${label}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                    {/* Angle Number Badge */}
                    <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-black/70 text-white backdrop-blur-md border border-white/20">
                      Shot #{idx + 1}
                    </div>

                    {/* Expand Icon */}
                    <div className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                      <Maximize2 className="w-3.5 h-3.5" />
                    </div>

                    {/* Bottom Caption & Label */}
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <span className="text-[10px] uppercase font-bold text-[#DFBD76] block tracking-wider">
                        Angle {idx + 1}
                      </span>
                      <p className="font-serif font-bold text-xs sm:text-sm drop-shadow-sm leading-tight">
                        {label}
                      </p>
                    </div>
                  </div>

                  {/* Quick Select Bar */}
                  <div className="p-2.5 flex items-center justify-between text-xs bg-white dark:bg-[#041A17] border-t border-[#EADFC9]/60 dark:border-[#1A3E38]">
                    <span className="text-[11px] text-[#78716C] dark:text-[#9BB5AF]">
                      {isSelected ? '✨ Active View' : 'Tap to View'}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImageIdx(idx);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="text-[11px] font-bold text-[#084C42] dark:text-[#DFBD76] hover:underline"
                    >
                      Set as Hero ↑
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

      </main>

      {/* QR Code Modal for Printing Hang-Tag */}
      {isQrModalOpen && (
        <CholiQrModal
          choli={choli}
          isOpen={isQrModalOpen}
          onClose={() => setIsQrModalOpen(false)}
        />
      )}

      {/* Interactive Multi-Photo Fullscreen Lightbox */}
      {lightboxImageIdx !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col justify-between p-4 sm:p-6 select-none animate-in fade-in duration-200"
          onClick={() => setLightboxImageIdx(null)}
        >
          {/* Top Bar inside Lightbox */}
          <div 
            className="flex items-center justify-between text-white max-w-6xl w-full mx-auto pb-3 border-b border-white/10 z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#DFBD76] text-[#041A17]">
                  {choli.sku}
                </span>
                <h3 className="font-serif font-bold text-sm sm:text-base text-white truncate max-w-xs sm:max-w-md">
                  {choli.name}
                </h3>
              </div>
              <span className="text-xs text-white/70">
                {ANGLE_LABELS[lightboxImageIdx] || 'Angle'} • Shot {lightboxImageIdx + 1} of {safeImages.length}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="hidden sm:inline text-xs text-white/50">
                Use ← / → keys to navigate • ESC to close
              </span>
              <button
                onClick={() => setLightboxImageIdx(null)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors"
                title="Close Fullscreen View (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Center Main High-Res Lightbox Image */}
          <div 
            className="relative flex-1 flex items-center justify-center py-2 max-w-5xl w-full mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={safeImages[lightboxImageIdx]}
              alt={`${choli.name} Fullscreen Shot ${lightboxImageIdx + 1}`}
              className="max-h-[75vh] max-w-full rounded-2xl object-contain shadow-2xl border border-white/10"
            />

            {/* Left & Right Lightbox Arrows */}
            {safeImages.length > 1 && (
              <>
                <button
                  onClick={() => setLightboxImageIdx((prev) => (prev === null ? 0 : (prev === 0 ? safeImages.length - 1 : prev - 1)))}
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 hover:bg-[#084C42] border border-white/20 text-white flex items-center justify-center transition-all shadow-xl active:scale-95"
                  title="Previous Angle"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={() => setLightboxImageIdx((prev) => (prev === null ? 0 : (prev + 1) % safeImages.length))}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 hover:bg-[#084C42] border border-white/20 text-white flex items-center justify-center transition-all shadow-xl active:scale-95"
                  title="Next Angle"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          {/* Bottom Thumbnails Strip in Lightbox */}
          {safeImages.length > 1 && (
            <div 
              className="max-w-xl mx-auto w-full flex items-center justify-center gap-2 overflow-x-auto pt-2 z-10"
              onClick={(e) => e.stopPropagation()}
            >
              {safeImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setLightboxImageIdx(idx)}
                  className={`w-14 h-16 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                    lightboxImageIdx === idx
                      ? 'border-[#DFBD76] scale-110 shadow-lg shadow-[#DFBD76]/30'
                      : 'border-white/20 opacity-50 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Floating Global Modals */}
      <BookingModal />
      <AuthModal />

    </div>
  );
}
