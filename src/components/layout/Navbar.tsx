import React, { useState } from 'react';
import { 
  Radio, 
  Search, 
  ChevronDown
} from 'lucide-react';
import { usePlatform } from '../../context/PlatformContext';
import { RegionCurrencySelector } from '../common/RegionCurrencySelector';

export const Navbar: React.FC = () => {
  const { 
    customers, 
    searchQuery, 
    setSearchQuery, 
    setActiveTab,
    drillDownToCustomer,
    triageHighRiskCohort,
    totalRevenueAtRiskMonthly,
    totalRevenueAtRiskAnnual,
    potentialAnnualSavings,
    highRiskCount,
    churnRatePct,
    formatCurrency
  } = usePlatform();

  const [showKpiDetails, setShowKpiDetails] = useState(false);

  // Quick match search for direct jump
  const searchMatches = React.useMemo(() => {
    if (!searchQuery.trim()) return [];
    return customers
      .filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone.includes(searchQuery)
      )
      .slice(0, 4);
  }, [customers, searchQuery]);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 sm:px-6 backdrop-blur-md">
      {/* Brand & Business Analytics KPIs */}
      <div className="flex items-center gap-3 lg:gap-4 flex-shrink-0">
        <div 
          className="flex items-center gap-3 cursor-pointer select-none" 
          onClick={() => setActiveTab('executive-dashboard')}
          title="Return to Executive Dashboard"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-rose-600 via-red-600 to-amber-500 text-white shadow-md shadow-rose-500/20">
            <Radio className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-slate-900">ChurnGuard</span>
              <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-rose-700 border border-rose-200/60">
                PROD v2.4
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium hidden sm:block">Telecom Revenue Retention Engine</p>
          </div>
        </div>

        <div className="hidden sm:block h-6 w-px bg-slate-200" />

        {/* Region & Currency Selector (Configurable Multi-Region System) */}
        <RegionCurrencySelector />

        {/* At Risk Metric (Kept as requested) */}
        <div className="relative">
          <button
            onClick={() => setShowKpiDetails(!showKpiDetails)}
            className="flex items-center gap-2 rounded-xl border border-rose-200/80 bg-rose-50/70 px-3 py-1.5 text-xs text-rose-900 hover:bg-rose-100/70 hover:border-rose-300 transition-all shadow-2xs cursor-pointer"
            title="Click to view full financial exposure breakdown"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600"></span>
            </span>
            <span className="font-semibold text-[11px] text-rose-700 uppercase tracking-wider hidden md:inline">At Risk:</span>
            <strong className="font-mono font-bold text-rose-900">{formatCurrency(totalRevenueAtRiskMonthly)}</strong>
            <span className="text-[11px] text-rose-600 font-medium">/mo</span>
            <ChevronDown className={`h-3 w-3 text-rose-500 transition-transform ${showKpiDetails ? 'rotate-180' : ''}`} />
          </button>

          {/* Live Financial Exposure Quick Brief Dropdown */}
          {showKpiDetails && (
            <div className="absolute left-0 mt-2 w-72 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Live Revenue Exposure
                </span>
                <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                  {churnRatePct}% Churn Propensity
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Gross Monthly Risk:</span>
                  <strong className="font-mono text-rose-600 font-bold">{formatCurrency(totalRevenueAtRiskMonthly)}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Annualized ARR Exposure:</span>
                  <strong className="font-mono text-slate-800 font-bold">{formatCurrency(totalRevenueAtRiskAnnual)}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Targetable Defections:</span>
                  <strong className="font-mono text-rose-700 font-bold">{highRiskCount} subscribers</strong>
                </div>
                <div className="flex items-center justify-between border-t border-slate-100 pt-2">
                  <span className="text-slate-600 font-medium">Modeled Recoverable ARR:</span>
                  <strong className="font-mono text-emerald-600 font-bold">+{formatCurrency(potentialAnnualSavings)}</strong>
                </div>
              </div>

              <div className="mt-3.5 pt-2.5 border-t border-slate-100 grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setShowKpiDetails(false);
                    triageHighRiskCohort();
                  }}
                  className="w-full rounded-lg bg-rose-600 py-1.5 px-2 text-[11px] font-bold text-white hover:bg-rose-700 text-center cursor-pointer"
                >
                  Triage Cohort
                </button>
                <button
                  onClick={() => {
                    setShowKpiDetails(false);
                    setActiveTab('business-impact');
                  }}
                  className="w-full rounded-lg bg-slate-100 py-1.5 px-2 text-[11px] font-bold text-slate-700 hover:bg-slate-200 text-center cursor-pointer"
                >
                  Full Impact ROI
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Center/Prominent Search with Autocomplete dropdown (Enhanced Width & Visual Prominence) */}
      <div className="relative flex-1 max-w-xl mx-4">
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 h-4.5 w-4.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search subscriber ID, name, or phone number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-slate-50/70 pl-10 pr-9 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-rose-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 shadow-xs transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 text-xs text-slate-400 hover:text-slate-600 font-medium"
            >
              ✕
            </button>
          )}
        </div>

        {searchMatches.length > 0 && (
          <div className="absolute left-0 right-0 top-11 rounded-xl border border-slate-200 bg-white p-2 shadow-xl z-50">
            <div className="px-2.5 py-1 text-[10px] font-semibold uppercase text-slate-400">
              Subscribers Found ({searchMatches.length})
            </div>
            {searchMatches.map((cust) => (
              <div
                key={cust.id}
                onClick={() => {
                  drillDownToCustomer(cust.id);
                  setSearchQuery('');
                }}
                className="flex items-center justify-between px-2.5 py-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
              >
                <div>
                  <div className="text-xs font-semibold text-slate-800">{cust.name}</div>
                  <div className="text-[11px] text-slate-500 font-mono">{cust.id} • {cust.contract}</div>
                </div>
                <div className="text-right">
                  <span className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-bold ${
                    cust.riskLevel === 'High' ? 'bg-rose-100 text-rose-700' :
                    cust.riskLevel === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {(cust.churnProbability * 100).toFixed(0)}% Risk
                  </span>
                  <div className="text-[10px] text-slate-400 font-medium">{formatCurrency(cust.monthlyCharges)}/mo</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </header>
  );
};
