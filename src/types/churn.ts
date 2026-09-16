export type RiskLevel = 'Low' | 'Medium' | 'High';

export type ContractType = 'Month-to-month' | 'One year' | 'Two year';
export type InternetServiceType = 'Fiber optic' | 'DSL' | '5G Home' | 'No';
export type PaymentMethodType = 'Electronic check' | 'Mailed check' | 'Bank transfer (automatic)' | 'Credit card (automatic)';

export interface SHAPContribution {
  feature: string;
  value: string | number;
  impact: number; // positive = pushes toward churn, negative = reduces churn
  description: string;
}

export interface RetentionAction {
  id: string;
  title: string;
  actionType: 'Discount' | 'Upgrade' | 'Support' | 'Contract Incentive' | 'VIP Care';
  cost: number;
  expectedChurnReductionPct: number;
  expectedAnnualSavings: number;
  description: string;
  recommendedChannel: 'App Push' | 'SMS' | 'Call Center' | 'Email' | 'Store';
  urgency: 'Immediate (24h)' | 'High (48h)' | 'Standard (7d)';
}

export interface TelecomCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  gender: 'Male' | 'Female';
  seniorCitizen: boolean;
  partner: boolean;
  dependents: boolean;
  tenureMonths: number;
  phoneService: boolean;
  multipleLines: boolean;
  internetService: InternetServiceType;
  onlineSecurity: boolean;
  onlineBackup: boolean;
  deviceProtection: boolean;
  techSupport: boolean;
  streamingTV: boolean;
  streamingMovies: boolean;
  contract: ContractType;
  paperlessBilling: boolean;
  paymentMethod: PaymentMethodType;
  monthlyCharges: number;
  totalCharges: number;
  dataUsageGB: number;
  npsScore: number; // 1-10
  supportTicketsLast90d: number;
  networkComplaints: number;
  
  // Model inference outputs
  churnProbability: number; // 0.0 to 1.0
  predictedChurn: boolean;
  riskLevel: RiskLevel;
  shapContributions: SHAPContribution[];
  recommendedAction: RetentionAction;
  segment: string;
  clv: number; // Customer Lifetime Value in USD
}

export interface SchemaField {
  name: string;
  type: 'Numerical' | 'Categorical' | 'Boolean' | 'ID';
  missingCount: number;
  missingPct: number;
  uniqueValues: number;
  sampleValues: string[];
  role: 'Feature' | 'Target' | 'Identifier' | 'Metadata';
}

export interface DatasetProfile {
  totalRows: number;
  totalColumns: number;
  missingCells: number;
  missingCellsPct: number;
  duplicateRows: number;
  churnRatePct: number;
  fields: SchemaField[];
  healthScore: number; // 0-100
}

export interface DatasetUploadState {
  isLoaded: boolean;
  fileName: string;
  totalRecords: number;
  totalFeatures: number;
  uploadTimestamp: string;
  schemaStatus: string;
  fileSizeBytes?: string;
  isCustomUpload: boolean;
}

export interface ModelBenchmark {
  modelName: string;
  accuracy: number;
  rocAuc: number;
  precision: number;
  recall: number;
  f1Score: number;
  latencyMs: number;
  status: 'Production Active' | 'Challenger' | 'Archived';
  trainedDate: string;
}

export interface FeatureDrift {
  feature: string;
  baselineMean: number | string;
  currentMean: number | string;
  psi: number; // Population Stability Index
  status: 'Stable' | 'Slight Shift' | 'Critical Drift';
}

export interface MLflowRun {
  runId: string;
  experiment: string;
  parameters: Record<string, string | number>;
  metrics: Record<string, number>;
  status: 'FINISHED' | 'RUNNING' | 'FAILED';
  timestamp: string;
}

export interface WhatIfSimulation {
  contract: ContractType;
  monthlyCharges: number;
  tenureMonths: number;
  internetService: InternetServiceType;
  techSupport: boolean;
  onlineSecurity: boolean;
  deviceProtection: boolean;
  streamingBundle: boolean;
  paymentMethod: PaymentMethodType;
}
