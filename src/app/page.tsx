'use client';

import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { toggleTheme, logoutUser, openAuthModal } from '@/store/authSlice';
import { fetchCholis } from '@/store/choliSlice';
import { fetchBookings } from '@/store/bookingSlice';
import { Navbar } from '@/components/layout/Navbar';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { MobileHeader } from '@/components/layout/MobileHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { AdminCholiTable } from '@/components/admin/AdminCholiTable';
import { ShowroomGallery } from '@/components/showroom/ShowroomGallery';
import { BookingCalendar } from '@/components/calendar/BookingCalendar';
import { BookingsList } from '@/components/booking/BookingsList';
import { AnalyticsDashboard } from '@/components/admin/AnalyticsDashboard';
import { BookingModal } from '@/components/booking/BookingModal';
import { AddCholiModal } from '@/components/admin/AddCholiModal';
import { AuthModal } from '@/components/auth/AuthModal';
import { ConfirmationModal } from '@/components/common/ConfirmationModal';
import { BoutiquePageLoader } from '@/components/common/BoutiqueLoader';
import { Heart, Sun, Moon, LogOut, User as UserIcon, ChevronDown, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

export default function Home() {
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState<'showroom' | 'calendar' | 'analytics' | 'bookings' | 'inventory'>('showroom');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [calendarTargetCholi, setCalendarTargetCholi] = useState<string | null>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { currentUser, theme } = useAppSelector((state) => state.auth);
  const isAdmin = currentUser?.role === 'ADMIN';

  // Load real inventory and bookings directly from MongoDB
  useEffect(() => {
    dispatch(fetchCholis(currentUser?.role || 'GUEST'));
    dispatch(fetchBookings());
  }, [dispatch, currentUser?.role]);

  // Automatically default Admin to the Inventory table view upon login
  useEffect(() => {
    if (isAdmin && activeTab === 'showroom') {
      setActiveTab('inventory');
    } else if (!isAdmin && activeTab === 'inventory') {
      setActiveTab('showroom');
    }
  }, [isAdmin]);

  // Ensure unauthenticated users are strictly locked to showroom
  useEffect(() => {
    if (!currentUser && activeTab !== 'showroom') {
      setActiveTab('showroom');
    }
  }, [currentUser, activeTab]);

  const handleCheckCalendar = (choliId: string) => {
    if (!currentUser) {
      dispatch(openAuthModal());
      return;
    }
    setCalendarTargetCholi(choliId);
    setActiveTab('calendar');
  };

  // Show luxury boutique loader until client hydration completes
  if (!mounted) {
    return <BoutiquePageLoader message="Opening Shree Sakhi Choli Vault..." />;
  }

  // RENDER FOR ADMIN (DESKTOP SIDEBAR WHEN LAPTOP MODE + ALL BOTTOM OPTIONS IN MOBILE VIEW)
  if (isAdmin) {
    return (
      <div className="flex min-h-screen bg-[#FAF8F5] dark:bg-[#041A17] text-[#1C1917] dark:text-[#F5F5F7] transition-colors">
        {/* Left Desktop Sidebar: strictly for laptop/desktop mode (md:flex) */}
        <AdminSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenAddModal={() => setIsAddModalOpen(true)}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 min-h-screen">
          {/* Mobile Header: strictly for mobile view (md:hidden) */}
          <MobileHeader />

          {/* Desktop Top Navbar for Admin Workspace */}
          <header className="hidden md:flex items-center justify-between px-6 lg:px-8 py-3.5 border-b border-[#EADFC9] dark:border-[#1A3E38] bg-white/80 dark:bg-[#072622]/80 backdrop-blur-md sticky top-0 z-30 transition-colors">
            {/* Left: Active Module Breadcrumb */}
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-serif font-bold text-[#084C42] dark:text-[#DFBD76] tracking-wide uppercase">
                {activeTab === 'inventory' && '📋 Choli Inventory & Master Register'}
                {activeTab === 'showroom' && '🎴 Shree Sakhi Choli Collection'}
                {activeTab === 'calendar' && '📅 Rental Booking & Availability Calendar'}
                {activeTab === 'bookings' && '📑 Customer Booking & Order Register'}
                {activeTab === 'analytics' && '📊 Financial ROI & Cost Recovery Analytics'}
              </span>
            </div>

            {/* Right: Quick Action Controls + Logged In User Details */}
            <div className="flex items-center gap-3">
              {/* Theme Switcher */}
              <button
                onClick={() => dispatch(toggleTheme())}
                className="p-2 rounded-full border border-[#EADFC9] dark:border-[#1A3E38] hover:bg-[#FAF8F5] dark:hover:bg-[#0A2E28] text-[#1C1917] dark:text-[#DFBD76] transition-all"
                title="Toggle Theme"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              {/* Logged-In User Details Card with Dropdown & Logout */}
              <div className="relative pl-3 border-l border-[#EADFC9] dark:border-[#1A3E38]">
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2.5 p-1 rounded-2xl hover:bg-[#FAF8F5] dark:hover:bg-[#0A2E28] transition-all text-left cursor-pointer"
                  title="Click for Profile & Logout options"
                >
                  <div className="w-8 h-8 rounded-full bg-[#084C42] border-2 border-[#DFBD76] flex items-center justify-center text-[#DFBD76] font-bold font-serif text-xs shadow-sm flex-shrink-0">
                    A
                  </div>
                  <div className="text-left hidden lg:block">
                    <span className="block text-xs font-bold text-[#1C1917] dark:text-[#FAF6EC] leading-tight">
                      {currentUser?.name || 'Boutique Owner'}
                    </span>
                    <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-[#DFBD76]/20 text-[#DFBD76] border border-[#DFBD76]/40 leading-none">
                      👑 Boutique Admin
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-[#DFBD76]" />
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-12 z-50 w-64 rounded-2xl bg-white dark:bg-[#072622] border border-[#DFBD76]/40 p-3.5 shadow-2xl space-y-3 text-left animate-in fade-in zoom-in-95 duration-150">
                      <div className="flex items-center gap-2.5 pb-2.5 border-b border-[#EADFC9]/70 dark:border-white/10">
                        <div className="w-10 h-10 rounded-full bg-[#084C42] border-2 border-[#DFBD76] flex items-center justify-center text-[#DFBD76] font-bold font-serif text-sm flex-shrink-0">
                          A
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-xs text-[#1C1917] dark:text-[#FAF6EC] truncate">
                            {currentUser?.name || 'Boutique Owner'}
                          </p>
                          <p className="text-[10px] text-[#78716C] dark:text-[#9BB5AF] truncate">
                            {currentUser?.email || 'admin@shreesakhi.com'}
                          </p>
                          <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#DFBD76]/20 text-[#084C42] dark:text-[#DFBD76] border border-[#DFBD76]/40">
                            👑 Boutique Admin
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            dispatch(openAuthModal());
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-[#1C1917] dark:text-stone-200 hover:bg-[#FAF8F5] dark:hover:bg-white/10 transition-colors"
                        >
                          <UserIcon className="w-3.5 h-3.5 text-[#DFBD76]" />
                          <span>Switch / Manage Profile</span>
                        </button>

                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            setIsLogoutModalOpen(true);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </header>

          {/* Main Content Viewport with mobile bottom bar padding */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 pb-24 md:pb-8">
            {activeTab === 'inventory' && (
              <AdminCholiTable 
                onCheckCalendar={handleCheckCalendar}
                onOpenAddModal={() => setIsAddModalOpen(true)}
                onSwitchToShowroom={() => setActiveTab('showroom')}
              />
            )}

            {activeTab === 'showroom' && (
              <ShowroomGallery 
                onCheckCalendar={handleCheckCalendar}
                onSwitchToTable={() => setActiveTab('inventory')}
                onOpenAddModal={() => setIsAddModalOpen(true)}
              />
            )}

            {activeTab === 'calendar' && (
              <BookingCalendar initialCholiFilter={calendarTargetCholi} />
            )}

            {activeTab === 'bookings' && (
              <BookingsList />
            )}

            {activeTab === 'analytics' && (
              <AnalyticsDashboard />
            )}
          </main>

          {/* Luxury Admin Footer (Desktop only) */}
          <footer className="hidden md:block border-t border-[#EADFC9] dark:border-[#1A3E38] bg-[#FAF8F5]/80 dark:bg-[#072622]/80 py-4 transition-colors">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-xs text-[#78716C] dark:text-[#9BB5AF]">
              <span className="font-serif font-bold text-xs text-[#084C42] dark:text-[#DFBD76]">
                श्री SAKHI BOUTIQUE • Admin Control Center
              </span>
              <span>Confidential Capital Costing & Break-Even Tracking Active</span>
            </div>
          </footer>
        </div>

        {/* Mobile View Bottom Navigation Bar: all options like earlier */}
        <BottomNav
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenAddModal={() => setIsAddModalOpen(true)}
        />

        {/* Floating Modals */}
        <BookingModal />
        <AddCholiModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
        />
        <AuthModal />
        <ConfirmationModal
          isOpen={isLogoutModalOpen}
          onClose={() => setIsLogoutModalOpen(false)}
          onConfirm={() => {
            setIsLogoutModalOpen(false);
            dispatch(logoutUser());
            setActiveTab('showroom');
            toast.success('Signed out successfully.');
          }}
          type="warning"
          title="Sign Out Confirmation"
          description={`Are you sure you want to sign out from the boutique management suite as ${currentUser?.name || 'Boutique Owner'}?`}
          confirmText="Yes, Sign Out"
          cancelText="Cancel"
        />
      </div>
    );
  }

  // RENDER FOR VISITORS & STAFF (TOP NAVBAR IN LAPTOP MODE + ALL BOTTOM OPTIONS IN MOBILE VIEW)
  return (
    <div className="flex flex-col min-h-screen bg-[#FAF8F5] dark:bg-[#041A17] text-[#1C1917] dark:text-[#F5F5F7] transition-colors">
      {/* Top Navbar (Desktop Only: md:block) */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddModal={() => setIsAddModalOpen(true)}
      />

      {/* Mobile Header: strictly for mobile view (md:hidden) */}
      <MobileHeader />

      {/* Main Content Viewport with mobile bottom bar padding */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 pb-24 md:pb-8">
        {!currentUser || activeTab === 'showroom' ? (
          <ShowroomGallery 
            onCheckCalendar={handleCheckCalendar} 
            onOpenAddModal={() => setIsAddModalOpen(true)} 
          />
        ) : activeTab === 'calendar' ? (
          <BookingCalendar initialCholiFilter={calendarTargetCholi} />
        ) : activeTab === 'bookings' ? (
          <BookingsList />
        ) : activeTab === 'analytics' ? (
          <AnalyticsDashboard />
        ) : (
          <ShowroomGallery 
            onCheckCalendar={handleCheckCalendar} 
            onOpenAddModal={() => setIsAddModalOpen(true)} 
          />
        )}
      </main>

      {/* Mobile View Bottom Navigation Bar: all options like earlier */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddModal={() => setIsAddModalOpen(true)}
      />

      {/* Floating Modals */}
      <BookingModal />
      <AddCholiModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
      <AuthModal />

      {/* Luxury Boutique Footer (Desktop only) */}
      <footer className="hidden md:block border-t border-[#EADFC9] dark:border-[#1A3E38] bg-[#FAF8F5]/80 dark:bg-[#041A17]/80 py-6 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#78716C] dark:text-[#9CA3AF] gap-3">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-sm text-[#084C42] dark:text-[#DFBD76]">
              श्री SAKHI BOUTIQUE
            </span>
            <span>— Royal Ethnic Fashion & Choli Rental Atelier</span>
          </div>
          <div className="flex items-center gap-1">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-[#084C42] fill-[#084C42] dark:text-[#DFBD76] dark:fill-[#DFBD76]" />
            <span>for Luxury Boutique Excellence</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
