import React, { useState } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  ShieldCheck, 
  PiggyBank, 
  BarChart3, 
  Calculator, 
  ArrowUpRight, 
  Percent, 
  CheckCircle2, 
  Award,
  Layers
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  Legend 
} from 'recharts';
import { usePlatform } from '../../context/PlatformContext';
import { EmptyState } from '../common/EmptyState';

export const BusinessImpact: React.FC = () => {
  const { 
    totalRevenueAtRiskMonthly, 
    totalRevenueAtRiskAnnual, 
    potentialAnnualSavings, 
    highRiskCount, 
    totalSubscribers,
    formatCurrency,
    currencyConfig
  } = usePlatform();

  // Empty state handling
  if (totalSubscribers === 0) {
    return (
      <div className="space-y-6 pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Revenue Impact & ROI
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Quantify revenue protected by proactive ML interventions, run financial budget scenarios, and measure cohort retention lift.
            </p>
          </div>
        </div>

        <EmptyState
          title="No financial data available."
          description="Upload a telecom dataset to project retention ROI."
          buttonText="Go to Telecom Data Center"
        />
      </div>
    );
  }

  // Interactive ROI Calculator sliders
  const [retentionBudget, setRetentionBudget] = useState<number>(25000);
  const [averageOfferCost, setAverageOfferCost] = useState<number>(45);
  const [saveSuccessRate, setSaveSuccessRate] = useState<number>(35);

  // Computed ROI
  const targetedAccounts = Math.min(highRiskCount * 3, Math.floor(retentionBudget / averageOfferCost));
  const savedAccounts = Math.round(targetedAccounts * (saveSuccessRate / 100));
  const preservedARR = savedAccounts * 860; // average ARPU * 12
  const netProfit = preservedARR - retentionBudget;
  const roiMultiplier = Number(((netProfit / (retentionBudget || 1)) * 100).toFixed(0));

  // Executive revenue projection timeline (12-month model)
  const revenueTimeline = [
    { month: 'Jan', atRisk: 18200, savedRevenue: 12400, netExposure: 5800 },
    { month: 'Feb', atRisk: 19400, savedRevenue: 14100, netExposure: 5300 },
    { month: 'Mar', atRisk: 21000, savedRevenue: 16200, netExposure: 4800 },
    { month: 'Apr', atRisk: 19800, savedRevenue: 15900, netExposure: 3900 },
    { month: 'May', atRisk: 22400, savedRevenue: 18100, netExposure: 4300 },
    { month: 'Jun', atRisk: 24100, savedRevenue: 19800, netExposure: 4300 },
    { month: 'Jul', atRisk: 23500, savedRevenue: 20100, netExposure: 3400 },
    { month: 'Aug', atRisk: 25800, savedRevenue: 22400, netExposure: 3400 },
    { month: 'Sep', atRisk: 24900, savedRevenue: 21900, netExposure: 3000 },
    { month: 'Oct', atRisk: 26200, savedRevenue: 23600, netExposure: 2600 },
    { month: 'Nov', atRisk: 27100, savedRevenue: 24800, netExposure: 2300 },
    { month: 'Dec', atRisk: 28500, savedRevenue: 26400, netExposure: 2100 },
  ];

  // Campaign Effectiveness Cohort Lift
  const cohortEffectiveness = [
    { cohort: 'Fiber 1Gbps Plan', withoutChurnGuard: 34.2, withChurnGuard: 14.8, lift: 19.4 },
    { cohort: 'Month-to-Month Streamers', withoutChurnGuard: 42.1, withChurnGuard: 18.5, lift: 23.6 },
    { cohort: '5G Home Broadband', withoutChurnGuard: 28.6, withChurnGuard: 11.2, lift: 17.4 },
    { cohort: 'Enterprise Family Pack', withoutChurnGuard: 18.4, withChurnGuard: 7.1, lift: 11.3 },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header - Subtitle banner removed */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Revenue Impact & ROI
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Quantify revenue protected by proactive ML interventions, run financial budget scenarios, and measure cohort retention lift.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 font-bold shadow-2xs">
            Currency: {currencyConfig.label} ({currencyConfig.symbol})
          </span>
        </div>
      </div>

      {/* Top Financial Scorecards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Gross MRR At Risk</span>
            <div className="rounded-lg bg-rose-50 p-2 text-rose-600">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold font-mono text-rose-600">
            {formatCurrency(totalRevenueAtRiskMonthly)}
            <span className="text-xs font-normal text-slate-500 font-sans">/mo</span>
          </div>
          <div className="mt-1 text-xs text-slate-500">
            {formatCurrency(totalRevenueAtRiskAnnual)} annualized exposure
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Revenue Protected</span>
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold font-mono text-emerald-600">
            {formatCurrency(potentialAnnualSavings)}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Preserved through automated offers
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Retention Program ROI</span>
            <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
              <PiggyBank className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold font-mono text-indigo-600">
            {roiMultiplier}%
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Net return per dollar invested
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Average Churn Deflection</span>
            <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
              <Percent className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold font-mono text-slate-900">
            -18.4%
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Absolute reduction in cohort attrition
          </div>
        </div>
      </div>

      {/* Main Visualizations: Revenue Preserved Area Timeline & Interactive ROI Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline Area Chart (Exposed vs. Preserved) */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Revenue Preservation Trajectory (12 Months)
                </h3>
                <p className="text-xs text-slate-500">
                  Total revenue at risk vs. cumulative recurring revenue recovered by ChurnGuard
                </p>
              </div>
              <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                +84% Net Defection Recovery
              </span>
            </div>

            <div className="h-72 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueTimeline}>
                  <defs>
                    <linearGradient id="colorAtRisk" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorSaved" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} tickFormatter={(v) => formatCurrency(v, { compact: true })} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px', border: 'none' }}
                    formatter={(val: number) => [formatCurrency(val), '']}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Area type="monotone" dataKey="atRisk" name="Gross Revenue At Risk" stroke="#f43f5e" fillOpacity={1} fill="url(#colorAtRisk)" />
                  <Area type="monotone" dataKey="savedRevenue" name="Revenue Preserved by ChurnGuard" stroke="#10b981" fillOpacity={1} fill="url(#colorSaved)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-4 rounded-xl bg-slate-50 p-3 text-xs text-slate-600 flex items-center justify-between">
            <span>
              <strong>Net Attrition Deficit:</strong> Unrecovered churn compressed from {formatCurrency(5800)}/mo to {formatCurrency(2100)}/mo over 12 billing cycles.
            </span>
          </div>
        </div>

        {/* Dynamic ROI Scenario Planner Card */}
        <div className="rounded-2xl border-2 border-indigo-200 bg-gradient-to-b from-indigo-50/40 via-white to-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Calculator className="h-5 w-5 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-900">Retention ROI Simulator</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Model budgetary inputs vs. net saved customer lifetime value
            </p>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1">
                  <span>Intervention Budget</span>
                  <span className="font-mono text-indigo-600">{formatCurrency(retentionBudget)}</span>
                </div>
                <input
                  type="range"
                  min="5000"
                  max="100000"
                  step="5000"
                  value={retentionBudget}
                  onChange={(e) => setRetentionBudget(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1">
                  <span>Avg Incentive / Account</span>
                  <span className="font-mono text-indigo-600">{formatCurrency(averageOfferCost)}</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="120"
                  step="5"
                  value={averageOfferCost}
                  onChange={(e) => setAverageOfferCost(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1">
                  <span>Modeled Save Rate (%)</span>
                  <span className="font-mono text-indigo-600">{saveSuccessRate}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="65"
                  step="1"
                  value={saveSuccessRate}
                  onChange={(e) => setSaveSuccessRate(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>
            </div>

            {/* Simulation output summary */}
            <div className="mt-5 rounded-xl border border-indigo-100 bg-white p-4 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Interventions Funded:</span>
                <strong className="text-slate-900 font-mono">{targetedAccounts} accounts</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Subscribers Retained:</span>
                <strong className="text-emerald-600 font-mono">{savedAccounts} accounts</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Preserved Annual ARR:</span>
                <strong className="text-slate-900 font-mono">{formatCurrency(preservedARR)}</strong>
              </div>
              <div className="border-t border-slate-100 pt-2 flex justify-between font-bold text-sm">
                <span>Net Return:</span>
                <span className="text-emerald-600 font-mono">{netProfit >= 0 ? '+' : ''}{formatCurrency(netProfit)}</span>
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-xl bg-indigo-600 py-2.5 px-4 text-center text-xs font-bold text-white shadow-xs">
            Projected Net Program ROI: {roiMultiplier}%
          </div>
        </div>
      </div>

      {/* Cohort Campaign Effectiveness Table */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Retention Campaign Effectiveness by Subscriber Cohort
            </h3>
            <p className="text-xs text-slate-500">
              Controlled comparison of churn rates with and without automated algorithmic intervention
            </p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Cohort Classification</th>
                <th className="py-3 px-4">Baseline Churn (Unassisted)</th>
                <th className="py-3 px-4">Churn with ChurnGuard Interventions</th>
                <th className="py-3 px-4">Net Retention Lift</th>
                <th className="py-3 px-4 text-right">Efficacy Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cohortEffectiveness.map((c, i) => (
                <tr key={i} className="hover:bg-slate-50/60">
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {c.cohort}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-rose-600 font-semibold">
                    {c.withoutChurnGuard}%
                  </td>
                  <td className="py-3.5 px-4 font-mono text-emerald-600 font-bold">
                    {c.withChurnGuard}%
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-indigo-600">
                    +{c.lift}% reduction
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                      High Impact
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
