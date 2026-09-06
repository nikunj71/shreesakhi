'use client';

import React from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { toggleTheme, openAuthModal, logoutUser } from '@/store/authSlice';
import { exportBoutiqueDataToExcel } from '@/lib/excelExport';
import { 
  ShoppingBag, 
  Calendar as CalendarIcon, 
  ClipboardList, 
  BarChart3, 
  PlusCircle, 
  FileSpreadsheet, 
  Table, 
  LayoutGrid,
  Moon, 
  Sun, 
  LogOut, 
  User, 
  Layers,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { toast } from 'sonner';

interface AdminSidebarProps {
  activeTab: 'showroom' | 'calendar' | 'analytics' | 'bookings' | 'inventory';
  setActiveTab: (tab: 'showroom' | 'calendar' | 'analytics' | 'bookings' | 'inventory') => void;
  onOpenAddModal: () => void;
}

export function AdminSidebar({ activeTab, setActiveTab, onOpenAddModal }: AdminSidebarProps) {
  const dispatch = useAppDispatch();
  const { currentUser, theme } = useAppSelector((state) => state.auth);
  const cholis = useAppSelector((state) => state.cholis.items);
  const bookings = useAppSelector((state) => state.bookings.items);

  const isDark = theme === 'dark';

  const handleExport = () => {
    exportBoutiqueDataToExcel(bookings, cholis, currentUser?.role);
    toast.success('Excel financial workbook downloaded!');
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    setActiveTab('showroom');
    toast.success('Signed out successfully.');
  };

  const navItems = [
    {
      id: 'inventory' as const,
      label: 'Choli Inventory',
      sublabel: 'Master Vault & Financials',
      icon: Layers,
      badge: `${cholis.length}`,
    },
    {
      id: 'showroom' as const,
      label: 'Showroom Lookbook',
      sublabel: 'Customer Catalog Grid',
      icon: LayoutGrid,
    },
    {
      id: 'calendar' as const,
      label: 'Rental Calendar',
      sublabel: 'Availability & Slots',
      icon: CalendarIcon,
    },
    {
      id: 'bookings' as const,
      label: 'Booking Register',
      sublabel: 'Active & Returned',
      icon: ClipboardList,
      badge: `${bookings.length}`,
    },
    {
      id: 'analytics' as const,
      label: 'ROI & Analytics',
      sublabel: 'Capital Recovery',
      icon: BarChart3,
    },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 lg:w-72 bg-white dark:bg-[#072622] border-r border-[#EADFC9] dark:border-[#1A3E38] h-screen sticky top-0 z-40 transition-colors">
      
      {/* Brand Header */}
      <div className="p-4 lg:p-5 border-b border-[#EADFC9]/70 dark:border-[#1A3E38] bg-[#FAF8F5]/50 dark:bg-[#041A17]/30">
        <div className="w-full h-14 rounded-2xl bg-[#025151] border-2 border-[#DFBD76]/50 p-2 flex items-center justify-center shadow-md">
          <img src="/logo-cropped.png" alt="श्री SAKHI BOUTIQUE" className="h-full w-auto object-contain" />
        </div>
        <div className="flex items-center justify-between mt-2 px-0.5">
          <span className="text-[10px] uppercase tracking-widest text-[#78716C] dark:text-[#9BB5AF] font-bold">
            Admin Workspace
          </span>
          <span className="text-[9px] font-mono font-bold text-[#084C42] dark:text-[#DFBD76] bg-[#DFBD76]/20 px-2 py-0.5 rounded-full border border-[#DFBD76]/30">
            PRO SUITE
          </span>
        </div>
      </div>


      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
        <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-[#78716C] dark:text-[#9BB5AF] mb-2">
          Management Modules
        </p>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-semibold transition-all text-left ${
                isActive
                  ? 'bg-gradient-to-r from-[#084C42] to-[#0D6357] text-[#FAF6EC] shadow-md shadow-[#084C42]/20 font-bold'
                  : 'text-[#1C1917] dark:text-[#E2E8F0] hover:bg-[#FAF8F5] dark:hover:bg-[#0A2E28]'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-[#DFBD76]' : 'text-[#78716C] dark:text-[#9BB5AF]'}`} />
                <div className="min-w-0">
                  <span className="block truncate">{item.label}</span>
                  <span className={`text-[10px] block font-normal truncate ${isActive ? 'text-[#FAF6EC]/80' : 'text-[#78716C] dark:text-[#9BB5AF]'}`}>
                    {item.sublabel}
                  </span>
                </div>
              </div>

              {item.badge && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                  isActive
                    ? 'bg-[#DFBD76] text-[#084C42]'
                    : 'bg-[#FAF8F5] dark:bg-[#1A3E38] text-[#78716C] dark:text-[#DFBD76] border border-[#EADFC9] dark:border-[#1A3E38]'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Quick Actions Header */}
        <div className="pt-4 px-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#78716C] dark:text-[#9CA3AF] mb-2">
            Quick Actions
          </p>
        </div>

        {/* Add New Choli Button */}
        <button
          onClick={onOpenAddModal}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-2xl text-xs font-bold bg-[#DFBD76]/15 hover:bg-[#DFBD76]/25 border border-[#DFBD76]/40 text-[#084C42] dark:text-[#DFBD76] transition-all"
        >
          <PlusCircle className="w-4 h-4 text-[#DFBD76]" />
          <span>Catalog New Choli</span>
        </button>

        {/* Export Excel Button */}
        <button
          onClick={handleExport}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-2xl text-xs font-semibold bg-[#FAF8F5] dark:bg-[#0A2E28] hover:bg-[#EADFC9]/40 dark:hover:bg-[#133D35] border border-[#EADFC9] dark:border-[#1A3E38] text-[#15803D] dark:text-[#22C55E] transition-all"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Export Excel Register</span>
        </button>
      </div>

      {/* Footer Controls */}
      <div className="p-3 border-t border-[#EADFC9]/70 dark:border-[#1A3E38] space-y-2">
        {/* Theme Switcher */}
        <button
          onClick={() => dispatch(toggleTheme())}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-[#78716C] dark:text-[#9CA3AF] hover:bg-[#FAF8F5] dark:hover:bg-[#0A2E28] transition-all"
        >
          <span className="flex items-center gap-2">
            {isDark ? <Sun className="w-4 h-4 text-[#DFBD76]" /> : <Moon className="w-4 h-4 text-[#084C42]" />}
            <span>{isDark ? 'Light Theme' : 'Dark Theme'}</span>
          </span>
          <span className="text-[10px] uppercase font-bold text-[#DFBD76]">
            {isDark ? 'Dark' : 'Light'}
          </span>
        </button>
      </div>

    </aside>
  );
}
