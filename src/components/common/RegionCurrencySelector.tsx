import React from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { usePlatform } from '../../context/PlatformContext';
import { RegionCurrencyCode, REGION_CURRENCY_MAP } from '../../utils/currency';

interface RegionCurrencySelectorProps {
  className?: string;
  compact?: boolean;
}

export const RegionCurrencySelector: React.FC<RegionCurrencySelectorProps> = ({ 
  className = '',
  compact = false 
}) => {
  const { regionCurrency, setRegionCurrency, currencyConfig } = usePlatform();

  const options: { code: RegionCurrencyCode; label: string }[] = [
    { code: 'INR', label: 'India (INR ₹)' },
    { code: 'USD', label: 'United States (USD $)' },
    { code: 'EUR', label: 'Europe (EUR €)' },
    { code: 'JPY', label: 'Japan (JPY ¥)' },
    { code: 'KRW', label: 'South Korea (KRW ₩)' },
  ];

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <label htmlFor="region-currency-select" className="sr-only">
        Region & Currency
      </label>
      <div className="group relative flex items-center rounded-xl border border-slate-200 bg-white/95 px-2.5 py-1.5 shadow-2xs hover:border-slate-300 hover:bg-slate-50/80 transition-all focus-within:ring-2 focus-within:ring-rose-500/20 focus-within:border-rose-400">
        <Globe className="h-3.5 w-3.5 text-slate-500 group-hover:text-rose-600 transition-colors mr-1.5 shrink-0" />
        
        <select
          id="region-currency-select"
          value={regionCurrency}
          onChange={(e) => setRegionCurrency(e.target.value as RegionCurrencyCode)}
          className="appearance-none bg-transparent pr-6 text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
          title="Select Region & Currency format"
        >
          {options.map((opt) => (
            <option key={opt.code} value={opt.code} className="text-slate-900 bg-white font-medium py-1">
              {opt.label}
            </option>
          ))}
        </select>

        <ChevronDown className="pointer-events-none absolute right-2 h-3.5 w-3.5 text-slate-400 group-hover:text-slate-600 transition-colors" />
      </div>
    </div>
  );
};
