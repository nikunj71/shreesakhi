'use client';

import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { toggleTheme, openAuthModal, logoutUser } from '@/store/authSlice';
import { Moon, Sun, Lock, LogOut, User, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmationModal } from '@/components/common/ConfirmationModal';

export function MobileHeader() {
  const dispatch = useAppDispatch();
  const { currentUser, theme } = useAppSelector((state) => state.auth);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const avatarLetter = currentUser?.role === 'ADMIN' ? 'A' : (currentUser?.name?.charAt(0).toUpperCase() || 'S');

  const handleLogout = () => {
    setIsMenuOpen(false);
    dispatch(logoutUser());
    toast.success('Signed out successfully.');
  };

  return (
    <header className="sticky top-0 z-40 md:hidden bg-white/95 dark:bg-[#072622]/95 border-b border-[#EADFC9] dark:border-[#1A3E38] backdrop-blur-md px-4 py-2.5 transition-colors shadow-sm">
      <div className="flex items-center justify-between">
        
        {/* Brand Logo Plaque */}
        <div className="flex items-center gap-2">
          <div className="h-9 px-2.5 rounded-xl bg-[#025151] border border-[#DFBD76]/70 flex items-center justify-center shadow-sm">
            <img src="/logo-cropped.png" alt="श्री SAKHI BOUTIQUE" className="h-7 w-auto object-contain" />
          </div>
        </div>

        {/* Right Side Controls */}
        <div className="flex items-center gap-2">
          {/* Theme Switcher */}
          <button
            onClick={() => dispatch(toggleTheme())}
            className="p-1.5 rounded-full border border-[#EADFC9] dark:border-[#1A3E38] bg-[#FAF8F5] dark:bg-[#0A2E28] text-[#1C1917] dark:text-[#DFBD76] transition-all"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* User Profile Avatar or Sign In */}
          {!currentUser ? (
            <button
              onClick={() => dispatch(openAuthModal())}
              className="px-3 py-1.5 rounded-full bg-[#084C42] hover:bg-[#0D6357] text-[#FAF6EC] border border-[#DFBD76]/50 text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-transform"
            >
              <Lock className="w-3 h-3 text-[#DFBD76]" />
              <span>Sign In</span>
            </button>
          ) : (
            <div className="relative">
              {/* Avatar Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="w-8 h-8 rounded-full bg-[#084C42] border-2 border-[#DFBD76] flex items-center justify-center text-[#DFBD76] font-bold font-serif text-xs shadow-md active:scale-95 transition-transform"
                title={`${currentUser.name} (${currentUser.role})`}
              >
                {avatarLetter}
              </button>

              {/* Mobile Profile Popover */}
              {isMenuOpen && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsMenuOpen(false)}
                  />

                  {/* Dropdown Menu */}
                  <div className="absolute right-0 top-10 z-50 w-64 rounded-2xl bg-[#072622] border border-[#DFBD76]/40 p-3.5 shadow-2xl space-y-3 text-left animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-center gap-2.5 pb-2.5 border-b border-white/10">
                      <div className="w-10 h-10 rounded-full bg-[#084C42] border-2 border-[#DFBD76] flex items-center justify-center text-[#DFBD76] font-bold font-serif text-sm flex-shrink-0">
                        {avatarLetter}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-xs text-[#FAF6EC] truncate">
                          {currentUser.name}
                        </p>
                        <p className="text-[10px] text-[#9BB5AF] truncate">
                          {currentUser.email}
                        </p>
                        <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#DFBD76]/20 text-[#DFBD76] border border-[#DFBD76]/40">
                          {currentUser.role === 'ADMIN' ? '👑 Boutique Admin' : `Staff (${currentUser.employeeCode || 'EMP'})`}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          dispatch(openAuthModal());
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-stone-200 hover:bg-white/10 transition-colors"
                      >
                        <User className="w-3.5 h-3.5 text-[#DFBD76]" />
                        <span>Switch / Manage Profile</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          setIsLogoutModalOpen(true);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-red-400 hover:bg-red-950/40 transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

      </div>

      <ConfirmationModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={() => {
          setIsLogoutModalOpen(false);
          handleLogout();
        }}
        type="warning"
        title="Sign Out Confirmation"
        description={`Are you sure you want to sign out from the boutique management suite as ${currentUser?.name || 'user'}?`}
        confirmText="Yes, Sign Out"
        cancelText="Cancel"
      />
    </header>
  );
}
