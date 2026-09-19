import React, { useState, useMemo } from 'react';
import { 
  Search, 
  AlertTriangle, 
  ShieldAlert, 
  ShieldCheck, 
  ChevronRight,
  Download,
  Users
} from 'lucide-react';
import { usePlatform } from '../../context/PlatformContext';
import { RiskLevel, ContractType } from '../../types/churn';
import { exportToCSV } from '../../utils/mlEngine';
import { EmptyState } from '../common/EmptyState';

export const CustomerIntelligence: React.FC = () => {
  const { 
    customers, 
    drillDownToCustomer, 
    searchQuery, 
    setSearchQuery,
    highRiskCount,
    mediumRiskCount,
    lowRiskCount,
    riskFilter,
    setRiskFilter,
    formatCurrency
  } = usePlatform();

  const [contractFilter, setContractFilter] = useState<'All' | ContractType>('All');
  const [selectedSegment, setSelectedSegment] = useState<string>('All');

  // Customer Segments Aggregation
  const segments = useMemo(() => {
    const map: Record<string, { count: number; highRisk: number; avgCharges: number; totalMRR: number }> = {};
    customers.forEach(c => {
      const seg = c.segment || 'Standard Consumer';
      if (!map[seg]) {
        map[seg] = { count: 0, highRisk: 0, avgCharges: 0, totalMRR: 0 };
      }
      map[seg].count++;
      if (c.churnProbability > 0.70) map[seg].highRisk++;
      map[seg].totalMRR += c.monthlyCharges;
    });

    return Object.entries(map).map(([name, data]) => ({
      name,
      count: data.count,
      highRisk: data.highRisk,
      churnRate: Number(((data.highRisk / (data.count || 1)) * 100).toFixed(1)),
      avgCharges: Number((data.totalMRR / (data.count || 1)).toFixed(2)),
      totalMRR: Math.round(data.totalMRR),
    }));
  }, [customers]);

  // Filtered customer list - strict risk filtering per tab
  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches = c.name.toLowerCase().includes(q) || 
                        c.id.toLowerCase().includes(q) || 
                        c.email.toLowerCase().includes(q) ||
                        c.phone.includes(q);
        if (!matches) return false;
      }
      // Strict Risk tab filter
      if (riskFilter === 'High' && !(c.churnProbability > 0.70)) return false;
      if (riskFilter === 'Medium' && !(c.churnProbability >= 0.35 && c.churnProbability <= 0.70)) return false;
      if (riskFilter === 'Low' && !(c.churnProbability < 0.35)) return false;

      // Contract
      if (contractFilter !== 'All' && c.contract !== contractFilter) return false;

      // Segment
      if (selectedSegment !== 'All' && c.segment !== selectedSegment) return false;

      return true;
    });
  }, [customers, searchQuery, riskFilter, contractFilter, selectedSegment]);

  // Empty state handling
  if (customers.length === 0) {
    return (
      <div className="space-y-6 pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Subscriber Risk & Cohort Intelligence
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Segment telecom subscriber behavior, monitor high-risk cohorts, and execute targeted retention interventions.
            </p>
          </div>
        </div>

        <EmptyState
          title="No risk segments available."
          description="Upload and score a telecom dataset first."
          buttonText="Go to Telecom Data Center"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header - Subtitle banner removed */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Subscriber Risk & Cohort Intelligence
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Segment telecom subscriber behavior, monitor high-risk cohorts, and execute targeted retention interventions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportToCSV(filteredCustomers, 'filtered_subscribers.csv')}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" />
            <span>Export View ({filteredCustomers.length})</span>
          </button>
        </div>
      </div>

      {/* Customer Segmentation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {segments.slice(0, 4).map((seg) => (
          <div
            key={seg.name}
            onClick={() => setSelectedSegment(selectedSegment === seg.name ? 'All' : seg.name)}
            className={`rounded-2xl border p-4 cursor-pointer transition-all ${
              selectedSegment === seg.name
                ? 'border-rose-500 bg-rose-50/40 shadow-sm ring-1 ring-rose-500'
                : 'border-slate-200/80 bg-white hover:border-slate-300 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 truncate max-w-[140px]">{seg.name}</span>
              <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                seg.churnRate > 40 ? 'bg-rose-100 text-rose-700' :
                seg.churnRate > 20 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
              }`}>
                {seg.churnRate}% Churn
              </span>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-xl font-bold font-mono text-slate-800">{seg.count}</span>
              <span className="text-xs text-slate-500 font-medium">{formatCurrency(seg.avgCharges)}/mo avg</span>
            </div>
            <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
              <span>MRR: {formatCurrency(seg.totalMRR)}</span>
              <span className="font-semibold text-rose-600">{seg.highRisk} at risk</span>
            </div>
          </div>
        ))}
      </div>

      {/* Risk Dashboard Filter Tabs - Strict Thresholds: >70% High, 35-70% Medium, <35% Low */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        {/* Risk Level Selector */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setRiskFilter('All')}
            className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition-all cursor-pointer ${
              riskFilter === 'All'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            All Subscribers ({customers.length})
          </button>
          <button
            onClick={() => setRiskFilter('High')}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all cursor-pointer ${
              riskFilter === 'High'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-rose-700 hover:bg-rose-50'
            }`}
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>High Risk (&gt;70%)</span>
            <span className="rounded-full bg-rose-100 text-rose-800 px-1.5 py-0.2 text-[10px] ml-1">
              {highRiskCount}
            </span>
          </button>
          <button
            onClick={() => setRiskFilter('Medium')}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all cursor-pointer ${
              riskFilter === 'Medium'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-amber-700 hover:bg-amber-50'
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>Medium Risk (35-70%)</span>
            <span className="rounded-full bg-amber-100 text-amber-800 px-1.5 py-0.2 text-[10px] ml-1">
              {mediumRiskCount}
            </span>
          </button>
          <button
            onClick={() => setRiskFilter('Low')}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all cursor-pointer ${
              riskFilter === 'Low'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Low Risk (&lt;35%)</span>
            <span className="rounded-full bg-emerald-100 text-emerald-800 px-1.5 py-0.2 text-[10px] ml-1">
              {lowRiskCount}
            </span>
          </button>
        </div>

        {/* Search & Contract Filter (Network Filter Removed) */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="h-3.5 w-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search subscribers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-rose-500 w-44 sm:w-52"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 font-medium">Contract:</span>
            <select
              value={contractFilter}
              onChange={(e) => setContractFilter(e.target.value as any)}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-rose-500 cursor-pointer"
            >
              <option value="All">All Contracts</option>
              <option value="Month-to-month">Month-to-month</option>
              <option value="One year">One year</option>
              <option value="Two year">Two year</option>
            </select>
          </div>

          {(contractFilter !== 'All' || selectedSegment !== 'All' || searchQuery.trim()) && (
            <button
              onClick={() => {
                setContractFilter('All');
                setSelectedSegment('All');
                setSearchQuery('');
              }}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 ml-1 cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Main Customer Risk Table - SHAP & Retention Action removed (Delegated strictly to Customer 360) */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Subscriber Churn Roster ({filteredCustomers.length})
            </h3>
            <p className="text-xs text-slate-500">
              Ranked by predicted churn probability and revenue exposure
            </p>
          </div>
          <span className="text-xs font-medium text-slate-500">
            Strict risk tier segmentation
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Subscriber</th>
                <th className="py-3 px-4">Contract & Plan</th>
                <th className="py-3 px-4">Tenure & Charges</th>
                <th className="py-3 px-4">Churn Probability</th>
                <th className="py-3 px-4">Cohort Segment</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No subscribers found matching the specified filters.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{cust.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{cust.id} • {cust.phone}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{cust.contract}</div>
                      <div className="text-[11px] text-slate-500">{cust.internetService}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-slate-900">{formatCurrency(cust.monthlyCharges)}/mo</div>
                      <div className="text-[11px] text-slate-500">{cust.tenureMonths} mos tenure</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div 
                            className={`h-full ${
                              cust.churnProbability > 0.70 ? 'bg-rose-500' :
                              cust.churnProbability >= 0.35 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${cust.churnProbability * 100}%` }}
                          />
                        </div>
                        <span className={`font-mono font-bold ${
                          cust.churnProbability > 0.70 ? 'text-rose-600' :
                          cust.churnProbability >= 0.35 ? 'text-amber-600' : 'text-emerald-600'
                        }`}>
                          {(cust.churnProbability * 100).toFixed(0)}%
                        </span>
                      </div>
                      <span className={`inline-block rounded px-1.5 py-0.2 text-[9px] font-bold uppercase mt-1 ${
                        cust.churnProbability > 0.70 ? 'bg-rose-50 text-rose-700' :
                        cust.churnProbability >= 0.35 ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        {cust.churnProbability > 0.70 ? 'High' : cust.churnProbability >= 0.35 ? 'Medium' : 'Low'} Risk
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-block rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-700">
                        {cust.segment || 'Standard Consumer'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => drillDownToCustomer(cust.id)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-rose-600 shadow-xs hover:border-rose-300 hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        <span>Customer 360</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
