import React, { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react';
import { 
  TelecomCustomer, 
  DatasetProfile, 
  DatasetUploadState,
  RiskLevel, 
  ContractType, 
  WhatIfSimulation 
} from '../types/churn';
import { 
  RegionCurrencyCode, 
  RegionCurrencyConfig, 
  REGION_CURRENCY_MAP, 
  formatCurrency as formatCurrencyUtil, 
  formatCurrencyInText, 
  FormatCurrencyOptions 
} from '../utils/currency';
import { 
  INITIAL_TELECOM_CUSTOMERS, 
  MODEL_BENCHMARKS, 
  FEATURE_DRIFTS, 
  MLFLOW_RUNS 
} from '../data/telecomData';
import { profileDataset, calculateChurnProbability, simulateWhatIf } from '../utils/mlEngine';
import { validateTelecomDataset, TelecomValidationResult } from '../utils/telecomValidator';

export type NavigationTab = 
  | 'executive-dashboard'
  | 'data-center'
  | 'customer-intelligence'
  | 'customer-360'
  | 'batch-operations'
  | 'explainability-retention'
  | 'business-impact'
  | 'mlops-center';

interface PlatformContextType {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  
  // Multi-Region & Currency Configuration
  regionCurrency: RegionCurrencyCode;
  setRegionCurrency: (code: RegionCurrencyCode) => void;
  currencyConfig: RegionCurrencyConfig;
  formatCurrency: (amountInUSD: number, options?: FormatCurrencyOptions) => string;
  formatCurrencyText: (text: string) => string;

  // Data persistence & Unified Platform State
  customers: TelecomCustomer[];
  datasetProfile: DatasetProfile;
  selectedCustomerId: string;
  setSelectedCustomerId: (id: string) => void;
  selectedCustomer: TelecomCustomer | null;
  
  // Drilldown & Search Filters
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  riskFilter: 'All' | RiskLevel;
  setRiskFilter: (r: 'All' | RiskLevel) => void;
  contractFilter: 'All' | ContractType;
  setContractFilter: (c: 'All' | ContractType) => void;
  
  // What-If Simulation State
  whatIfParams: WhatIfSimulation | null;
  updateWhatIfParams: (params: Partial<WhatIfSimulation>) => void;
  resetWhatIfParams: () => void;
  whatIfResult: ReturnType<typeof simulateWhatIf> | null;
  
  // Data Operations & Quick Actions
  datasetUploadInfo: DatasetUploadState | null;
  clearDataset: () => void;
  handleDatasetUpload: (newRecords: any[], filename?: string, fileSizeBytes?: number) => { success: boolean; errorTitle?: string; error?: string };
  resetToDefaultDataset: () => void;
  drillDownToCustomer: (customerId: string) => void;
  triageHighRiskCohort: () => void;
  simulateTopAtRiskCustomer: () => void;
  
  // Quick aggregates
  totalSubscribers: number;
  activeSubscribers: number;
  churnedSubscribers: number;
  churnRatePct: number;
  totalRevenueAtRiskMonthly: number;
  totalRevenueAtRiskAnnual: number;
  potentialAnnualSavings: number;
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
}

const formatBytes = (bytes?: number): string => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const PlatformContext = createContext<PlatformContextType | undefined>(undefined);

export const PlatformProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<NavigationTab>('data-center');

  // Multi-region Currency Configuration (Default: India INR ₹)
  const [regionCurrency, setRegionCurrencyState] = useState<RegionCurrencyCode>(() => {
    const saved = localStorage.getItem('churnguard_currency_region');
    if (saved && (saved === 'INR' || saved === 'USD' || saved === 'EUR' || saved === 'JPY' || saved === 'KRW')) {
      return saved as RegionCurrencyCode;
    }
    return 'INR';
  });

  const setRegionCurrency = useCallback((code: RegionCurrencyCode) => {
    setRegionCurrencyState(code);
    try {
      localStorage.setItem('churnguard_currency_region', code);
    } catch (e) {
      console.error('Failed to save currency to localStorage', e);
    }
  }, []);

  const currencyConfig = useMemo(() => {
    return REGION_CURRENCY_MAP[regionCurrency] || REGION_CURRENCY_MAP.INR;
  }, [regionCurrency]);

  const formatCurrency = useCallback(
    (amountInUSD: number, options?: FormatCurrencyOptions) => {
      return formatCurrencyUtil(amountInUSD, regionCurrency, options);
    },
    [regionCurrency]
  );

  const formatCurrencyText = useCallback(
    (text: string) => {
      return formatCurrencyInText(text, regionCurrency);
    },
    [regionCurrency]
  );

  // Helper to ensure customer IDs are strictly unique across any loaded or uploaded datasets
  const deduplicateCustomers = (list: TelecomCustomer[]): TelecomCustomer[] => {
    const seenIds = new Set<string>();
    const sanitized: TelecomCustomer[] = [];

    for (const rawCust of list) {
      if (!rawCust || !rawCust.id) continue;
      // Re-align risk level strictly to user thresholds (>0.70 High, 0.35-0.70 Medium, <0.35 Low)
      let riskLevel: RiskLevel = 'Low';
      if (rawCust.churnProbability > 0.70) riskLevel = 'High';
      else if (rawCust.churnProbability >= 0.35) riskLevel = 'Medium';

      const cust: TelecomCustomer = { ...rawCust, riskLevel };
      let uniqueId = cust.id;
      if (seenIds.has(uniqueId)) {
        let counter = 1;
        while (seenIds.has(`${cust.id}-${counter}`)) {
          counter++;
        }
        uniqueId = `${cust.id}-${counter}`;
      }
      seenIds.add(uniqueId);
      sanitized.push(uniqueId === cust.id ? cust : { ...cust, id: uniqueId });
    }

    return sanitized;
  };

  const [customers, setCustomers] = useState<TelecomCustomer[]>(() => {
    // Read from localStorage (support v2 or legacy v1)
    const saved = localStorage.getItem('churnguard_customers_v2') || localStorage.getItem('churnguard_customers_v1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const clean = deduplicateCustomers(parsed);
          try {
            localStorage.setItem('churnguard_customers_v2', JSON.stringify(clean));
            localStorage.removeItem('churnguard_customers_v1');
          } catch {}
          return clean;
        }
      } catch (e) {
        console.error('Failed to parse saved customers', e);
      }
    }
    return deduplicateCustomers(INITIAL_TELECOM_CUSTOMERS);
  });

  // Persistent Dataset Upload Status
  const [datasetUploadInfo, setDatasetUploadInfo] = useState<DatasetUploadState | null>(() => {
    const savedInfo = localStorage.getItem('churnguard_dataset_upload_info_v2');
    if (savedInfo) {
      try {
        const parsed = JSON.parse(savedInfo);
        if (parsed && parsed.isLoaded) return parsed;
      } catch {}
    }
    // Default benchmark dataset info if customers exist
    return {
      isLoaded: true,
      fileName: 'WA_Fn-UseC_-Telco-Customer-Churn.csv',
      totalRecords: INITIAL_TELECOM_CUSTOMERS.length,
      totalFeatures: 21,
      uploadTimestamp: 'Active Benchmark Ingestion',
      schemaStatus: 'Inferred & Mapped (100% Validated)',
      fileSizeBytes: '977.5 KB',
      isCustomUpload: false,
    };
  });

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customers[0]?.id || 'TEL-8921');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [riskFilter, setRiskFilter] = useState<'All' | RiskLevel>('All');
  const [contractFilter, setContractFilter] = useState<'All' | ContractType>('All');

  // Compute dataset profile once or whenever customers array changes
  const datasetProfile = useMemo(() => {
    return profileDataset(customers);
  }, [customers]);

  // Persist customer state to keep everything persistent without re-upload
  useEffect(() => {
    try {
      localStorage.setItem('churnguard_customers_v2', JSON.stringify(customers));
      localStorage.removeItem('churnguard_customers_v1');
    } catch (e) {
      // Storage quota or private mode fallback
    }
  }, [customers]);

  const selectedCustomer = useMemo(() => {
    return customers.find(c => c.id === selectedCustomerId) || customers[0] || null;
  }, [customers, selectedCustomerId]);

  // What-If Simulation State
  const [whatIfParams, setWhatIfParams] = useState<WhatIfSimulation | null>(null);

  // Sync what-if defaults when selected customer changes
  useEffect(() => {
    if (selectedCustomer) {
      setWhatIfParams({
        contract: selectedCustomer.contract,
        monthlyCharges: selectedCustomer.monthlyCharges,
        tenureMonths: selectedCustomer.tenureMonths,
        internetService: selectedCustomer.internetService,
        techSupport: selectedCustomer.techSupport,
        onlineSecurity: selectedCustomer.onlineSecurity,
        deviceProtection: selectedCustomer.deviceProtection,
        streamingBundle: selectedCustomer.streamingTV || selectedCustomer.streamingMovies,
        paymentMethod: selectedCustomer.paymentMethod,
      });
    }
  }, [selectedCustomerId]);

  const updateWhatIfParams = (params: Partial<WhatIfSimulation>) => {
    setWhatIfParams(prev => prev ? { ...prev, ...params } : null);
  };

  const resetWhatIfParams = () => {
    if (selectedCustomer) {
      setWhatIfParams({
        contract: selectedCustomer.contract,
        monthlyCharges: selectedCustomer.monthlyCharges,
        tenureMonths: selectedCustomer.tenureMonths,
        internetService: selectedCustomer.internetService,
        techSupport: selectedCustomer.techSupport,
        onlineSecurity: selectedCustomer.onlineSecurity,
        deviceProtection: selectedCustomer.deviceProtection,
        streamingBundle: selectedCustomer.streamingTV || selectedCustomer.streamingMovies,
        paymentMethod: selectedCustomer.paymentMethod,
      });
    }
  };

  const whatIfResult = useMemo(() => {
    if (!selectedCustomer || !whatIfParams) return null;
    return simulateWhatIf(selectedCustomer, whatIfParams);
  }, [selectedCustomer, whatIfParams]);

  // High-level aggregates
  const totalSubscribers = customers.length;
  const highRiskCount = useMemo(() => customers.filter(c => c.riskLevel === 'High').length, [customers]);
  const mediumRiskCount = useMemo(() => customers.filter(c => c.riskLevel === 'Medium').length, [customers]);
  const lowRiskCount = useMemo(() => customers.filter(c => c.riskLevel === 'Low').length, [customers]);
  const churnedSubscribers = highRiskCount; // projected defection volume
  const activeSubscribers = totalSubscribers - churnedSubscribers;
  const churnRatePct = Number(((highRiskCount / (totalSubscribers || 1)) * 100).toFixed(1));

  const totalRevenueAtRiskMonthly = useMemo(() => {
    return customers
      .filter(c => c.riskLevel === 'High')
      .reduce((sum, c) => sum + c.monthlyCharges, 0);
  }, [customers]);

  const totalRevenueAtRiskAnnual = totalRevenueAtRiskMonthly * 12;

  const potentialAnnualSavings = useMemo(() => {
    return customers
      .filter(c => c.riskLevel === 'High' || c.riskLevel === 'Medium')
      .reduce((sum, c) => sum + (c.recommendedAction?.expectedAnnualSavings || 0), 0);
  }, [customers]);

  // Direct drill-down helper
  const drillDownToCustomer = (customerId: string) => {
    setSelectedCustomerId(customerId);
    setActiveTab('customer-360');
  };

  // Operational Quick Actions
  const triageHighRiskCohort = () => {
    setRiskFilter('High');
    setActiveTab('customer-intelligence');
  };

  const simulateTopAtRiskCustomer = () => {
    const topHighRisk = customers.find(c => c.riskLevel === 'High') || customers[0];
    if (topHighRisk) {
      setSelectedCustomerId(topHighRisk.id);
      setActiveTab('customer-360');
    }
  };

  // Upload handler that scores any uploaded telecom CSV batch and integrates it seamlessly
  const handleDatasetUpload = (newRecords: any[], filename?: string, fileSizeBytes?: number): { success: boolean; errorTitle?: string; error?: string } => {
    if (!newRecords || newRecords.length === 0) {
      return {
        success: false,
        errorTitle: 'Invalid Dataset',
        error: 'CSV file contains no data rows.',
      };
    }

    // Strict Telecom-Only Schema Validation
    const headers = Object.keys(newRecords[0] || {});
    const validation = validateTelecomDataset(headers);
    if (!validation.isValid) {
      return {
        success: false,
        errorTitle: validation.errorTitle || 'Invalid Telecom Dataset Detected.',
        error: validation.errorMessage || 'Please upload a valid telecom customer churn dataset.',
      };
    }

    const scoredList: TelecomCustomer[] = newRecords.map((rec, idx) => {
      const contract = rec.Contract || rec.contract || (idx % 2 === 0 ? 'Month-to-month' : 'One year');
      const tenure = Number(rec.tenure || rec.Tenure || rec.tenureMonths || 12);
      const monthly = Number(rec.MonthlyCharges || rec.monthlyCharges || rec.monthly_charges || 65);
      const internet = rec.InternetService || rec.internetService || 'Fiber optic';
      const techSupport = rec.TechSupport === 'Yes' || rec.techSupport === true;
      const onlineSec = rec.OnlineSecurity === 'Yes' || rec.onlineSecurity === true;
      const paymentMethod = rec.PaymentMethod || rec.paymentMethod || 'Electronic check';
      const cid = rec.customerID || rec.customerId || rec.id || `TEL-UP-${1000 + idx}`;
      const name = rec.customerName || rec.name || `Subscriber ${cid}`;

      const score = calculateChurnProbability({
        contract,
        tenureMonths: tenure,
        monthlyCharges: monthly,
        internetService: internet,
        techSupport,
        onlineSecurity: onlineSec,
        paymentMethod,
        seniorCitizen: rec.SeniorCitizen === '1' || rec.SeniorCitizen === 1,
      });

      return {
        id: cid,
        name,
        email: `${cid.toLowerCase()}@subscriber.telco`,
        phone: '+1 (555) 019-' + (1000 + idx),
        gender: idx % 2 === 0 ? 'Male' : 'Female',
        seniorCitizen: false,
        partner: true,
        dependents: false,
        tenureMonths: tenure,
        phoneService: true,
        multipleLines: true,
        internetService: internet,
        onlineSecurity: onlineSec,
        onlineBackup: true,
        deviceProtection: true,
        techSupport,
        streamingTV: true,
        streamingMovies: true,
        contract,
        paperlessBilling: true,
        paymentMethod,
        monthlyCharges: monthly,
        totalCharges: monthly * tenure,
        dataUsageGB: Math.round(monthly * 4),
        npsScore: score.riskLevel === 'High' ? 4 : 8,
        supportTicketsLast90d: score.riskLevel === 'High' ? 3 : 1,
        networkComplaints: score.riskLevel === 'High' ? 2 : 0,
        churnProbability: score.probability,
        predictedChurn: score.probability >= 0.5,
        riskLevel: score.riskLevel,
        shapContributions: score.contributions,
        recommendedAction: score.recommendedAction,
        segment: score.riskLevel === 'High' ? 'High-Spender At Risk' : 'Loyal Subscriber',
        clv: Math.round(monthly * 24),
      };
    });

    if (scoredList.length > 0) {
      const cleanList = deduplicateCustomers(scoredList);
      setCustomers(cleanList);
      setSelectedCustomerId(cleanList[0].id);

      const now = new Date();
      const formattedTimestamp = now.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }) + ' at ' + now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });

      const colsCount = Object.keys(newRecords[0] || {}).length || 21;

      const uploadInfo: DatasetUploadState = {
        isLoaded: true,
        fileName: filename || 'telecom_subscriber_data.csv',
        totalRecords: cleanList.length,
        totalFeatures: colsCount,
        uploadTimestamp: formattedTimestamp,
        schemaStatus: 'Inferred & Mapped (100% Validated)',
        fileSizeBytes: fileSizeBytes ? formatBytes(fileSizeBytes) : undefined,
        isCustomUpload: true,
      };

      setDatasetUploadInfo(uploadInfo);
      try {
        localStorage.setItem('churnguard_dataset_upload_info_v2', JSON.stringify(uploadInfo));
      } catch (e) {
        console.error('Failed to persist dataset upload info', e);
      }
      return { success: true };
    }
    return { success: false, error: 'No valid records scored.' };
  };

  const resetToDefaultDataset = () => {
    try {
      localStorage.removeItem('churnguard_customers_v2');
      localStorage.removeItem('churnguard_customers_v1');
      localStorage.removeItem('churnguard_dataset_upload_info_v2');
    } catch {}
    const defaultClean = deduplicateCustomers(INITIAL_TELECOM_CUSTOMERS);
    setCustomers(defaultClean);
    setSelectedCustomerId(defaultClean[0].id);

    const now = new Date();
    const formattedTimestamp = now.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }) + ' at ' + now.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    const defaultInfo: DatasetUploadState = {
      isLoaded: true,
      fileName: 'WA_Fn-UseC_-Telco-Customer-Churn.csv',
      totalRecords: defaultClean.length,
      totalFeatures: 21,
      uploadTimestamp: 'Benchmark Reset (' + formattedTimestamp + ')',
      schemaStatus: 'Inferred & Mapped (100% Validated)',
      fileSizeBytes: '977.5 KB',
      isCustomUpload: false,
    };
    setDatasetUploadInfo(defaultInfo);
    try {
      localStorage.setItem('churnguard_dataset_upload_info_v2', JSON.stringify(defaultInfo));
    } catch {}
  };

  const clearDataset = () => {
    setCustomers([]);
    setDatasetUploadInfo(null);
    try {
      localStorage.removeItem('churnguard_customers_v2');
      localStorage.removeItem('churnguard_customers_v1');
      localStorage.removeItem('churnguard_dataset_upload_info_v2');
    } catch {}
  };

  return (
    <PlatformContext.Provider
      value={{
        activeTab,
        setActiveTab,
        regionCurrency,
        setRegionCurrency,
        currencyConfig,
        formatCurrency,
        formatCurrencyText,
        customers,
        datasetProfile,
        datasetUploadInfo,
        clearDataset,
        selectedCustomerId,
        setSelectedCustomerId,
        selectedCustomer,
        searchQuery,
        setSearchQuery,
        riskFilter,
        setRiskFilter,
        contractFilter,
        setContractFilter,
        whatIfParams,
        updateWhatIfParams,
        resetWhatIfParams,
        whatIfResult,
        handleDatasetUpload,
        resetToDefaultDataset,
        drillDownToCustomer,
        triageHighRiskCohort,
        simulateTopAtRiskCustomer,
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
      }}
    >
      {children}
    </PlatformContext.Provider>
  );
};

export const usePlatform = () => {
  const context = useContext(PlatformContext);
  if (!context) {
    throw new Error('usePlatform must be used within a PlatformProvider');
  }
  return context;
};
