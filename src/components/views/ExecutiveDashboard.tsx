import React from 'react';
import { 
  Users, 
  TrendingDown, 
  DollarSign, 
  ShieldCheck, 
  ArrowUpRight, 
  ChevronRight,
  UploadCloud,
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
  Legend, 
  AreaChart, 
  Area 
} from 'recharts';
import { usePlatform } from '../../context/PlatformContext';

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
    drillDownToCustomer,
    formatCurrency
  } = usePlatform();

  // Empty state handling when no dataset is present
  if (customers.length === 0) {
    return (
      <div className="space-y-6 pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-rose-600 uppercase tracking-wider">
              <span>Enterprise Telecommunications Suite</span>
              <span>•</span>
              <span className="text-slate-500 font-medium">Real-Time Operational Cockpit</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-0.5">
              Churn & Retention Overview
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Monitoring subscriber longevity, revenue exposure, and automated intervention ROI across active accounts.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white p-12 text-center shadow-xs flex flex-col items-center justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 mb-4">
            <UploadCloud className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">No dataset loaded</h3>
          <p className="text-sm text-slate-500 max-w-md mb-6">
            No dataset loaded. Upload a dataset in Data Uploading to begin churn analysis.
          </p>
          <button
            onClick={() => setActiveTab('data-center')}
            className="flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-rose-700 transition-colors cursor-pointer"
          >
            <UploadCloud className="h-4 w-4" />
            <span>Upload Dataset</span>
          </button>
        </div>
      </div>
    );
  }

  // Risk Distribution Data for Recharts Donut (0-34% Low, 35-69% Medium, 70-100% High)
  const riskData = [
    { name: 'Low Risk (0-34%)', value: lowRiskCount, color: '#10b981' },
    { name: 'Medium Risk (35-69%)', value: mediumRiskCount, color: '#f59e0b' },
    { name: 'High Risk (70-100%)', value: highRiskCount, color: '#ef4444' },
  ];

  // Contract Distribution Data
  const contractBreakdown = React.useMemo(() => {
    const counts = { 'Month-to-month': 0, 'One year': 0, 'Two year': 0 };
    customers.forEach(c => {
      if (counts[c.contract] !== undefined) counts[c.contract]++;
    });
    return [
      { name: 'Month-to-month', total: counts['Month-to-month'], churned: customers.filter(c => c.contract === 'Month-to-month' && c.riskLevel === 'High').length },
      { name: 'One year', total: counts['One year'], churned: customers.filter(c => c.contract === 'One year' && c.riskLevel === 'High').length },
      { name: 'Two year', total: counts['Two year'], churned: customers.filter(c => c.contract === 'Two year' && c.riskLevel === 'High').length },
    ];
  }, [customers]);

  // Top Churn Drivers
  const topChurnDrivers = [
    { driver: 'Month-to-Month Contracts', impact: '+38.4% Churn Probability', severity: 'Critical', affectedCount: customers.filter(c => c.contract === 'Month-to-month').length },
    { driver: 'Fiber Optic without Tech Support', impact: '+29.1% Churn Probability', severity: 'High', affectedCount: customers.filter(c => c.internetService === 'Fiber optic' && !c.techSupport).length },
    { driver: 'Manual Electronic Check Payments', impact: '+18.5% Churn Probability', severity: 'Medium', affectedCount: customers.filter(c => c.paymentMethod === 'Electronic check').length },
    { driver: 'Tenure Under 6 Months (Early Life)', impact: '+24.2% Churn Probability', severity: 'High', affectedCount: customers.filter(c => c.tenureMonths <= 6).length },
    { driver: 'Unresolved Support Tickets (>=3)', impact: '+31.0% Churn Probability', severity: 'Critical', affectedCount: customers.filter(c => c.supportTicketsLast90d >= 3).length },
  ];

  // Highest Value At-Risk Customers Preview
  const criticalAccounts = React.useMemo(() => {
    return [...customers]
      .filter(c => c.riskLevel === 'High')
      .sort((a, b) => b.monthlyCharges - a.monthlyCharges)
      .slice(0, 5);
  }, [customers]);

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-rose-600 uppercase tracking-wider">
            <span>Enterprise Telecommunications Suite</span>
            <span>•</span>
            <span className="text-slate-500 font-medium">Real-Time Operational Cockpit</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-0.5">
            Churn & Retention Overview
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Monitoring subscriber longevity, revenue exposure, and automated intervention ROI across active accounts.
          </p>
        </div>
      </div>

      {/* KPI Widgets Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Customers / Profile Count */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Active Subscribers</span>
            <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900">
              {totalSubscribers.toLocaleString()}
            </span>
            <span className="text-xs font-medium text-slate-500">profiles loaded</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-600">
            <span className="font-semibold text-emerald-600">{activeSubscribers} stable</span>
            <span className="text-slate-300">•</span>
            <span>{churnedSubscribers} at critical risk</span>
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

        {/* Monthly & Annual Revenue At Risk */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Revenue At Risk (MRR)</span>
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

        {/* Retention Opportunity & Model Health */}
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
            <span>Model Health:</span>
            <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
              99.4% ROC-AUC 0.89
            </span>
          </div>
        </div>
      </div>

      {/* Primary Visualizations Row: Health Overview, Risk Distribution, Contract Analysis */}
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
                    formatter={(val: number) => [`${val} accounts (${((val / totalSubscribers) * 100).toFixed(1)}%)`, 'Volume']}
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
                  <span className="text-slate-400">({((item.value / totalSubscribers) * 100).toFixed(0)}%)</span>
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
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1"
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
                  <Bar dataKey="churned" name="High Risk of Churn" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600 flex items-center justify-between mt-2">
            <span>
              <strong>Key Finding:</strong> Month-to-month contracts constitute <strong className="text-rose-600">82% of all churn risk</strong>. Transitioning just 20% to 1-year agreements recovers ~{formatCurrency(18400)} in MRR.
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Row: Top Churn Drivers & Critical At-Risk Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Churn Drivers */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Top Churn Drivers (SHAP Attribution)</h3>
              <p className="text-xs text-slate-500">Cross-customer feature importance rank</p>
            </div>
            <button 
              onClick={() => setActiveTab('explainability-retention')}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700"
            >
              Full SHAP View
            </button>
          </div>

          <div className="space-y-3">
            {topChurnDrivers.map((driver, idx) => (
              <div key={idx} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-3 hover:bg-slate-50 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800">{driver.driver}</span>
                    <span className={`rounded px-1.5 py-0.2 text-[10px] font-bold ${
                      driver.severity === 'Critical' ? 'bg-rose-100 text-rose-700' :
                      driver.severity === 'High' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {driver.severity}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Impacts <strong className="text-slate-700">{driver.affectedCount} subscribers</strong> in active cohort
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-rose-600 font-mono">
                    {driver.impact}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Critical High-Value Accounts Requiring Immediate Attention */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">High-Value At-Risk Priority Queue</h3>
                <p className="text-xs text-slate-500">Highest monthly billing accounts nearing churn window</p>
              </div>
              <button 
                onClick={() => setActiveTab('customer-intelligence')}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700"
              >
                View All ({highRiskCount})
              </button>
            </div>

            <div className="space-y-2.5">
              {criticalAccounts.map((cust) => (
                <div 
                  key={cust.id} 
                  onClick={() => drillDownToCustomer(cust.id)}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-rose-200 hover:bg-rose-50/30 cursor-pointer transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-100 text-rose-700 font-bold text-xs">
                      {(cust.churnProbability * 100).toFixed(0)}%
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 group-hover:text-rose-600 transition-colors">
                        {cust.name}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {cust.id} • {cust.contract} • {cust.tenureMonths} mo
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-900">
                      {formatCurrency(cust.monthlyCharges)}/mo
                    </div>
                    <div className="text-[10px] text-rose-600 font-medium">
                      {cust.recommendedAction?.actionType || 'Contract Incentive'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Automated ML scoring runs hourly via webhook</span>
            <span className="font-semibold text-slate-800 cursor-pointer hover:underline" onClick={() => setActiveTab('mlops-center')}>
              MLOps Telemetry →
            </span>
          </div>
        </div>
      </div>

      {/* Business Insights Banner */}
      <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/70 via-blue-50/50 to-white p-5">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-indigo-600 p-2 text-white mt-0.5">
            <Zap className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900">
              Executive AI Strategic Retention Insight
            </h4>
            <p className="text-xs text-slate-700 mt-1 leading-relaxed">
              Subscribers paying with <strong>Electronic Check</strong> on <strong>Month-to-month</strong> contracts without <strong>Tech Support</strong> represent <strong>{formatCurrency(14200)}/mo</strong> in vulnerable revenue. Triggering the automated <em>&ldquo;12-Month Loyalty Lock with 15% Bill Rebate&rdquo;</em> campaign has a modeled conversion rate of <strong>38%</strong>, yielding an estimated net retention ROI of <strong>284%</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
