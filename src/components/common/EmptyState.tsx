import React from 'react';
import { DatabaseZap, ArrowRight } from 'lucide-react';
import { usePlatform } from '../../context/PlatformContext';

interface EmptyStateProps {
  title: string;
  description: string;
  buttonText?: string;
  icon?: React.ElementType;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  buttonText = 'Go to Telecom Data Center',
  icon: Icon = DatabaseZap,
}) => {
  const { setActiveTab } = usePlatform();

  return (
    <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center shadow-xs flex flex-col items-center justify-center my-6">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 mb-4 shadow-inner">
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 max-w-md mb-6 leading-relaxed">
        {description}
      </p>
      <button
        onClick={() => setActiveTab('data-center')}
        className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-rose-700 transition-colors cursor-pointer"
      >
        <span>{buttonText}</span>
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
};
