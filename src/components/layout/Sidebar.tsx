import React from 'react';
import { 
  LayoutDashboard, 
  DatabaseZap, 
  Users, 
  UserCheck, 
  Layers, 
  HelpCircle, 
  TrendingUp, 
  Cpu, 
  AlertTriangle,
  ChevronRight
} from 'lucide-react';
import { usePlatform, NavigationTab } from '../../context/PlatformContext';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, highRiskCount, totalRevenueAtRiskMonthly, formatCurrency } = usePlatform();

  const navItems: { id: NavigationTab; label: string; icon: React.ElementType; badge?: string; badgeColor?: string }[] = [
    {
      id: 'data-center',
      label: 'Data Uploading',
      icon: DatabaseZap,
    },
    {
      id: 'executive-dashboard',
      label: 'Executive Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'customer-intelligence',
      label: 'Risk Segmentation',
      icon: Users,
      badge: `${highRiskCount} At Risk`,
      badgeColor: 'bg-rose-100 text-rose-700 font-semibold',
    },
    {
      id: 'customer-360',
      label: 'Customer 360',
      icon: UserCheck,
    },
    {
      id: 'batch-operations',
      label: 'Batch Scoring',
      icon: Layers,
    },
    {
      id: 'explainability-retention',
      label: 'Explainability & Retention',
      icon: HelpCircle,
    },
    {
      id: 'business-impact',
      label: 'Revenue Impact & ROI',
      icon: TrendingUp,
    },
    {
      id: 'mlops-center',
      label: 'ML Operations',
      icon: Cpu,
    },
  ];

  return (
    <aside className="w-64 flex-shrink-0 border-r border-slate-200 bg-white flex flex-col justify-between py-5 px-3 select-none">
      <div className="space-y-6">
        <div>
          <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Platform Navigation
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-rose-50/90 text-rose-700 shadow-sm shadow-rose-100 border border-rose-200/50'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-4 w-4 transition-colors ${
                      isActive ? 'text-rose-600' : 'text-slate-400 group-hover:text-slate-600'
                    }`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge ? (
                    <span className={`rounded-full px-2 py-0.5 text-[10px] ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  ) : isActive ? (
                    <ChevronRight className="h-3.5 w-3.5 text-rose-500" />
                  ) : null}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Mini Executive Summary Card at bottom of sidebar */}
      <div className="rounded-2xl border border-rose-100 bg-gradient-to-br from-rose-50/70 to-amber-50/50 p-3.5">
        <div className="flex items-center gap-2 text-rose-800 text-xs font-bold mb-1">
          <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
          <span>Active Defection Alert</span>
        </div>
        <div className="text-[11px] text-slate-600 leading-relaxed mb-2.5">
          <strong className="text-slate-900 font-semibold">{highRiskCount} high-risk</strong> accounts identified risking <strong className="text-rose-700 font-bold">{formatCurrency(totalRevenueAtRiskMonthly)}/mo</strong> in recurring revenue.
        </div>
        <button
          onClick={() => setActiveTab('customer-intelligence')}
          className="w-full rounded-lg bg-rose-600 py-1.5 text-center text-xs font-semibold text-white shadow-sm hover:bg-rose-700 transition-colors"
        >
          Review Churn Queue
        </button>
      </div>
    </aside>
  );
};
