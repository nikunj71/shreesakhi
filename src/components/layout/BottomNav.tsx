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

  // If user is not logged in, no navigation tabs or redundant showroom button needed
  if (!currentUser) {
    return null;
  }

  return (
    <nav 
      aria-label="Mobile Bottom Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#FAF8F5]/95 dark:bg-[#072622]/95 border-t border-[#EADFC9] dark:border-[#1A3E38] backdrop-blur-xl shadow-2xl px-1.5 py-1 transition-colors"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        
        {/* ADMIN BOTTOM NAVIGATION: Symmetrical 5-Slot Layout with Add in the exact Center */}
        {isAdmin && (
          <>
            {/* Slot 1: Outfits (Inventory Table / Showroom Cards) */}
            <button
              onClick={() => {
                if (activeTab === 'inventory') setActiveTab('showroom');
                else if (activeTab === 'showroom') setActiveTab('inventory');
                else setActiveTab('inventory');
              }}
              className={`flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition-all ${
                activeTab === 'inventory' || activeTab === 'showroom'
                  ? 'text-[#084C42] dark:text-[#DFBD76] font-bold'
                  : 'text-[#78716C] dark:text-[#9BB5AF] hover:text-[#084C42]'
              }`}
              title={activeTab === 'showroom' ? 'Switch to Inventory Table' : 'Switch to Cards View'}
            >
              {activeTab === 'showroom' ? (
                <LayoutGrid className="w-5 h-5" />
              ) : (
                <Table className="w-5 h-5" />
              )}
              <span className="text-[10px] mt-0.5 leading-none">
                {activeTab === 'showroom' ? 'Cards' : 'Inventory'}
              </span>
            </button>

            {/* Slot 2: Calendar */}
            <button
              onClick={() => setActiveTab('calendar')}
              className={`flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition-all ${
                activeTab === 'calendar'
                  ? 'text-[#084C42] dark:text-[#DFBD76] font-bold'
                  : 'text-[#78716C] dark:text-[#9BB5AF] hover:text-[#084C42]'
              }`}
            >
              <CalendarIcon className="w-5 h-5" />
              <span className="text-[10px] mt-0.5 leading-none">Calendar</span>
            </button>

            {/* Slot 3: DEAD-CENTER FLOATING ACTION BUTTON (Add) */}
            <div className="flex flex-col items-center justify-center flex-1 -mt-5">
              <button
                onClick={onOpenAddModal}
                className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#084C42] via-[#0D6357] to-[#DFBD76] flex items-center justify-center text-[#FAF6EC] shadow-xl shadow-[#084C42]/50 border-2 border-[#FAF8F5] dark:border-[#072622] active:scale-95 transition-transform hover:scale-105"
                title="Catalog New Choli"
                aria-label="Add Choli"
              >
                <PlusCircle className="w-6 h-6 text-[#FAF6EC]" />
              </button>
              <span className="text-[9px] mt-0.5 font-bold text-[#084C42] dark:text-[#DFBD76]">Add</span>
            </div>

            {/* Slot 4: Bookings */}
            <button
              onClick={() => setActiveTab('bookings')}
              className={`flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition-all relative ${
                activeTab === 'bookings'
                  ? 'text-[#084C42] dark:text-[#DFBD76] font-bold'
                  : 'text-[#78716C] dark:text-[#9BB5AF] hover:text-[#084C42]'
              }`}
            >
              <ClipboardList className="w-5 h-5" />
              <span className="text-[10px] mt-0.5 leading-none">Bookings</span>
              {bookings.length > 0 && (
                <span className="absolute top-0 right-3 w-2 h-2 rounded-full bg-[#DFBD76]" />
              )}
            </button>

            {/* Slot 5: Analytics */}
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition-all ${
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

        {/* STAFF BOTTOM NAVIGATION: Symmetrical Layout with Center Add Button */}
        {isStaff && (
          <>
            {/* Slot 1: Showroom Lookbook */}
            <button
              onClick={() => setActiveTab('showroom')}
              className={`flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition-all ${
                activeTab === 'showroom'
                  ? 'text-[#084C42] dark:text-[#DFBD76] font-bold'
                  : 'text-[#78716C] dark:text-[#9BB5AF] hover:text-[#084C42]'
              }`}
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="text-[10px] mt-0.5 leading-none">Showroom</span>
            </button>

            {/* Slot 2: Calendar */}
            <button
              onClick={() => setActiveTab('calendar')}
              className={`flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition-all ${
                activeTab === 'calendar'
                  ? 'text-[#084C42] dark:text-[#DFBD76] font-bold'
                  : 'text-[#78716C] dark:text-[#9BB5AF] hover:text-[#084C42]'
              }`}
            >
              <CalendarIcon className="w-5 h-5" />
              <span className="text-[10px] mt-0.5 leading-none">Calendar</span>
            </button>

            {/* Slot 3: DEAD-CENTER FLOATING ACTION BUTTON (Add) */}
            <div className="flex flex-col items-center justify-center flex-1 -mt-5">
              <button
                onClick={onOpenAddModal}
                className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#084C42] via-[#0D6357] to-[#DFBD76] flex items-center justify-center text-[#FAF6EC] shadow-xl shadow-[#084C42]/50 border-2 border-[#FAF8F5] dark:border-[#072622] active:scale-95 transition-transform hover:scale-105 cursor-pointer"
                title="Staff: Catalog New Choli"
                aria-label="Add Choli"
              >
                <PlusCircle className="w-6 h-6 text-[#FAF6EC]" />
              </button>
              <span className="text-[9px] mt-0.5 font-bold text-[#084C42] dark:text-[#DFBD76]">Add</span>
            </div>

            {/* Slot 4: Bookings */}
            <button
              onClick={() => setActiveTab('bookings')}
              className={`flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition-all relative ${
                activeTab === 'bookings'
                  ? 'text-[#084C42] dark:text-[#DFBD76] font-bold'
                  : 'text-[#78716C] dark:text-[#9BB5AF] hover:text-[#084C42]'
              }`}
            >
              <ClipboardList className="w-5 h-5" />
              <span className="text-[10px] mt-0.5 leading-none">Bookings</span>
              {bookings.length > 0 && (
                <span className="absolute top-0 right-3 w-2 h-2 rounded-full bg-[#DFBD76]" />
              )}
            </button>
          </>
        )}

      </div>
    </nav>
  );
}
