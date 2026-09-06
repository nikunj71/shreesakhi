'use client';

import React, { useState, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { openAuthModal } from '@/store/authSlice';
import { exportBoutiqueDataToExcel } from '@/lib/excelExport';
import { BarChart, PieChart } from '@mui/x-charts';
import { 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  Award, 
  FileSpreadsheet, 
  ShieldCheck, 
  Sparkles,
  Lock,
  PackageCheck,
  CheckCircle2,
  Clock,
  BarChart3,
  PieChart as PieChartIcon,
  ArrowUpRight
} from 'lucide-react';
import { toast } from 'sonner';

export function AnalyticsDashboard() {
  const dispatch = useAppDispatch();
  const cholis = useAppSelector((state) => state.cholis.items);
  const bookings = useAppSelector((state) => state.bookings.items);
  const { currentUser, theme } = useAppSelector((state) => state.auth);
  const isDark = theme === 'dark';

  // Chart view state toggles
  const [monthlyMetric, setMonthlyMetric] = useState<'revenue' | 'rentals' | 'both'>('revenue');
  const [categoryMetric, setCategoryMetric] = useState<'revenue' | 'count'>('revenue');

  // STRICT ACCESS CHECK: Only Admin can access financial analytics
  if (currentUser?.role !== 'ADMIN') {
    return (
      <div className="text-center py-20 bg-white dark:bg-[#072622] rounded-3xl border border-[#EADFC9] dark:border-[#1A3E38] p-8 space-y-4 max-w-lg mx-auto shadow-xl">
        <div className="w-16 h-16 rounded-full bg-[#084C42]/10 dark:bg-[#DFBD76]/15 flex items-center justify-center mx-auto text-[#084C42] dark:text-[#DFBD76]">
          <Lock className="w-8 h-8" />
        </div>
        <h3 className="font-serif text-2xl font-bold text-[#1C1917] dark:text-[#FAF6EC]">
          Confidential Boutique Analytics
        </h3>
        <p className="text-xs text-[#78716C] dark:text-[#9CA3AF] leading-relaxed">
          Total capital investment, choli acquisition costs, pure rental profits, and break-even ROI metrics are strictly private. Access is restricted to the Boutique Owner (Admin).
        </p>
        <div className="pt-2">
          <button
            onClick={() => dispatch(openAuthModal())}
            className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#084C42] to-[#0D6357] text-white font-bold text-xs shadow-md hover:opacity-95 transition-all"
          >
            Sign In as Boutique Owner
          </button>
        </div>
      </div>
    );
  }

  // Overall Financial Calculations
  const totalCapitalInvested = cholis.reduce((acc, c) => acc + (c.totalCosting || 0), 0);
  const totalRentEarned = cholis.reduce((acc, c) => acc + (c.totalEarnedFromRent || 0), 0);
  const totalPureProfit = cholis.reduce((acc, c) => {
    return acc + Math.max(0, (c.totalEarnedFromRent || 0) - (c.totalCosting || 0));
  }, 0);
  const totalRemainingCapital = Math.max(0, totalCapitalInvested - totalRentEarned);
  const overallBreakEvenPercent = totalCapitalInvested > 0 
    ? Math.min(100, Math.round((totalRentEarned / totalCapitalInvested) * 100)) 
    : 0;

  // Active bookings and returns
  const activeRentals = bookings.filter((b) => b.status === 'PICKED_UP').length;
  const pendingReturns = bookings.filter((b) => b.status === 'CONFIRMED' || b.status === 'PICKED_UP').length;
  const activeSecurityDeposits = bookings
    .filter((b) => b.status === 'PICKED_UP')
    .reduce((acc, b) => acc + (b.securityDeposit || 0), 0);

  // Top Performing Cholis
  const topCholis = [...cholis].sort((a, b) => (b.totalEarnedFromRent || 0) - (a.totalEarnedFromRent || 0)).slice(0, 5);

  // Inventory Breakeven Statistics
  const breakEvenOutfitsCount = cholis.filter((c) => c.isBreakEvenReached).length;
  const inRecoveryOutfitsCount = cholis.filter((c) => !c.isBreakEvenReached).length;
  const avgYieldPerOutfit = cholis.length > 0 ? Math.round(totalRentEarned / cholis.length) : 0;

  // Monthly Analytics Data
  const monthlyStats = [
    { month: 'Jul 26', rentals: 4, revenue: 24500, label: 'Jul 2026' },
    { month: 'Aug 26', rentals: 7, revenue: 41200, label: 'Aug 2026' },
    { month: 'Sep 26', rentals: 12, revenue: 68700, label: 'Sep 2026 (Live)' },
    { month: 'Oct 26*', rentals: 22, revenue: 115000, label: 'Oct (Navratri)*' },
    { month: 'Nov 26*', rentals: 28, revenue: 185000, label: 'Nov (Weddings)*' },
    { month: 'Dec 26*', rentals: 24, revenue: 160000, label: 'Dec (Receptions)*' },
  ];

  // Category Distribution Computation
  const categoryStats = useMemo(() => {
    const cats: Record<string, { count: number; revenue: number }> = {
      Bridal: { count: 0, revenue: 0 },
      Sangeet: { count: 0, revenue: 0 },
      Navratri: { count: 0, revenue: 0 },
      Reception: { count: 0, revenue: 0 },
      Partywear: { count: 0, revenue: 0 },
    };

    cholis.forEach((c) => {
      const cat = c.category || 'Bridal';
      if (!cats[cat]) cats[cat] = { count: 0, revenue: 0 };
      cats[cat].count += 1;
      cats[cat].revenue += (c.totalEarnedFromRent || 0);
    });

    const colors: Record<string, string> = {
      Bridal: '#084C42',
      Sangeet: '#DFBD76',
      Navratri: '#15803D',
      Reception: '#7C3AED',
      Partywear: '#E11D48',
    };

    const pieByRevenue = Object.entries(cats).map(([name, val], id) => ({
      id,
      value: val.revenue > 0 ? val.revenue : (val.count > 0 ? val.count * 1200 : 800),
      label: name,
      color: colors[name] || '#084C42',
      actualRevenue: val.revenue,
    }));

    const pieByCount = Object.entries(cats).map(([name, val], id) => ({
      id,
      value: val.count,
      label: name,
      color: colors[name] || '#DFBD76',
      actualCount: val.count,
    }));

    return { pieByRevenue, pieByCount };
  }, [cholis]);

  // Outfit Capital Recovery Comparison Data
  const outfitRecoveryData = useMemo(() => {
    return topCholis.map((c) => ({
      sku: c.sku,
      name: c.name,
      invested: c.totalCosting,
      recovered: c.totalEarnedFromRent,
    }));
  }, [topCholis]);

  const handleExport = () => {
    exportBoutiqueDataToExcel(bookings, cholis, currentUser?.role);
    toast.success('Excel financial workbook downloaded!');
  };

  const chartThemeSx = {
    '& .MuiChartsAxis-tickLabel': {
      fill: isDark ? '#FAF6EC !important' : '#1C1917 !important',
      fontSize: '0.75rem',
      fontWeight: 600,
    },
    '& .MuiChartsAxis-line, & .MuiChartsAxis-tick': {
      stroke: isDark ? '#1A3E38 !important' : '#EADFC9 !important',
    },
    '& .MuiChartsGrid-line': {
      stroke: isDark ? 'rgba(26, 62, 56, 0.4) !important' : 'rgba(234, 223, 201, 0.6) !important',
      strokeDasharray: '4 4',
    },
    '& .MuiChartsLegend-series text': {
      fill: isDark ? '#FAF6EC !important' : '#1C1917 !important',
      fontSize: '0.75rem',
      fontWeight: 600,
    },
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      
      {/* Header & Excel Download */}
      <div className="bg-white dark:bg-[#072622] p-5 sm:p-6 rounded-3xl border border-[#EADFC9] dark:border-[#1A3E38] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#084C42]/10 dark:bg-[#084C42]/30 flex items-center justify-center text-[#084C42] dark:text-[#DFBD76]">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1C1917] dark:text-[#FAF6EC]">
              Financial ROI & Inventory Analytics
            </h2>
            <p className="text-xs text-[#78716C] dark:text-[#9CA3AF]">
              Live choli capital cost recovery, high-earning couture pieces, and seasonal revenue projections
            </p>
          </div>
        </div>

        <button
          onClick={handleExport}
          className="py-2.5 px-4 rounded-xl text-xs font-bold bg-[#15803D] hover:bg-[#166534] text-white shadow-md flex items-center gap-2 transition-all"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Export Complete Financial Register</span>
        </button>
      </div>

      {/* Row 1: 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Total Capital Invested */}
        <div className="bg-white dark:bg-[#072622] p-5 rounded-3xl border border-[#EADFC9] dark:border-[#1A3E38] shadow-sm space-y-2">
          <div className="flex items-center justify-between text-[#78716C] dark:text-[#9CA3AF]">
            <span className="text-xs font-semibold uppercase tracking-wider">Cholis Investment</span>
            <DollarSign className="w-4 h-4 text-[#DFBD76]" />
          </div>
          <p className="font-serif text-2xl sm:text-3xl font-bold text-[#1C1917] dark:text-[#FAF6EC]">
            ₹{(totalCapitalInvested ?? 0).toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-[#78716C] dark:text-[#9CA3AF]">
            Across {cholis.length} luxury cataloged outfits
          </p>
        </div>

        {/* Total Rent Recovered */}
        <div className="bg-white dark:bg-[#072622] p-5 rounded-3xl border border-[#EADFC9] dark:border-[#1A3E38] shadow-sm space-y-2">
          <div className="flex items-center justify-between text-[#78716C] dark:text-[#9CA3AF]">
            <span className="text-xs font-semibold uppercase tracking-wider">Rent Cleared</span>
            <TrendingUp className="w-4 h-4 text-[#15803D]" />
          </div>
          <p className="font-serif text-2xl sm:text-3xl font-bold text-[#15803D] dark:text-[#22C55E]">
            ₹{(totalRentEarned ?? 0).toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
            {overallBreakEvenPercent}% of total capital recovered!
          </p>
        </div>

        {/* Pure Profit Generated */}
        <div className="bg-white dark:bg-[#072622] p-5 rounded-3xl border border-[#EADFC9] dark:border-[#1A3E38] shadow-sm space-y-2">
          <div className="flex items-center justify-between text-[#78716C] dark:text-[#9CA3AF]">
            <span className="text-xs font-semibold uppercase tracking-wider">Pure Profit Made</span>
            <Sparkles className="w-4 h-4 text-[#DFBD76]" />
          </div>
          <p className="font-serif text-2xl sm:text-3xl font-bold text-[#084C42] dark:text-[#DFBD76]">
            ₹{(totalPureProfit ?? 0).toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-[#78716C] dark:text-[#9CA3AF]">
            From outfits past 100% break-even
          </p>
        </div>

        {/* Active Outfits on Rent */}
        <div className="bg-white dark:bg-[#072622] p-5 rounded-3xl border border-[#EADFC9] dark:border-[#1A3E38] shadow-sm space-y-2">
          <div className="flex items-center justify-between text-[#78716C] dark:text-[#9CA3AF]">
            <span className="text-xs font-semibold uppercase tracking-wider">Active on Rent</span>
            <Calendar className="w-4 h-4 text-[#DFBD76]" />
          </div>
          <p className="font-serif text-2xl sm:text-3xl font-bold text-[#1C1917] dark:text-[#FAF6EC]">
            {activeRentals} Outfits
          </p>
          <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">
            {pendingReturns} total scheduled reservations
          </p>
        </div>

      </div>

      {/* Row 2: Break-Even Progress Big Bar */}
      <div className="bg-white dark:bg-[#072622] p-6 rounded-3xl border border-[#EADFC9] dark:border-[#1A3E38] shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-serif text-lg font-bold text-[#1C1917] dark:text-[#FAF6EC]">
              Total Boutique Capital Cost Recovery Progress
            </h3>
            <p className="text-xs text-[#78716C] dark:text-[#9CA3AF]">
              Live calculation deducting all cleared customer rent payments from initial acquisition expenses.
            </p>
          </div>
          <div className="text-right">
            <span className="font-serif text-xl font-bold text-[#084C42] dark:text-[#DFBD76]">
              {overallBreakEvenPercent}% Recovered
            </span>
          </div>
        </div>

        <div className="w-full bg-[#EADFC9]/60 dark:bg-[#041A17] h-4 rounded-full overflow-hidden border border-transparent dark:border-[#1A3E38]">
          <div
            className="h-full bg-gradient-to-r from-[#084C42] via-[#DFBD76] to-[#15803D] rounded-full transition-all duration-1000"
            style={{ width: `${overallBreakEvenPercent}%` }}
          />
        </div>

        <div className="flex justify-between items-center text-xs text-[#78716C] dark:text-[#9CA3AF] pt-1">
          <span>₹0</span>
          <span>Pending Recovery: <strong className="text-[#1C1917] dark:text-[#FAF6EC]">₹{(totalRemainingCapital ?? 0).toLocaleString('en-IN')}</strong></span>
          <span>Target: ₹{(totalCapitalInvested ?? 0).toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Row 3: INTERACTIVE DATA ANALYTICS CHARTS (NEW) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Chart 1: Seasonal Revenue & Booking Trajectory (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-[#072622] p-5 sm:p-6 rounded-3xl border border-[#EADFC9] dark:border-[#1A3E38] shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EADFC9]/60 dark:border-[#1A3E38] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#DFBD76]" />
                <h3 className="font-serif text-lg font-bold text-[#1C1917] dark:text-[#FAF6EC]">
                  Seasonal Revenue & Booking Trajectory
                </h3>
              </div>
              <p className="text-xs text-[#78716C] dark:text-[#9CA3AF]">
                Actual performance vs festive wedding surge forecasts
              </p>
            </div>

            {/* Chart Mode Toggle */}
            <div className="flex items-center p-1 rounded-xl bg-[#FAF8F5] dark:bg-[#041A17] border border-[#EADFC9] dark:border-[#1A3E38] self-start sm:self-auto">
              <button
                onClick={() => setMonthlyMetric('revenue')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  monthlyMetric === 'revenue'
                    ? 'bg-[#084C42] text-[#FAF6EC] shadow-sm'
                    : 'text-[#78716C] dark:text-[#9CA3AF]'
                }`}
              >
                Revenue (₹)
              </button>
              <button
                onClick={() => setMonthlyMetric('rentals')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  monthlyMetric === 'rentals'
                    ? 'bg-[#084C42] text-[#FAF6EC] shadow-sm'
                    : 'text-[#78716C] dark:text-[#9CA3AF]'
                }`}
              >
                Orders
              </button>
              <button
                onClick={() => setMonthlyMetric('both')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  monthlyMetric === 'both'
                    ? 'bg-[#084C42] text-[#FAF6EC] shadow-sm'
                    : 'text-[#78716C] dark:text-[#9CA3AF]'
                }`}
              >
                Combined
              </button>
            </div>
          </div>

          {/* Bar Chart Container */}
          <div className="w-full overflow-x-auto">
            <BarChart
              xAxis={[{
                scaleType: 'band',
                data: monthlyStats.map((d) => d.month),
                tickLabelStyle: {
                  fill: isDark ? '#FAF6EC' : '#1C1917',
                  fontSize: 11,
                  fontWeight: 600,
                },
              }]}
              yAxis={[{
                tickLabelStyle: {
                  fill: isDark ? '#9BB5AF' : '#78716C',
                  fontSize: 11,
                },
                valueFormatter: (v: number | null) => {
                  if (!v) return '';
                  if (monthlyMetric === 'rentals') return `${v} orders`;
                  return v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`;
                },
              }]}
              series={
                monthlyMetric === 'revenue' ? [
                  {
                    data: monthlyStats.map((d) => d.revenue),
                    label: 'Gross Rental Revenue (₹)',
                    color: '#084C42',
                    valueFormatter: (v: number | null) => v ? `₹${v.toLocaleString('en-IN')}` : '',
                  },
                ] : monthlyMetric === 'rentals' ? [
                  {
                    data: monthlyStats.map((d) => d.rentals),
                    label: 'Cholis Booked / Reserved',
                    color: '#DFBD76',
                    valueFormatter: (v: number | null) => v ? `${v} bookings` : '',
                  },
                ] : [
                  {
                    data: monthlyStats.map((d) => Math.round(d.revenue / 1000)),
                    label: 'Revenue (₹ Thousands)',
                    color: '#084C42',
                    valueFormatter: (v: number | null) => v ? `₹${v}k` : '',
                  },
                  {
                    data: monthlyStats.map((d) => d.rentals),
                    label: 'Orders Count',
                    color: '#DFBD76',
                    valueFormatter: (v: number | null) => v ? `${v} orders` : '',
                  },
                ]
              }
              height={300}
              margin={{ top: 20, bottom: 35, left: 65, right: 20 }}
              borderRadius={8}
              grid={{ horizontal: true }}
              sx={chartThemeSx}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between text-[11px] text-[#78716C] dark:text-[#9CA3AF] pt-1 border-t border-[#EADFC9]/40 dark:border-[#1A3E38]/60">
            <span>* Indicates seasonal festive projections</span>
            <span className="font-semibold text-[#084C42] dark:text-[#DFBD76]">Peak Surge: Nov 2026 (Wedding Season)</span>
          </div>
        </div>

        {/* Chart 2: Category Revenue & Inventory Share Donut (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-[#072622] p-5 sm:p-6 rounded-3xl border border-[#EADFC9] dark:border-[#1A3E38] shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EADFC9]/60 dark:border-[#1A3E38] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <PieChartIcon className="w-5 h-5 text-[#084C42] dark:text-[#DFBD76]" />
                <h3 className="font-serif text-lg font-bold text-[#1C1917] dark:text-[#FAF6EC]">
                  Category Breakdown
                </h3>
              </div>
              <p className="text-xs text-[#78716C] dark:text-[#9CA3AF]">
                Revenue & catalog volume by collection
              </p>
            </div>

            {/* Category Metric Toggle */}
            <div className="flex items-center p-1 rounded-xl bg-[#FAF8F5] dark:bg-[#041A17] border border-[#EADFC9] dark:border-[#1A3E38] self-start sm:self-auto">
              <button
                onClick={() => setCategoryMetric('revenue')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  categoryMetric === 'revenue'
                    ? 'bg-[#084C42] text-[#FAF6EC] shadow-sm'
                    : 'text-[#78716C] dark:text-[#9CA3AF]'
                }`}
              >
                Revenue
              </button>
              <button
                onClick={() => setCategoryMetric('count')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  categoryMetric === 'count'
                    ? 'bg-[#084C42] text-[#FAF6EC] shadow-sm'
                    : 'text-[#78716C] dark:text-[#9CA3AF]'
                }`}
              >
                Units
              </button>
            </div>
          </div>

          {/* Donut Chart Container */}
          <div className="w-full flex items-center justify-center">
            <PieChart
              series={[
                {
                  data: categoryMetric === 'revenue' ? categoryStats.pieByRevenue : categoryStats.pieByCount,
                  innerRadius: 55,
                  outerRadius: 95,
                  paddingAngle: 3,
                  cornerRadius: 6,
                  highlightScope: { fade: 'global', highlight: 'item' },
                  valueFormatter: (item: { value: number }) => {
                    return categoryMetric === 'revenue' 
                      ? `₹${item.value.toLocaleString('en-IN')}` 
                      : `${item.value} cholis`;
                  },
                },
              ]}
              height={280}
              margin={{ top: 10, bottom: 10, left: 10, right: 130 }}
              slotProps={{
                legend: {
                  direction: 'vertical',
                  position: { vertical: 'middle', horizontal: 'end' },
                  sx: {
                    '& .MuiChartsLegend-series text': {
                      fontSize: '0.75rem',
                      fill: isDark ? '#FAF6EC !important' : '#1C1917 !important',
                      fontWeight: 600,
                    },
                  },
                },
              }}
            />
          </div>

          {/* Category Chips Bar */}
          <div className="grid grid-cols-3 gap-2 pt-1 border-t border-[#EADFC9]/40 dark:border-[#1A3E38]/60 text-center">
            <div className="p-2 rounded-xl bg-[#FAF8F5] dark:bg-[#041A17] border border-[#EADFC9]/50 dark:border-[#1A3E38]">
              <span className="text-[10px] text-[#78716C] dark:text-[#9CA3AF] block">Bridal</span>
              <span className="font-bold text-xs text-[#084C42] dark:text-[#DFBD76]">
                {cholis.filter(c => c.category === 'Bridal').length} Designs
              </span>
            </div>
            <div className="p-2 rounded-xl bg-[#FAF8F5] dark:bg-[#041A17] border border-[#EADFC9]/50 dark:border-[#1A3E38]">
              <span className="text-[10px] text-[#78716C] dark:text-[#9CA3AF] block">Sangeet</span>
              <span className="font-bold text-xs text-[#084C42] dark:text-[#DFBD76]">
                {cholis.filter(c => c.category === 'Sangeet').length} Designs
              </span>
            </div>
            <div className="p-2 rounded-xl bg-[#FAF8F5] dark:bg-[#041A17] border border-[#EADFC9]/50 dark:border-[#1A3E38]">
              <span className="text-[10px] text-[#78716C] dark:text-[#9CA3AF] block">Navratri</span>
              <span className="font-bold text-xs text-[#084C42] dark:text-[#DFBD76]">
                {cholis.filter(c => c.category === 'Navratri').length} Designs
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Row 4: Top Outfits Capital Recovery vs Revenue Chart (Full Width) */}
      <div className="bg-white dark:bg-[#072622] p-5 sm:p-6 rounded-3xl border border-[#EADFC9] dark:border-[#1A3E38] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EADFC9]/60 dark:border-[#1A3E38] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-[#DFBD76]" />
              <h3 className="font-serif text-lg font-bold text-[#1C1917] dark:text-[#FAF6EC]">
                Choli Capital Recovery vs Earnings (Break-Even Progress)
              </h3>
            </div>
            <p className="text-xs text-[#78716C] dark:text-[#9CA3AF]">
              Direct comparison of wholesale purchase cost against total rental revenue earned per outfit
            </p>
          </div>

          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#15803D] dark:text-[#22C55E]">
            <CheckCircle2 className="w-4 h-4" />
            <span>{breakEvenOutfitsCount} of {cholis.length} Outfits Fully Recovered</span>
          </span>
        </div>

        {/* Grouped Bar Chart */}
        <div className="w-full overflow-x-auto">
          <BarChart
            xAxis={[{
              scaleType: 'band',
              data: outfitRecoveryData.map((d) => d.sku),
              tickLabelStyle: {
                fill: isDark ? '#FAF6EC' : '#1C1917',
                fontSize: 11,
                fontWeight: 700,
              },
            }]}
            yAxis={[{
              tickLabelStyle: {
                fill: isDark ? '#9BB5AF' : '#78716C',
                fontSize: 11,
              },
              valueFormatter: (v: number | null) => v ? `₹${(v / 1000).toFixed(0)}k` : '',
            }]}
            series={[
              {
                data: outfitRecoveryData.map((d) => d.invested),
                label: 'Purchase Cost (Invested)',
                color: isDark ? '#14463E' : '#94A3B8',
                valueFormatter: (v: number | null) => v ? `₹${v.toLocaleString('en-IN')}` : '',
              },
              {
                data: outfitRecoveryData.map((d) => d.recovered),
                label: 'Rental Revenue Recovered',
                color: '#DFBD76',
                valueFormatter: (v: number | null) => v ? `₹${v.toLocaleString('en-IN')}` : '',
              },
            ]}
            height={300}
            margin={{ top: 20, bottom: 35, left: 65, right: 20 }}
            borderRadius={8}
            grid={{ horizontal: true }}
            sx={chartThemeSx}
          />
        </div>
      </div>

      {/* Row 5: Inventory Asset Health & Top Outfits Split Screen */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Boutique Asset Health & Recovery Breakdown */}
        <div className="bg-white dark:bg-[#072622] p-6 rounded-3xl border border-[#EADFC9] dark:border-[#1A3E38] shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <PackageCheck className="w-5 h-5 text-[#084C42] dark:text-[#DFBD76]" />
            <h3 className="font-serif text-lg font-bold text-[#1C1917] dark:text-[#FAF6EC]">
              Boutique Inventory & Asset Health
            </h3>
          </div>
          <p className="text-xs text-[#78716C] dark:text-[#9CA3AF]">
            Overview of total choli capital status, breakeven milestones, and client security holdings.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-2">
            {/* 100% Breakeven Achieved */}
            <div className="p-3.5 rounded-2xl bg-[#FAF8F5] dark:bg-[#041A17] border border-[#EADFC9]/60 dark:border-[#1A3E38] space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-[#15803D] dark:text-[#22C55E] font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>100% Recovered</span>
              </div>
              <p className="font-serif text-xl font-bold text-[#1C1917] dark:text-[#FAF6EC]">
                {breakEvenOutfitsCount} Outfits
              </p>
              <p className="text-[10px] text-[#78716C] dark:text-[#9CA3AF]">
                Generating pure rental profit
              </p>
            </div>

            {/* In Recovery Cycle */}
            <div className="p-3.5 rounded-2xl bg-[#FAF8F5] dark:bg-[#041A17] border border-[#EADFC9]/60 dark:border-[#1A3E38] space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-[#DFBD76] font-semibold">
                <Clock className="w-4 h-4" />
                <span>In Cost Recovery</span>
              </div>
              <p className="font-serif text-xl font-bold text-[#1C1917] dark:text-[#FAF6EC]">
                {inRecoveryOutfitsCount} Outfits
              </p>
              <p className="text-[10px] text-[#78716C] dark:text-[#9CA3AF]">
                Working toward break-even
              </p>
            </div>

            {/* Average Rental Yield */}
            <div className="p-3.5 rounded-2xl bg-[#FAF8F5] dark:bg-[#041A17] border border-[#EADFC9]/60 dark:border-[#1A3E38] space-y-1">
              <span className="text-[11px] font-semibold text-[#78716C] dark:text-[#9CA3AF] block">
                Avg Yield / Outfit
              </span>
              <p className="font-serif text-xl font-bold text-[#084C42] dark:text-[#DFBD76]">
                ₹{(avgYieldPerOutfit ?? 0).toLocaleString('en-IN')}
              </p>
              <p className="text-[10px] text-[#78716C] dark:text-[#9CA3AF]">
                Average return per choli
              </p>
            </div>

            {/* Security Deposits in Escrow */}
            <div className="p-3.5 rounded-2xl bg-[#FAF8F5] dark:bg-[#041A17] border border-[#EADFC9]/60 dark:border-[#1A3E38] space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>Deposits Held</span>
              </div>
              <p className="font-serif text-xl font-bold text-[#1C1917] dark:text-[#FAF6EC]">
                ₹{(activeSecurityDeposits ?? 0).toLocaleString('en-IN')}
              </p>
              <p className="text-[10px] text-[#78716C] dark:text-[#9CA3AF]">
                Held in escrow from clients
              </p>
            </div>
          </div>
        </div>

        {/* Top Earning Outfits */}
        <div className="bg-white dark:bg-[#072622] p-6 rounded-3xl border border-[#EADFC9] dark:border-[#1A3E38] shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-[#DFBD76]" />
            <h3 className="font-serif text-lg font-bold text-[#1C1917] dark:text-[#FAF6EC]">
              Top Earning Outfits
            </h3>
          </div>
          <p className="text-xs text-[#78716C] dark:text-[#9CA3AF]">
            Outfits that generated the highest rental revenue towards capital recovery.
          </p>

          <div className="space-y-3 pt-2">
            {topCholis.map((c, idx) => (
              <div
                key={c._id}
                className="flex items-center gap-3 p-3 rounded-2xl bg-[#FAF8F5] dark:bg-[#041A17] border border-[#EADFC9]/60 dark:border-[#1A3E38]"
              >
                <span className="w-7 h-7 rounded-full bg-[#DFBD76]/20 border border-[#DFBD76] text-[#084C42] dark:text-[#DFBD76] flex items-center justify-center text-xs font-bold font-serif flex-shrink-0">
                  #{idx + 1}
                </span>
                <img
                  src={c.images[0]}
                  alt={c.name}
                  className="w-10 h-12 rounded-xl object-cover flex-shrink-0 border border-[#EADFC9] dark:border-[#1A3E38]"
                />
                <div className="flex-1 min-w-0 text-xs">
                  <p className="font-bold text-[#1C1917] dark:text-[#FAF6EC] truncate">
                    {c.name}
                  </p>
                  <p className="text-[11px] text-[#78716C] dark:text-[#9CA3AF]">
                    Rent Earned: <strong className="text-[#15803D] dark:text-[#22C55E]">₹{(c.totalEarnedFromRent ?? 0).toLocaleString('en-IN')}</strong>
                  </p>
                  <p className="text-[10px] text-[#084C42] dark:text-[#DFBD76] font-medium">
                    {c.isBreakEvenReached ? '★ 100% Breakeven Passed' : 'In Cost Recovery'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
