/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PlatformProvider, usePlatform } from './context/PlatformContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { ExecutiveDashboard } from './components/views/ExecutiveDashboard';
import { DataCenter } from './components/views/DataCenter';
import { CustomerIntelligence } from './components/views/CustomerIntelligence';
import { Customer360 } from './components/views/Customer360';
import { BatchOperations } from './components/views/BatchOperations';
import { ExplainabilityRetention } from './components/views/ExplainabilityRetention';
import { BusinessImpact } from './components/views/BusinessImpact';
import { MLOpsCenter } from './components/views/MLOpsCenter';

const MainContent: React.FC = () => {
  const { activeTab } = usePlatform();

  const renderActiveView = () => {
    switch (activeTab) {
      case 'executive-dashboard':
        return <ExecutiveDashboard />;
      case 'data-center':
        return <DataCenter />;
      case 'customer-intelligence':
        return <CustomerIntelligence />;
      case 'customer-360':
        return <Customer360 />;
      case 'batch-operations':
        return <BatchOperations />;
      case 'explainability-retention':
        return <ExplainabilityRetention />;
      case 'business-impact':
        return <BusinessImpact />;
      case 'mlops-center':
        return <MLOpsCenter />;
      default:
        return <ExecutiveDashboard />;
    }
  };

  return (
    <main className="flex-1 overflow-y-auto bg-slate-50/60 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {renderActiveView()}
      </div>
    </main>
  );
};

export default function App() {
  return (
    <PlatformProvider>
      <div className="flex h-screen w-full flex-col overflow-hidden bg-slate-50 text-slate-900 font-sans">
        <Navbar />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <MainContent />
        </div>
      </div>
    </PlatformProvider>
  );
}

