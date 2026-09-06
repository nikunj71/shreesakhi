'use client';

import React from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { openAuthModal } from '@/store/authSlice';
import { 
  ShoppingBag, 
  Calendar as CalendarIcon, 
  ClipboardList, 
  BarChart3, 
  PlusCircle, 
  Table, 
  LayoutGrid,
  Lock
} from 'lucide-react';

interface BottomNavProps {
  activeTab: 'showroom' | 'calendar' | 'analytics' | 'bookings' | 'inventory';
  setActiveTab: (tab: 'showroom' | 'calendar' | 'analytics' | 'bookings' | 'inventory') => void;
  onOpenAddModal: () => void;
}

export function BottomNav({ activeTab, setActiveTab, onOpenAddModal }: BottomNavProps) {
  const dispatch = useAppDispatch();
  const { currentUser } = useAppSelector((state) => state.auth);
  const cholis = useAppSelector((state) => state.cholis.items);
  const bookings = useAppSelector((state) => state.bookings.items);

  const isAdmin = currentUser?.role === 'ADMIN';
  const isStaff = currentUser?.role === 'STAFF';

  return (
    <nav 
      aria-label="Mobile Bottom Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#FAF8F5]/95 dark:bg-[#072622]/95 border-t border-[#EADFC9] dark:border-[#1A3E38] backdrop-blur-xl shadow-2xl px-1.5 py-1 transition-colors"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        
        {/* ADMIN BOTTOM NAVIGATION: 6 Items */}
        {isAdmin && (
          <>
            {/* Mode 1: Table View */}
            <button
              onClick={() => setActiveTab('inventory')}
              className={`flex flex-col items-center py-1 px-2 rounded-xl transition-all ${
                activeTab === 'inventory'
                  ? 'text-[#084C42] dark:text-[#DFBD76] font-bold'
                  : 'text-[#78716C] dark:text-[#9BB5AF] hover:text-[#084C42]'
              }`}
            >
              <Table className="w-5 h-5" />
              <span className="text-[10px] mt-0.5 leading-none">Table</span>
            </button>

            {/* Mode 2: Card View */}
            <button
              onClick={() => setActiveTab('showroom')}
              className={`flex flex-col items-center py-1 px-2 rounded-xl transition-all ${
                activeTab === 'showroom'
                  ? 'text-[#084C42] dark:text-[#DFBD76] font-bold'
                  : 'text-[#78716C] dark:text-[#9BB5AF] hover:text-[#084C42]'
              }`}
            >
              <LayoutGrid className="w-5 h-5" />
              <span className="text-[10px] mt-0.5 leading-none">Cards</span>
            </button>

            {/* Calendar */}
            <button
              onClick={() => setActiveTab('calendar')}
              className={`flex flex-col items-center py-1 px-2 rounded-xl transition-all ${
                activeTab === 'calendar'
                  ? 'text-[#084C42] dark:text-[#DFBD76] font-bold'
                  : 'text-[#78716C] dark:text-[#9BB5AF] hover:text-[#084C42]'
              }`}
            >
              <CalendarIcon className="w-5 h-5" />
              <span className="text-[10px] mt-0.5 leading-none">Calendar</span>
            </button>

            {/* Floating Action Button: Add Outfit */}
            <button
              onClick={onOpenAddModal}
              className="flex flex-col items-center justify-center -mt-4 active:scale-95 transition-transform"
              title="Catalog New Choli"
            >
              <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#084C42] via-[#0D6357] to-[#DFBD76] flex items-center justify-center text-[#FAF6EC] shadow-lg shadow-[#084C42]/40 border-2 border-[#FAF8F5] dark:border-[#072622]">
                <PlusCircle className="w-6 h-6 text-[#FAF6EC]" />
              </div>
              <span className="text-[9px] mt-0.5 font-bold text-[#084C42] dark:text-[#DFBD76]">Add</span>
            </button>

            {/* Bookings */}
            <button
              onClick={() => setActiveTab('bookings')}
              className={`flex flex-col items-center py-1 px-2 rounded-xl transition-all relative ${
                activeTab === 'bookings'
                  ? 'text-[#084C42] dark:text-[#DFBD76] font-bold'
                  : 'text-[#78716C] dark:text-[#9BB5AF] hover:text-[#084C42]'
              }`}
            >
              <ClipboardList className="w-5 h-5" />
              <span className="text-[10px] mt-0.5 leading-none">Bookings</span>
              {bookings.length > 0 && (
                <span className="absolute top-0 right-1 w-2 h-2 rounded-full bg-[#DFBD76]" />
              )}
            </button>

            {/* ROI & Analytics */}
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex flex-col items-center py-1 px-2 rounded-xl transition-all ${
                activeTab === 'analytics'
                  ? 'text-[#084C42] dark:text-[#DFBD76] font-bold'
                  : 'text-[#78716C] dark:text-[#9BB5AF] hover:text-[#084C42]'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              <span className="text-[10px] mt-0.5 leading-none">Analytics</span>
            </button>
          </>
        )}

        {/* STAFF BOTTOM NAVIGATION */}
        {isStaff && (
          <>
            <button
              onClick={() => setActiveTab('showroom')}
              className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all ${
                activeTab === 'showroom'
                  ? 'text-[#084C42] dark:text-[#DFBD76] font-bold'
                  : 'text-[#78716C] dark:text-[#9BB5AF]'
              }`}
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="text-[10px] mt-0.5 font-medium">Showroom</span>
            </button>

            <button
              onClick={() => setActiveTab('calendar')}
              className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all ${
                activeTab === 'calendar'
                  ? 'text-[#084C42] dark:text-[#DFBD76] font-bold'
                  : 'text-[#78716C] dark:text-[#9BB5AF]'
              }`}
            >
              <CalendarIcon className="w-5 h-5" />
              <span className="text-[10px] mt-0.5 font-medium">Calendar</span>
            </button>

            <button
              onClick={() => setActiveTab('bookings')}
              className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all ${
                activeTab === 'bookings'
                  ? 'text-[#084C42] dark:text-[#DFBD76] font-bold'
                  : 'text-[#78716C] dark:text-[#9BB5AF]'
              }`}
            >
              <ClipboardList className="w-5 h-5" />
              <span className="text-[10px] mt-0.5 font-medium">Bookings</span>
            </button>
          </>
        )}

        {/* PUBLIC GUEST / CLIENT BOTTOM NAVIGATION (WITHOUT LOGIN: ONLY SHOWROOM & LOGIN) */}
        {!currentUser && (
          <div className="flex items-center justify-center gap-6 py-1 w-full">
            <button
              onClick={() => setActiveTab('showroom')}
              className={`flex items-center gap-2 py-2 px-6 rounded-full transition-all ${
                activeTab === 'showroom'
                  ? 'bg-[#084C42] text-[#FAF6EC] font-bold shadow-md shadow-[#084C42]/30 border border-[#DFBD76]'
                  : 'text-[#78716C] dark:text-[#9BB5AF]'
              }`}
            >
              <ShoppingBag className="w-4 h-4 text-[#DFBD76]" />
              <span className="text-xs font-bold">Showroom</span>
            </button>

            <button
              onClick={() => dispatch(openAuthModal())}
              className="flex items-center gap-2 py-2 px-6 rounded-full bg-gradient-to-r from-[#084C42] to-[#0D6357] text-[#FAF6EC] border border-[#DFBD76]/50 shadow-md transition-all active:scale-95 font-bold text-xs"
            >
              <Lock className="w-4 h-4 text-[#DFBD76]" />
              <span>Sign In</span>
            </button>
          </div>
        )}

      </div>
    </nav>
  );
}
