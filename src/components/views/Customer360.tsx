import React from 'react';
import { 
  UserCheck, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Sliders, 
  RotateCcw, 
  ArrowDown, 
  ArrowUp, 
  DollarSign, 
  Calendar, 
  Wifi, 
  Check, 
  X, 
  Sparkles, 
  Phone, 
  Mail, 
  CreditCard,
  Send,
  Zap,
  TrendingDown
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
import { ContractType, InternetServiceType, PaymentMethodType } from '../../types/churn';

export const Customer360: React.FC = () => {
  const { 
    customers, 
    selectedCustomerId, 
    setSelectedCustomerId, 
    selectedCustomer,
    whatIfParams,
    updateWhatIfParams,
    resetWhatIfParams,
    whatIfResult,
    formatCurrency,
    formatCurrencyText
  } = usePlatform();

  if (!selectedCustomer || !whatIfParams || !whatIfResult) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500">
        Loading subscriber intelligence profile...
      </div>
    );
  }

  // Waterfall/diverging bar data for SHAP feature contributions
  const shapChartData = selectedCustomer.shapContributions.map(sc => ({
    name: sc.feature,
    impact: Number(sc.impact.toFixed(2)),
    valDesc: formatCurrencyText(String(sc.value)),
    description: formatCurrencyText(sc.description),
    color: sc.impact > 0 ? '#ef4444' : '#10b981',
  }));

  const probDeltaPct = Number((whatIfResult.deltaProbability * 100).toFixed(1));
  const isReduced = probDeltaPct < 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Customer Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-rose-600 uppercase tracking-wider">
            <span>Customer 360 & Predictive Simulation</span>
            <span>•</span>
            <span className="text-slate-500 font-medium">Account ID: {selectedCustomer.id}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-0.5">
            {selectedCustomer.name}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Holistic subscriber telemetry, explainable ML churn drivers, and real-time retention simulation.
          </p>
        </div>

        {/* Customer Quick Selector Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-500">Switch Customer:</label>
          <select
            value={selectedCustomerId}
            onChange={(e) => setSelectedCustomerId(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-rose-500 focus:outline-none shadow-xs max-w-xs"
          >
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.id}) - {(c.churnProbability * 100).toFixed(0)}% Risk [{c.riskLevel}]
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Primary 360 Grid: Profile Summary + Churn Probability Card + Retention Recommendation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Profile Dossier */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white font-bold text-base shadow-sm">
                  {selectedCustomer.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{selectedCustomer.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-mono">{selectedCustomer.id}</span>
                    <span>•</span>
                    <span className="text-slate-700 font-medium">{selectedCustomer.segment}</span>
                  </div>
                </div>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                selectedCustomer.riskLevel === 'High' ? 'bg-rose-100 text-rose-700' :
                selectedCustomer.riskLevel === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
              }`}>
                {selectedCustomer.riskLevel} Risk
              </span>
            </div>

            {/* Demographics & Contact */}
            <div className="mt-4 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-slate-600">
                <Mail className="h-3.5 w-3.5 text-slate-400" />
                <span className="truncate">{selectedCustomer.email}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Phone className="h-3.5 w-3.5 text-slate-400" />
                <span>{selectedCustomer.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <CreditCard className="h-3.5 w-3.5 text-slate-400" />
                <span>{selectedCustomer.paymentMethod}</span>
              </div>
            </div>

            {/* Plan Metrics */}
            <div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 text-xs">
              <div className="rounded-xl bg-slate-50 p-2.5">
                <span className="text-[10px] uppercase font-bold text-slate-400">Monthly Bill</span>
                <div className="text-sm font-bold font-mono text-slate-900 mt-0.5">
                  {formatCurrency(selectedCustomer.monthlyCharges)}
                </div>
              </div>
              <div className="rounded-xl bg-slate-50 p-2.5">
                <span className="text-[10px] uppercase font-bold text-slate-400">Tenure</span>
                <div className="text-sm font-bold font-mono text-slate-900 mt-0.5">
                  {selectedCustomer.tenureMonths} Months
                </div>
              </div>
              <div className="rounded-xl bg-slate-50 p-2.5">
                <span className="text-[10px] uppercase font-bold text-slate-400">Network Tier</span>
                <div className="text-sm font-bold text-slate-900 mt-0.5 truncate">
                  {selectedCustomer.internetService}
                </div>
              </div>
              <div className="rounded-xl bg-slate-50 p-2.5">
                <span className="text-[10px] uppercase font-bold text-slate-400">Lifetime Value</span>
                <div className="text-sm font-bold font-mono text-emerald-600 mt-0.5">
                  {formatCurrency(selectedCustomer.clv)}
                </div>
              </div>
            </div>
          </div>

          {/* Service Add-ons Pills */}
          <div className="mt-4 pt-3 border-t border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">Active Services</span>
            <div className="flex flex-wrap gap-1.5">
              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${selectedCustomer.techSupport ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                TechSupport: {selectedCustomer.techSupport ? 'Yes' : 'No'}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${selectedCustomer.onlineSecurity ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                Security: {selectedCustomer.onlineSecurity ? 'Yes' : 'No'}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${selectedCustomer.streamingTV ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-400'}`}>
                Streaming: {selectedCustomer.streamingTV ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </div>

        {/* Churn Probability Scorecard & Health Status */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Churn Probability & Risk</h3>
              <span className="text-xs font-medium text-slate-500 font-mono">Model v2.4</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Predicted likelihood of defection in next 60 days</p>

            {/* Big Probability Gauge display */}
            <div className="mt-6 flex flex-col items-center justify-center text-center p-6 rounded-2xl bg-slate-50/70 border border-slate-100">
              <div className="relative flex items-center justify-center">
                <span className={`text-5xl font-black font-mono tracking-tight ${
                  selectedCustomer.riskLevel === 'High' ? 'text-rose-600' :
                  selectedCustomer.riskLevel === 'Medium' ? 'text-amber-600' : 'text-emerald-600'
                }`}>
                  {(selectedCustomer.churnProbability * 100).toFixed(1)}%
                </span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                  selectedCustomer.riskLevel === 'High' ? 'bg-rose-100 text-rose-700' :
                  selectedCustomer.riskLevel === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {selectedCustomer.riskLevel} Churn Risk
                </span>
              </div>
              <p className="mt-3 text-xs text-slate-500 max-w-xs leading-relaxed">
                {selectedCustomer.riskLevel === 'High' 
                  ? 'Urgent intervention required. High attrition probability driven by contract flexibility and support friction.'
                  : selectedCustomer.riskLevel === 'Medium'
                  ? 'Moderate attrition likelihood. Sensitive to competitor price promotions.'
                  : 'Highly stable subscriber profile. Strong contract and tenure protection.'}
              </p>
            </div>

            {/* Operational Telemetry Signals */}
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-xl border border-slate-100 p-2.5">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Support Escalations (90d)</span>
                <div className={`text-sm font-bold mt-0.5 ${selectedCustomer.supportTicketsLast90d >= 3 ? 'text-rose-600' : 'text-slate-800'}`}>
                  {selectedCustomer.supportTicketsLast90d} Tickets
                </div>
              </div>
              <div className="rounded-xl border border-slate-100 p-2.5">
                <span className="text-slate-400 text-[10px] uppercase font-bold">NPS Satisfaction</span>
                <div className="text-sm font-bold text-slate-800 mt-0.5">
                  {selectedCustomer.npsScore} / 10
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Telemetry source: BSS / OSS Billing stream</span>
            <span className="font-semibold text-emerald-600 flex items-center gap-1">
              <Check className="h-3 w-3" /> Real-time
            </span>
          </div>
        </div>

        {/* Actionable Retention Recommendation Card */}
        <div className="rounded-2xl border border-rose-200/80 bg-gradient-to-br from-white via-rose-50/30 to-amber-50/20 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-rose-600" />
                <h3 className="text-sm font-bold text-slate-900">Recommended Retention Action</h3>
              </div>
              <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-[10px] font-bold text-rose-700">
                {selectedCustomer.recommendedAction.urgency}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Custom intervention matched by Retention Engine</p>

            <div className="mt-4 rounded-xl border border-rose-100 bg-white p-4 shadow-xs">
              <div className="text-xs font-bold text-slate-900">
                {formatCurrencyText(selectedCustomer.recommendedAction.title)}
              </div>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                {formatCurrencyText(selectedCustomer.recommendedAction.description)}
              </p>

              <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-3 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Intervention Cost</span>
                  <div className="text-sm font-bold font-mono text-slate-800 mt-0.5">
                    {formatCurrency(selectedCustomer.recommendedAction.cost)}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Churn Reduction</span>
                  <div className="text-sm font-bold font-mono text-emerald-600 mt-0.5">
                    -{selectedCustomer.recommendedAction.expectedChurnReductionPct}%
                  </div>
                </div>
              </div>
            </div>

            {/* Expected Business Impact */}
            <div className="mt-4 rounded-xl bg-emerald-50 border border-emerald-200/60 p-3 text-xs">
              <div className="flex items-center justify-between font-bold text-emerald-900">
                <span>Expected Preserved Revenue:</span>
                <span className="font-mono text-sm">{formatCurrency(selectedCustomer.recommendedAction.expectedAnnualSavings)}/yr</span>
              </div>
              <p className="text-[11px] text-emerald-700 mt-1">
                Channel: <strong>{selectedCustomer.recommendedAction.recommendedChannel}</strong> • Estimated Net ROI: <strong>340%</strong>
              </p>
            </div>
          </div>

          <div className="mt-5">
            <button 
              onClick={() => alert(`Retention Play '${selectedCustomer.recommendedAction.title}' dispatched to ${selectedCustomer.recommendedAction.recommendedChannel} for ${selectedCustomer.name}.`)}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-rose-600 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-rose-700 transition-colors"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Dispatch Retention Offer</span>
            </button>
          </div>
        </div>
      </div>

      {/* SHAP Explanation Breakdown Section */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              SHAP Attribution Explanation (Why this customer may leave)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Exact feature contribution force pushing toward (+ Red) or protecting against (- Green) churn from baseline
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
              <span className="text-slate-600 font-medium">Increases Risk</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <span className="text-slate-600 font-medium">Reduces Risk</span>
            </div>
          </div>
        </div>

        {/* SHAP Horizontal Contribution Bars */}
        <div className="h-64 w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={shapChartData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
            >
              <XAxis type="number" stroke="#64748b" fontSize={11} domain={[-1.2, 1.2]} />
              <YAxis dataKey="name" type="category" stroke="#334155" fontSize={11} tickLine={false} width={180} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px', border: 'none' }}
                formatter={(value: number, name: string, item: any) => [
                  `${value > 0 ? '+' : ''}${value} impact (${item.payload.description})`,
                  'SHAP Contribution'
                ]}
              />
              <ReferenceLine x={0} stroke="#94a3b8" />
              <Bar dataKey="impact" radius={[0, 4, 4, 0]}>
                {shapChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* WHAT-IF SIMULATION PANEL (Interactive) */}
      <div className="rounded-2xl border-2 border-indigo-200 bg-gradient-to-b from-indigo-50/40 via-white to-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-indigo-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-indigo-600 p-2.5 text-white shadow-xs">
              <Sliders className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">What-If Churn Risk Simulation</h3>
                <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
                  Instant Recalculation
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Adjust contract term, pricing, tenure, and services to test retention scenarios in real-time.
              </p>
            </div>
          </div>

          <button
            onClick={resetWhatIfParams}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <RotateCcw className="h-3.5 w-3.5 text-slate-400" />
            <span>Reset to Current State</span>
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Controls Column 1: Contract & Tenure */}
          <div className="space-y-5">
            <div>
              <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>Contract Type</span>
                <span className="text-xs font-semibold text-indigo-600">{whatIfParams.contract}</span>
              </label>
              <div className="grid grid-cols-3 gap-1.5 mt-2">
                {(['Month-to-month', 'One year', 'Two year'] as ContractType[]).map((c) => (
                  <button
                    key={c}
                    onClick={() => updateWhatIfParams({ contract: c })}
                    className={`rounded-lg py-2 px-1 text-xs font-bold transition-all text-center ${
                      whatIfParams.contract === c
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {c === 'Month-to-month' ? 'Monthly' : c}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1.5">
                <span>Monthly Charges</span>
                <span className="font-mono text-indigo-600">{formatCurrency(whatIfParams.monthlyCharges)}/mo</span>
              </div>
              <input
                type="range"
                min="20"
                max="130"
                step="2.5"
                value={whatIfParams.monthlyCharges}
                onChange={(e) => updateWhatIfParams({ monthlyCharges: Number(e.target.value) })}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                <span>{formatCurrency(20)} (Basic)</span>
                <span>{formatCurrency(75)} (Avg)</span>
                <span>{formatCurrency(130)} (Gigabit Family)</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1.5">
                <span>Customer Tenure (Months)</span>
                <span className="font-mono text-indigo-600">{whatIfParams.tenureMonths} mo</span>
              </div>
              <input
                type="range"
                min="1"
                max="72"
                step="1"
                value={whatIfParams.tenureMonths}
                onChange={(e) => updateWhatIfParams({ tenureMonths: Number(e.target.value) })}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                <span>1 mo (New)</span>
                <span>24 mo (Matured)</span>
                <span>72 mo (Loyal)</span>
              </div>
            </div>
          </div>

          {/* Controls Column 2: Value-Add Services & Network */}
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-800 mb-1.5 block">
                Internet Network Technology
              </label>
              <select
                value={whatIfParams.internetService}
                onChange={(e) => updateWhatIfParams({ internetService: e.target.value as InternetServiceType })}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none"
              >
                <option value="Fiber optic">Fiber optic (Ultra Fast)</option>
                <option value="5G Home">5G Home Broadband</option>
                <option value="DSL">DSL Broadband</option>
                <option value="No">No Internet (Voice Only)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-800 mb-1.5 block">
                Payment Channel
              </label>
              <select
                value={whatIfParams.paymentMethod}
                onChange={(e) => updateWhatIfParams({ paymentMethod: e.target.value as PaymentMethodType })}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none"
              >
                <option value="Electronic check">Electronic Check (Manual friction)</option>
                <option value="Credit card (automatic)">Credit card (Automatic)</option>
                <option value="Bank transfer (automatic)">Bank transfer (Automatic)</option>
                <option value="Mailed check">Mailed check</option>
              </select>
            </div>

            <div className="space-y-2 pt-1">
              <label className="text-xs font-bold text-slate-800 block">Service Add-Ons</label>
              
              <div 
                onClick={() => updateWhatIfParams({ techSupport: !whatIfParams.techSupport })}
                className={`flex items-center justify-between p-2 rounded-xl border cursor-pointer transition-colors ${
                  whatIfParams.techSupport ? 'border-indigo-300 bg-indigo-50/50' : 'border-slate-200 bg-white'
                }`}
              >
                <span className="text-xs font-medium text-slate-700">Dedicated Tech Support Pack</span>
                <span className={`text-xs font-bold ${whatIfParams.techSupport ? 'text-indigo-600' : 'text-slate-400'}`}>
                  {whatIfParams.techSupport ? 'Active' : 'Off'}
                </span>
              </div>

              <div 
                onClick={() => updateWhatIfParams({ onlineSecurity: !whatIfParams.onlineSecurity })}
                className={`flex items-center justify-between p-2 rounded-xl border cursor-pointer transition-colors ${
                  whatIfParams.onlineSecurity ? 'border-indigo-300 bg-indigo-50/50' : 'border-slate-200 bg-white'
                }`}
              >
                <span className="text-xs font-medium text-slate-700">Cybersecurity & Cloud Defense</span>
                <span className={`text-xs font-bold ${whatIfParams.onlineSecurity ? 'text-indigo-600' : 'text-slate-400'}`}>
                  {whatIfParams.onlineSecurity ? 'Active' : 'Off'}
                </span>
              </div>
            </div>
          </div>

          {/* Results Column 3: Instant Simulation Recalculation Impact */}
          <div className="rounded-2xl border border-indigo-200 bg-white p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Simulation Output</span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  whatIfResult.newRiskLevel === 'High' ? 'bg-rose-100 text-rose-700' :
                  whatIfResult.newRiskLevel === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  New: {whatIfResult.newRiskLevel} Risk
                </span>
              </div>

              <div className="mt-4 flex items-baseline justify-between">
                <div>
                  <span className="text-xs text-slate-400 font-medium block">Baseline Probability:</span>
                  <span className="text-lg font-bold font-mono text-slate-600 line-through">
                    {(selectedCustomer.churnProbability * 100).toFixed(1)}%
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-indigo-900 block">Simulated Probability:</span>
                  <span className={`text-3xl font-black font-mono ${
                    whatIfResult.newRiskLevel === 'High' ? 'text-rose-600' :
                    whatIfResult.newRiskLevel === 'Medium' ? 'text-amber-600' : 'text-emerald-600'
                  }`}>
                    {(whatIfResult.newProbability * 100).toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Delta badge */}
              <div className="mt-3">
                <div className={`rounded-xl p-3 flex items-center justify-between font-bold text-xs ${
                  isReduced ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}>
                  <div className="flex items-center gap-1.5">
                    {isReduced ? <TrendingDown className="h-4 w-4 text-emerald-600" /> : <ArrowUp className="h-4 w-4 text-rose-600" />}
                    <span>{isReduced ? 'Risk Reduced By:' : 'Risk Increased By:'}</span>
                  </div>
                  <span className="font-mono text-sm">{Math.abs(probDeltaPct)}%</span>
                </div>
              </div>

              {/* Preserved Revenue calculation */}
              <div className="mt-4 space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                <div className="flex justify-between">
                  <span>Projected Annual Savings:</span>
                  <strong className="font-mono text-emerald-600 font-bold">
                    {formatCurrency(whatIfResult.preservedRevenueYearly)}/yr
                  </strong>
                </div>
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>New Action:</span>
                  <span className="truncate max-w-[180px] font-medium text-slate-700">
                    {formatCurrencyText(whatIfResult.newRecommendation.title)}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => alert(`Simulated contract change (${whatIfParams.contract} at ${formatCurrency(whatIfParams.monthlyCharges)}/mo) staged for subscriber ${selectedCustomer.name}.`)}
              className="mt-4 w-full rounded-xl bg-slate-900 py-2.5 text-center text-xs font-bold text-white hover:bg-slate-800 transition-colors shadow-xs"
            >
              Stage Simulation to BSS Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
