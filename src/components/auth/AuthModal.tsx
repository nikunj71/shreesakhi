'use client';

import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { closeAuthModal, loginUserApi, registerStaffApi, logoutUser } from '@/store/authSlice';
import { 
  X, 
  Sparkles, 
  Lock, 
  Mail, 
  User, 
  Phone, 
  BadgeCheck, 
  ShieldCheck, 
  ArrowRight,
  UserPlus,
  LogIn,
  LogOut,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import Button from '@mui/material/Button';

export function AuthModal() {
  const dispatch = useAppDispatch();
  const { isAuthModalOpen, currentUser, loading } = useAppSelector(
    (state) => state.auth
  );

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register staff form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regCode, setRegCode] = useState(`EMP-${Math.floor(103 + Math.random() * 800)}`);
  const [regPassword, setRegPassword] = useState('');

  if (!isAuthModalOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword) {
      toast.error('Please enter both email and password.');
      return;
    }

    try {
      const user = await dispatch(
        loginUserApi({ email: loginEmail.trim(), password: loginPassword })
      ).unwrap();

      toast.success(`Welcome back, ${user.name}!`, {
        description: user.role === 'ADMIN' 
          ? '👑 Financials Unlocked: Capital costs, ROI & Analytics are now accessible.'
          : '👤 Staff Portal Active: Ready for showroom showcases & customer bookings.'
      });
      setLoginEmail('');
      setLoginPassword('');
    } catch (err: any) {
      toast.error(err || 'Invalid email or password.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim() || !regCode.trim()) {
      toast.error('Please enter all required fields.');
      return;
    }

    try {
      const user = await dispatch(
        registerStaffApi({
          name: regName.trim(),
          email: regEmail.trim(),
          phone: regPhone.trim(),
          employeeCode: regCode.trim(),
          password: regPassword || 'staff123',
        })
      ).unwrap();

      toast.success(`Staff Member "${user.name}" registered successfully!`, {
        description: `Employee Code: ${user.employeeCode}. Saved to MongoDB.`
      });
      setRegName('');
      setRegEmail('');
      setRegPhone('');
      setRegPassword('');
    } catch (err: any) {
      toast.error(err || 'Registration failed.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-md bg-white dark:bg-[#072622] rounded-3xl border border-[#EADFC9] dark:border-[#1A3E38] shadow-2xl overflow-hidden my-6">
        
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-[#032620] via-[#084C42] to-[#0D5C51] p-6 text-white text-center relative">
          <button
            onClick={() => dispatch(closeAuthModal())}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="h-16 px-4 py-1.5 mx-auto rounded-2xl border-2 border-[#DFBD76] shadow-xl bg-[#025151] inline-flex items-center justify-center">
            <img src="/logo-cropped.png" alt="श्री SAKHI BOUTIQUE" className="h-full w-auto object-contain" />
          </div>
          <p className="text-[11px] text-[#DFBD76] mt-2 font-semibold tracking-wider uppercase">
            Staff & Owner Management Portal
          </p>

          {/* Toggle Tabs */}
          <div className="flex bg-black/30 p-1 rounded-xl mt-4 border border-[#DFBD76]/30">
            <button
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'login'
                  ? 'bg-[#DFBD76] text-stone-950 shadow-sm'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
            <button
              onClick={() => setActiveTab('register')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'register'
                  ? 'bg-[#DFBD76] text-stone-950 shadow-sm'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Register Staff</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {currentUser && (
            <div className="mb-5 p-3.5 rounded-2xl bg-[#FAF8F5] dark:bg-[#041A17] border border-[#EADFC9] dark:border-[#1A3E38] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {currentUser.role === 'ADMIN' ? (
                  <ShieldCheck className="w-5 h-5 text-[#084C42] dark:text-[#DFBD76]" />
                ) : (
                  <BadgeCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                )}
                <div>
                  <p className="text-xs font-bold text-[#1C1917] dark:text-[#FAF6EC]">
                    Signed in: {currentUser.name}
                  </p>
                  <p className="text-[10px] text-[#78716C] dark:text-[#9BB5AF]">
                    {currentUser.role === 'ADMIN' ? '👑 Owner (Financials Unlocked)' : `Staff (${currentUser.employeeCode || 'Floor'})`}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  dispatch(logoutUser());
                  toast.success('Signed out. Private boutique data locked.');
                  dispatch(closeAuthModal());
                }}
                className="px-3 py-1.5 rounded-xl bg-stone-200 hover:bg-stone-300 dark:bg-[#0A2E28] dark:hover:bg-[#14463E] text-[#084C42] dark:text-[#DFBD76] text-xs font-bold transition-all flex items-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}

          {activeTab === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4 text-xs sm:text-sm">
              <div className="space-y-1">
                <label className="font-semibold text-[#1C1917] dark:text-[#FAF6EC] block">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#78716C]" />
                  <input
                    type="email"
                    required
                    placeholder="Enter boutique email..."
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#FAF8F5] dark:bg-[#041A17] border border-[#EADFC9] dark:border-[#1A3E38] text-[#1C1917] dark:text-[#FAF6EC] focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#1C1917] dark:text-[#FAF6EC] block">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#78716C]" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#FAF8F5] dark:bg-[#041A17] border border-[#EADFC9] dark:border-[#1A3E38] text-[#1C1917] dark:text-[#FAF6EC] focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
              </div>

              <Button
                type="submit"
                fullWidth
                disabled={loading}
                variant="contained"
                color="primary"
                endIcon={loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight style={{ width: 16, height: 16 }} />}
                sx={{ py: 1.3, mt: 1, borderRadius: 9999, fontWeight: 700, fontSize: '0.8125rem' }}
              >
                {loading ? 'Signing In to MongoDB...' : 'Sign In to Boutique OS'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-3.5 text-xs sm:text-sm">
              <div className="space-y-1">
                <label className="font-semibold text-[#1C1917] dark:text-[#FAF6EC] block">
                  Staff Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#78716C]" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Anjali Verma"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#FAF8F5] dark:bg-[#041A17] border border-[#EADFC9] dark:border-[#1A3E38] text-[#1C1917] dark:text-[#FAF6EC] focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="font-semibold text-[#1C1917] dark:text-[#FAF6EC] block">
                    Staff Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="EMP-103"
                    value={regCode}
                    onChange={(e) => setRegCode(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#FAF8F5] dark:bg-[#041A17] border border-[#EADFC9] dark:border-[#1A3E38] text-[#084C42] dark:text-[#DFBD76] font-mono font-bold focus:outline-none focus:border-[#DFBD76]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#1C1917] dark:text-[#FAF6EC] block">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98..."
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#FAF8F5] dark:bg-[#041A17] border border-[#EADFC9] dark:border-[#1A3E38] text-[#1C1917] dark:text-[#FAF6EC] focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#1C1917] dark:text-[#FAF6EC] block">
                  Staff Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#78716C]" />
                  <input
                    type="email"
                    required
                    placeholder="anjali@shreesakhi.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#FAF8F5] dark:bg-[#041A17] border border-[#EADFC9] dark:border-[#1A3E38] text-[#1C1917] dark:text-[#FAF6EC] focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#1C1917] dark:text-[#FAF6EC] block">
                  Create Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#78716C]" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#FAF8F5] dark:bg-[#041A17] border border-[#EADFC9] dark:border-[#1A3E38] text-[#1C1917] dark:text-[#FAF6EC] focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-[11px] leading-relaxed">
                ℹ️ <strong>Staff Privileges:</strong> Registered staff can showcase cholis to customers and record bookings. Sensitive revenue, choli purchase costing, and profit metrics are permanently hidden from staff.
              </div>

              <Button
                type="submit"
                fullWidth
                disabled={loading}
                variant="contained"
                color="primary"
                endIcon={loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles style={{ width: 16, height: 16 }} />}
                sx={{ py: 1.3, mt: 1, borderRadius: 9999, fontWeight: 700, fontSize: '0.8125rem' }}
              >
                {loading ? 'Saving to MongoDB...' : 'Register Staff Member'}
              </Button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
