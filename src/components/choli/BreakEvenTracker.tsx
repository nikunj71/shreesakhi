'use client';

import React from 'react';
import { Choli } from '@/types';
import { TrendingUp, CheckCircle2, AlertCircle } from 'lucide-react';

interface BreakEvenTrackerProps {
  choli: Choli;
  compact?: boolean;
}

export function BreakEvenTracker({ choli, compact = false }: BreakEvenTrackerProps) {
  const cost = choli.totalCosting || 1;
  const earned = choli.totalEarnedFromRent || 0;
  const percentage = Math.min(100, Math.round((earned / cost) * 100));
  const remaining = Math.max(0, cost - earned);
  const pureProfit = Math.max(0, earned - cost);
  const isRecovered = earned >= cost;

  if (compact) {
    return (
      <div className="space-y-1 text-xs">
        <div className="flex justify-between items-center text-[11px]">
          <span className="text-[#78716C] dark:text-[#9BB5AF]">Capital Recovered</span>
          <span className="font-semibold text-[#1C1917] dark:text-[#FAF6EC]">
            ₹{earned.toLocaleString('en-IN')} / ₹{cost.toLocaleString('en-IN')} ({percentage}%)
          </span>
        </div>
        <div className="w-full bg-[#EADFC9]/50 dark:bg-[#0A2E28] h-2 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              isRecovered
                ? 'bg-gradient-to-r from-[#15803D] to-[#22C55E]'
                : 'bg-gradient-to-r from-[#C5A059] to-[#DFBD76]'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="flex justify-between items-center text-[10px] pt-0.5">
          {isRecovered ? (
            <span className="text-[#15803D] dark:text-[#22C55E] font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Pure Profit: +₹{pureProfit.toLocaleString('en-IN')}
            </span>
          ) : (
            <span className="text-[#B45309] dark:text-[#F59E0B] font-medium flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Remaining: ₹{remaining.toLocaleString('en-IN')}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF8F5] dark:bg-[#041A17] p-3.5 rounded-xl border border-[#EADFC9] dark:border-[#1A3E38] space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-[#C5A059]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#1C1917] dark:text-[#FAF6EC]">
            Break-Even & ROI Tracker
          </span>
        </div>
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            isRecovered
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
              : 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300'
          }`}
        >
          {isRecovered ? '100% Breakeven Passed' : `${percentage}% Recovered`}
        </span>
      </div>

      <div className="w-full bg-[#EADFC9]/60 dark:bg-[#0A2E28] h-2.5 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-700 rounded-full ${
            isRecovered
              ? 'bg-gradient-to-r from-emerald-600 to-green-400'
              : 'bg-gradient-to-r from-[#C5A059] to-[#DFBD76]'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t border-[#EADFC9]/50 dark:border-[#1A3E38]/50 text-xs">
        <div>
          <p className="text-[10px] text-[#78716C] dark:text-[#9BB5AF]">Initial Cost</p>
          <p className="font-bold text-[#1C1917] dark:text-[#FAF6EC]">₹{cost.toLocaleString('en-IN')}</p>
        </div>
        <div>
          <p className="text-[10px] text-[#78716C] dark:text-[#9BB5AF]">Rent Cleared</p>
          <p className="font-bold text-[#15803D] dark:text-[#22C55E]">₹{earned.toLocaleString('en-IN')}</p>
        </div>
        <div>
          <p className="text-[10px] text-[#78716C] dark:text-[#9BB5AF]">
            {isRecovered ? 'Net Profit' : 'Pending Cost'}
          </p>
          <p
            className={`font-bold ${
              isRecovered
                ? 'text-[#15803D] dark:text-[#22C55E]'
                : 'text-[#084C42] dark:text-[#DFBD76]'
            }`}
          >
            {isRecovered ? `+₹${pureProfit.toLocaleString('en-IN')}` : `₹${remaining.toLocaleString('en-IN')}`}
          </p>
        </div>
      </div>
    </div>
  );
}
