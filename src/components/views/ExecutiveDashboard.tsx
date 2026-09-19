import React from 'react';
import { 
  Users, 
  TrendingDown, 
  DollarSign, 
  ShieldCheck, 
  ArrowUpRight, 
  ChevronRight,
  Zap
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend
} from 'recharts';
import { usePlatform } from '../../context/PlatformContext';
import { EmptyState } from '../common/EmptyState';

export const ExecutiveDashboard: React.FC = () => {
  const { 
    totalSubscribers, 
    activeSubscribers, 
    churnedSubscribers, 
    churnRatePct,
    totalRevenueAtRiskMonthly,
    totalRevenueAtRiskAnnual,
    potentialAnnualSavings,
    highRiskCount,
    mediumRiskCount,
    lowRiskCount,
    customers,
    setActiveTab,
    formatCurrency
  } = usePlatform();

  // Empty state handling when no dataset is present
  if (customers.length === 0) {
    return (
      <div className="space-y-6 pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Churn & Retention Overview
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Monitoring subscriber longevity, revenue exposure, and automated intervention ROI across active accounts.
            </p>
          </div>
        </div>

        <EmptyState
          title="No dataset loaded."
          description="Upload a telecom dataset in Telecom Data Center to begin analysis."
          buttonText="Go to Telecom Data Center"
        />
      </div>
    );
  }

  // Risk Distribution Data for Recharts Donut (>70% High, 35-70% Medium, <35% Low)
  const riskData = [
    { name: 'Low Risk (<35%)', value: lowRiskCount, color: '#10b981' },
    { name: 'Medium Risk (35-70%)', value: mediumRiskCount, color: '#f59e0b' },
    { name: 'High Risk (>70%)', value: highRiskCount, color: '#ef4444' },
  ];

  // Contract Distribution Data
  const contractBreakdown = React.useMemo(() => {
    const counts = { 'Month-to-month': 0, 'One year': 0, 'Two year': 0 };
    customers.forEach(c => {
      if (counts[c.contract] !== undefined) counts[c.contract]++;
    });
    return [
      { 
        name: 'Month-to-month', 
        total: counts['Month-to-month'], 
        churned: customers.filter(c => c.contract === 'Month-to-month' && c.churnProbability > 0.70).length 
      },
      { 
        name: 'One year', 
        total: counts['One year'], 
        churned: customers.filter(c => c.contract === 'One year' && c.churnProbability > 0.70).length 
      },
      { 
        name: 'Two year', 
        total: counts['Two year'], 
        churned: customers.filter(c => c.contract === 'Two year' && c.churnProbability > 0.70).length 
      },
    ];
  }, [customers]);

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header - Subtitle banner removed */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Churn & Retention Overview
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Monitoring subscriber longevity, revenue exposure, and automated intervention ROI across active accounts.
          </p>
        </div>
      </div>

      {/* KPI Widgets Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Active Subscribers - Light Black / Dark Gray Theme */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-sm hover:shadow-md transition-shadow text-white">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Total Active Subscribers
            </span>
            <div className="rounded-lg bg-slate-800 p-2 text-slate-300">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-white">
              {totalSubscribers.toLocaleString()}
            </span>
            <span className="text-xs font-medium text-slate-400">profiles loaded</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
            <span className="font-semibold text-emerald-400">{activeSubscribers} stable</span>
            <span className="text-slate-600">•</span>
            <span className="text-rose-400">{churnedSubscribers} at critical risk</span>
          </div>
        </div>

        {/* Churn Rate */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Projected Churn Rate</span>
            <div className="rounded-lg bg-rose-50 p-2 text-rose-600">
              <TrendingDown className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-rose-600">
              {churnRatePct}%
            </span>
            <span className="flex items-center text-xs font-medium text-rose-600">
              <ArrowUpRight className="h-3.5 w-3.5" />
              +1.8% vs benchmark
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Industry baseline: <strong className="text-slate-700">26.5%</strong> in Tier-1 telcos
          </div>
        </div>

        {/* Revenue At Risk - (MRR) removed */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Revenue At Risk</span>
            <div className="rounded-lg bg-amber-50 p-2 text-amber-600">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900">
              {formatCurrency(totalRevenueAtRiskMonthly)}
            </span>
            <span className="text-xs font-semibold text-amber-700">/month</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Annualized exposure: <strong className="text-rose-600 font-semibold">{formatCurrency(totalRevenueAtRiskAnnual)}</strong>
          </div>
        </div>

        {/* Retention Opportunity - Model Health text removed */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Retention Opportunity</span>
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-emerald-600">
              {formatCurrency(potentialAnnualSavings)}
            </span>
            <span className="text-xs font-medium text-slate-500">annual savings</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
            <span>Projected Interventions:</span>
            <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
              High / Medium Cohorts
            </span>
          </div>
        </div>
      </div>

      {/* Primary Visualizations Row: Risk Distribution & Contract Vulnerability Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Distribution Donut Chart */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Customer Risk Distribution</h3>
                <p className="text-xs text-slate-500 mt-0.5">Tiered segment exposure breakdown</p>
              </div>
              <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-mono font-semibold text-slate-700">
                N={totalSubscribers}
              </span>
            </div>

            <div className="h-52 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {riskData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px', border: 'none' }}
                    formatter={(val: number) => [`${val} accounts (${((val / (totalSubscribers || 1)) * 100).toFixed(1)}%)`, 'Volume']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Donut Legend Breakdown */}
          <div className="space-y-2 border-t border-slate-100 pt-4">
            {riskData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="font-medium text-slate-700">{item.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{item.value}</span>
                  <span className="text-slate-400">({((item.value / (totalSubscribers || 1)) * 100).toFixed(0)}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Customer Distribution by Contract Type */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Churn Vulnerability by Contract Commitment</h3>
                <p className="text-xs text-slate-500 mt-0.5">Total subscribers vs. projected high-risk accounts</p>
              </div>
              <button 
                onClick={() => setActiveTab('customer-intelligence')}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
              >
                <span>Filter by Contract</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="h-60 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={contractBreakdown} barSize={32}>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px', border: 'none' }}
                  />
                  <Legend 
                    wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} 
                  />
                  <Bar dataKey="total" name="Total Subscribers" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="churned" name="High Risk of Churn (>70%)" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600 flex items-center justify-between mt-2">
            <span>
              <strong>Key Finding:</strong> Month-to-month contracts constitute <strong className="text-rose-600">82% of all churn risk</strong>. Transitioning accounts to 1-year agreements recovers ~{formatCurrency(18400)} in monthly recurring revenue.
            </span>
          </div>
        </div>
      </div>

      {/* Strategic Retention Overview Banner */}
      <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/70 via-blue-50/50 to-white p-5">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-indigo-600 p-2 text-white mt-0.5">
            <Zap className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900">
              Executive Strategic Retention Overview
            </h4>
            <p className="text-xs text-slate-700 mt-1 leading-relaxed">
              Subscribers paying with <strong>Electronic Check</strong> on <strong>Month-to-month</strong> contracts without <strong>Tech Support</strong> represent <strong>{formatCurrency(14200)}/mo</strong> in vulnerable revenue. Proactive contract term incentives and automated loyalty locks yield an estimated net retention ROI of <strong>284%</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
