import React, { useState } from 'react';
import { 
  HelpCircle, 
  Sparkles, 
  BarChart2, 
  CheckCircle2, 
  TrendingUp, 
  DollarSign, 
  ShieldCheck, 
  ArrowRight,
  Send,
  Zap,
  Award
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  ReferenceLine 
} from 'recharts';
import { usePlatform } from '../../context/PlatformContext';

export const ExplainabilityRetention: React.FC = () => {
  const { 
    customers, 
    selectedCustomerId, 
    setSelectedCustomerId, 
    selectedCustomer, 
    drillDownToCustomer,
    formatCurrency,
    formatCurrencyText
  } = usePlatform();

  // Global SHAP feature importance ranking (mean |SHAP| across dataset)
  const globalShapData = [
    { feature: 'Contract: Month-to-Month', importance: 0.88, category: 'Contract Commitment', direction: 'Strong Risk Accelerant', color: '#ef4444' },
    { feature: 'Tenure <= 6 Months (Early Life)', importance: 0.72, category: 'Account Longevity', direction: 'Early Attrition Risk', color: '#ef4444' },
    { feature: 'Fiber optic without Tech Support', importance: 0.64, category: 'Service Shielding', direction: 'Unassisted Churn Risk', color: '#f97316' },
    { feature: 'Support Escalations >= 3 Tickets', importance: 0.58, category: 'Customer Experience', direction: 'Service Friction', color: '#ef4444' },
    { feature: `High Monthly Charges (> ${formatCurrency(85)})`, importance: 0.52, category: 'Pricing Sensitivity', direction: 'Competitor Defection', color: '#f97316' },
    { feature: 'Electronic Check Payment Method', importance: 0.38, category: 'Billing Experience', direction: 'Manual Churn Friction', color: '#fbbf24' },
    { feature: 'Contract: Two-Year Lock', importance: 0.95, category: 'Contract Commitment', direction: 'Anchor Protection', color: '#10b981' },
    { feature: 'Tenure > 24 Months', importance: 0.65, category: 'Account Longevity', direction: 'High Loyalty Protection', color: '#10b981' },
    { feature: 'Auto-Pay Bank Transfer / CC', importance: 0.32, category: 'Billing Experience', direction: 'Passive Continuity', color: '#10b981' },
  ];

  // Retention Action Playbook catalog with modeled campaign ROI
  const retentionCampaigns = [
    {
      id: 'camp-1',
      title: '12-Month Loyalty Lock with 15% Bill Credit',
      targetCohort: `Month-to-month subscribers with > ${formatCurrency(70)}/mo charges`,
      targetSize: customers.filter(c => c.contract === 'Month-to-month' && c.monthlyCharges > 70).length,
      averageIncentiveCost: 65,
      expectedConversionRate: 38,
      annualRevenuePreservedPerUser: 840,
      channel: 'Outbound VIP Call Center',
      netROI: '392%',
      status: 'Active Campaign',
    },
    {
      id: 'camp-2',
      title: 'Complimentary 1Gbps Fiber & Mesh Wi-Fi Boost',
      targetCohort: 'Fiber customers experiencing >= 2 network tickets',
      targetSize: customers.filter(c => c.internetService === 'Fiber optic' && c.supportTicketsLast90d >= 2).length,
      averageIncentiveCost: 40,
      expectedConversionRate: 32,
      annualRevenuePreservedPerUser: 620,
      channel: 'MyTelco Mobile App In-App Card',
      netROI: '315%',
      status: 'Active Campaign',
    },
    {
      id: 'camp-3',
      title: `Auto-Pay Enrollment Bonus (${formatCurrency(30)} Total Credit)`,
      targetCohort: 'Electronic check payers on high risk boundary',
      targetSize: customers.filter(c => c.paymentMethod === 'Electronic check').length,
      averageIncentiveCost: 30,
      expectedConversionRate: 44,
      annualRevenuePreservedPerUser: 480,
      channel: 'Automated SMS Push with 1-Click Pay',
      netROI: '420%',
      status: 'Active Campaign',
    },
    {
      id: 'camp-4',
      title: 'Free Cybersecurity & Family Cloud Bundle',
      targetCohort: 'Long tenure customers without active tech protection',
      targetSize: customers.filter(c => c.tenureMonths > 12 && !c.onlineSecurity).length,
      averageIncentiveCost: 20,
      expectedConversionRate: 26,
      annualRevenuePreservedPerUser: 360,
      channel: 'Email Direct + Customer Portal',
      netROI: '280%',
      status: 'Scheduled',
    },
  ];

  // Individual customer SHAP breakdown
  const individualCustomer = selectedCustomer || customers[0];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-rose-600 uppercase tracking-wider">
            <span>Explainable AI & Retention Engineering</span>
            <span>•</span>
            <span className="text-slate-500 font-medium">SHAP Diagnostics</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-0.5">
            Top Churn Drivers
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Understand why telecom subscribers leave at aggregate and individual levels, and prescribe automated retention treatments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 font-semibold shadow-2xs">
            Kernel: TreeSHAP Fast Explainer
          </div>
        </div>
      </div>

      {/* SECTION 1: Why Customers Leave (Global Feature Importance) */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-rose-600" />
              <h3 className="text-base font-bold text-slate-900">
                Why Customers Leave: Global SHAP Feature Importance
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Mean absolute SHAP value impact across the active subscriber dataset
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
              <span className="text-slate-600 font-medium">Increases Churn Propensity</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <span className="text-slate-600 font-medium">Protects Subscriber Retention</span>
            </div>
          </div>
        </div>

        {/* Global SHAP Horizontal Bar Chart */}
        <div className="h-72 w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={globalShapData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
            >
              <XAxis type="number" stroke="#64748b" fontSize={11} domain={[0, 1.1]} />
              <YAxis dataKey="feature" type="category" stroke="#1e293b" fontSize={11} tickLine={false} width={220} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px', border: 'none' }}
                formatter={(val: number, name: string, item: any) => [
                  `${val} mean |SHAP| (${item.payload.direction})`,
                  'Attribution Weight'
                ]}
              />
              <Bar dataKey="importance" radius={[0, 4, 4, 0]}>
                {globalShapData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Key takeaway cards */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-100 pt-5">
          <div className="rounded-xl bg-slate-50 p-3.5 text-xs text-slate-700">
            <strong className="text-slate-900 block font-bold mb-1">1. Contract Duration Dominates</strong>
            Month-to-month contracts are the #1 predictor of churn (+0.88 log-odds). Customers on annual commitments defect 4.2x less frequently.
          </div>
          <div className="rounded-xl bg-slate-50 p-3.5 text-xs text-slate-700">
            <strong className="text-slate-900 block font-bold mb-1">2. Support Vulnerability</strong>
            Fiber optic accounts with 3+ customer service escalations exhibit a 71% churn velocity. Rapid technician dispatch directly restores loyalty.
          </div>
          <div className="rounded-xl bg-slate-50 p-3.5 text-xs text-slate-700">
            <strong className="text-slate-900 block font-bold mb-1">3. Automated Payments Act as Anchor</strong>
            Subscribers on auto-pay demonstrate a -0.32 protective retention factor compared to manual check friction.
          </div>
        </div>
      </div>

      {/* SECTION 2: Individual Customer Explanations & Selector */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Individual Subscriber Churn Drivers (Micro-Explanation)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Select any account to inspect personalized feature attributions and risk triggers
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Pick Subscriber:</span>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.id}) - {(c.churnProbability * 100).toFixed(0)}% Risk
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selected Customer Dossier Quick View */}
        <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 mb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl font-bold font-mono text-sm text-white ${
              individualCustomer.riskLevel === 'High' ? 'bg-rose-600' :
              individualCustomer.riskLevel === 'Medium' ? 'bg-amber-600' : 'bg-emerald-600'
            }`}>
              {(individualCustomer.churnProbability * 100).toFixed(0)}%
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">{individualCustomer.name}</div>
              <div className="text-xs text-slate-500 font-mono">
                {individualCustomer.id} • {individualCustomer.contract} • {individualCustomer.internetService} • {formatCurrency(individualCustomer.monthlyCharges)}/mo
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Matched Retention Action</span>
              <span className="text-xs font-bold text-slate-800">{formatCurrencyText(individualCustomer.recommendedAction?.title || '')}</span>
            </div>
            <button
              onClick={() => drillDownToCustomer(individualCustomer.id)}
              className="rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors"
            >
              Open 360 Simulator
            </button>
          </div>
        </div>

        {/* Individual SHAP table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Observed Attribute</th>
                <th className="py-3 px-4">Actual Value</th>
                <th className="py-3 px-4">Force Direction</th>
                <th className="py-3 px-4">Impact Magnitude</th>
                <th className="py-3 px-4">Diagnostic Interpretation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {individualCustomer.shapContributions.map((contrib, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60">
                  <td className="py-3 px-4 font-semibold text-slate-800">
                    {contrib.feature}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600">
                    {formatCurrencyText(String(contrib.value))}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-bold ${
                      contrib.impact > 0 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {contrib.impact > 0 ? 'Elevates Churn' : 'Protective Factor'}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold">
                    <span className={contrib.impact > 0 ? 'text-rose-600' : 'text-emerald-600'}>
                      {contrib.impact > 0 ? `+${contrib.impact.toFixed(2)}` : contrib.impact.toFixed(2)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 text-xs">
                    {formatCurrencyText(contrib.description)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 3: Recommended Retention Actions & Campaign ROI Matrix */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-emerald-600" />
              <h3 className="text-base font-bold text-slate-900">
                Retention Engine: Prescribed Campaign Playbook & ROI
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Financial and conversion projections for automated customer save campaigns
            </p>
          </div>
          <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
            Average Campaign Net ROI: 351%
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {retentionCampaigns.map((camp) => (
            <div key={camp.id} className="rounded-2xl border border-slate-200 bg-white p-5 hover:border-slate-300 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold uppercase text-slate-600">
                    {camp.status}
                  </span>
                  <span className="text-xs font-bold font-mono text-emerald-600">
                    Net ROI: {camp.netROI}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900 mt-2">
                  {camp.title}
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Target Cohort: <strong className="text-slate-700">{camp.targetCohort}</strong> ({camp.targetSize} accounts)
                </p>

                <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-3 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Offer Cost</span>
                    <div className="text-sm font-bold font-mono text-slate-800 mt-0.5">{formatCurrency(camp.averageIncentiveCost)}</div>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Conversion</span>
                    <div className="text-sm font-bold font-mono text-indigo-600 mt-0.5">{camp.expectedConversionRate}%</div>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Saved/Account</span>
                    <div className="text-sm font-bold font-mono text-emerald-600 mt-0.5">{formatCurrency(camp.annualRevenuePreservedPerUser)}</div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">Channel: <strong>{camp.channel}</strong></span>
                <button
                  onClick={() => alert(`Campaign '${camp.title}' triggered across ${camp.targetSize} targeted subscribers via ${camp.channel}.`)}
                  className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 transition-colors shadow-2xs"
                >
                  Execute Campaign
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
