import { 
  TelecomCustomer, 
  SHAPContribution, 
  RetentionAction, 
  RiskLevel, 
  WhatIfSimulation, 
  SchemaField, 
  DatasetProfile, 
  FeatureDrift 
} from '../types/churn';

// Baseline telecom industry churn rate (~26.5%)
export const BASELINE_CHURN_RATE = 0.265;

/**
 * Robust Telecom Churn Scoring function replicating a trained Gradient Boosting / Logistic classifier
 */
export function calculateChurnProbability(params: {
  contract: string;
  tenureMonths: number;
  monthlyCharges: number;
  internetService: string;
  techSupport: boolean;
  onlineSecurity: boolean;
  paymentMethod: string;
  seniorCitizen: boolean;
  supportTicketsLast90d?: number;
  networkComplaints?: number;
  paperlessBilling?: boolean;
}): {
  probability: number;
  riskLevel: RiskLevel;
  contributions: SHAPContribution[];
  recommendedAction: RetentionAction;
} {
  let logOdds = Math.log(BASELINE_CHURN_RATE / (1 - BASELINE_CHURN_RATE)); // logit baseline: ~ -1.02
  const contributions: SHAPContribution[] = [];

  // 1. Contract effect (Strongest telecom predictor)
  if (params.contract === 'Month-to-month') {
    const impact = 0.88;
    logOdds += impact;
    contributions.push({
      feature: 'Contract: Month-to-month',
      value: params.contract,
      impact,
      description: 'Lack of long-term contract commitment heavily elevates churn risk',
    });
  } else if (params.contract === 'One year') {
    const impact = -0.35;
    logOdds += impact;
    contributions.push({
      feature: 'Contract: One year',
      value: params.contract,
      impact,
      description: 'Annual commitment provides moderate retention stability',
    });
  } else {
    // Two year
    const impact = -0.95;
    logOdds += impact;
    contributions.push({
      feature: 'Contract: Two year',
      value: params.contract,
      impact,
      description: 'Long-term contract is a high protective anchor against churn',
    });
  }

  // 2. Tenure effect
  if (params.tenureMonths <= 6) {
    const impact = 0.72;
    logOdds += impact;
    contributions.push({
      feature: 'Tenure: Early Stage (<=6 mo)',
      value: `${params.tenureMonths} mo`,
      impact,
      description: 'First 6 months are the highest risk onboarding window',
    });
  } else if (params.tenureMonths <= 24) {
    const impact = 0.18;
    logOdds += impact;
    contributions.push({
      feature: 'Tenure: Maturing (7-24 mo)',
      value: `${params.tenureMonths} mo`,
      impact,
      description: 'Transition phase where customer tests network value vs cost',
    });
  } else {
    const impact = -0.65;
    logOdds += impact;
    contributions.push({
      feature: 'Tenure: Established (>24 mo)',
      value: `${params.tenureMonths} mo`,
      impact,
      description: 'Established customer loyalty substantially lowers likelihood to defect',
    });
  }

  // 3. Monthly charges
  if (params.monthlyCharges >= 85) {
    const impact = 0.52;
    logOdds += impact;
    contributions.push({
      feature: 'High Monthly Charges',
      value: `$${params.monthlyCharges.toFixed(2)}/mo`,
      impact,
      description: 'High bill makes customer sensitive to competitive telco promotions',
    });
  } else if (params.monthlyCharges <= 40) {
    const impact = -0.22;
    logOdds += impact;
    contributions.push({
      feature: 'Low Monthly Charges',
      value: `$${params.monthlyCharges.toFixed(2)}/mo`,
      impact,
      description: 'Low monthly expenditure reduces billing fatigue',
    });
  }

  // 4. Internet Service & Tech Ecosystem
  if (params.internetService === 'Fiber optic') {
    if (!params.techSupport && !params.onlineSecurity) {
      const impact = 0.64;
      logOdds += impact;
      contributions.push({
        feature: 'Fiber without Tech Support/Security',
        value: 'Fiber optic (unshielded)',
        impact,
        description: 'Fiber customers without technical support experience highest attrition',
      });
    } else {
      const impact = 0.12;
      logOdds += impact;
      contributions.push({
        feature: 'Fiber with Active Add-ons',
        value: 'Fiber optic (protected)',
        impact,
        description: 'Value-added services dampen fiber pricing pressure',
      });
    }
  } else if (params.internetService === 'No') {
    const impact = -0.42;
    logOdds += impact;
    contributions.push({
      feature: 'Voice-Only Low Footprint',
      value: 'No Internet',
      impact,
      description: 'Basic voice customers demonstrate lower switching propensity',
    });
  }

  // 5. Payment Method
  if (params.paymentMethod === 'Electronic check') {
    const impact = 0.38;
    logOdds += impact;
    contributions.push({
      feature: 'Manual Electronic Check',
      value: params.paymentMethod,
      impact,
      description: 'Manual payment friction triggers recurring reconsiderations to cancel',
    });
  } else if (params.paymentMethod.includes('automatic')) {
    const impact = -0.32;
    logOdds += impact;
    contributions.push({
      feature: 'Automated Billing Enrollment',
      value: 'Auto-pay active',
      impact,
      description: 'Automated recurring payment streamlines billing continuity',
    });
  }

  // 6. Support Complaints & Tickets
  const tickets = params.supportTicketsLast90d ?? 1;
  if (tickets >= 3) {
    const impact = 0.58;
    logOdds += impact;
    contributions.push({
      feature: 'Frequent Support Escalations',
      value: `${tickets} tickets/90d`,
      impact,
      description: 'Unresolved service friction severely damages customer trust',
    });
  } else if (tickets === 0) {
    const impact = -0.15;
    logOdds += impact;
    contributions.push({
      feature: 'Frictionless Service Experience',
      value: '0 tickets/90d',
      impact,
      description: 'Clean operational experience preserves customer satisfaction',
    });
  }

  // Convert log-odds to probability (sigmoid function)
  const probability = 1 / (1 + Math.exp(-logOdds));
  const clampedProb = Math.min(0.98, Math.max(0.02, probability));

  // Risk Classification
  let riskLevel: RiskLevel = 'Low';
  if (clampedProb >= 0.65) riskLevel = 'High';
  else if (clampedProb >= 0.35) riskLevel = 'Medium';

  // Sort contributions by absolute magnitude
  contributions.sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));

  // Generate actionable retention play
  const recommendedAction = generateRetentionRecommendation(riskLevel, params, clampedProb);

  return {
    probability: clampedProb,
    riskLevel,
    contributions,
    recommendedAction,
  };
}

/**
 * Telecom Business Retention Engine mapping risk profiles to retention plays
 */
export function generateRetentionRecommendation(
  riskLevel: RiskLevel,
  params: {
    contract: string;
    monthlyCharges: number;
    internetService: string;
    techSupport: boolean;
    onlineSecurity: boolean;
    paymentMethod: string;
  },
  churnProb: number
): RetentionAction {
  const annualRev = params.monthlyCharges * 12;

  if (riskLevel === 'High') {
    if (params.contract === 'Month-to-month') {
      return {
        id: 'ret-high-contract-lock',
        title: '12-Month Loyalty Lock with 15% Bill Rebate',
        actionType: 'Contract Incentive',
        cost: Math.round(params.monthlyCharges * 1.8),
        expectedChurnReductionPct: 38,
        expectedAnnualSavings: Math.round(annualRev * 0.38 * (1 - 0.15)),
        description: 'Proactively offer $15/mo discount for signing an annual agreement + free Premium Tech Support.',
        recommendedChannel: 'Call Center',
        urgency: 'Immediate (24h)',
      };
    } else {
      return {
        id: 'ret-high-service-upgrade',
        title: 'Network Quality Guarantee & Free 5G/Fiber Boost',
        actionType: 'Upgrade',
        cost: 45,
        expectedChurnReductionPct: 32,
        expectedAnnualSavings: Math.round(annualRev * 0.32),
        description: 'Complimentary speed boost to 1 Gbps + dedicated tier-2 technician review to address latency.',
        recommendedChannel: 'App Push',
        urgency: 'High (48h)',
      };
    }
  } else if (riskLevel === 'Medium') {
    if (!params.paymentMethod.includes('automatic')) {
      return {
        id: 'ret-med-autopay-perk',
        title: 'Auto-Pay Enrollment Bonus ($10 Credit x 3 Months)',
        actionType: 'Discount',
        cost: 30,
        expectedChurnReductionPct: 24,
        expectedAnnualSavings: Math.round(annualRev * 0.24),
        description: 'Incentivize conversion from manual billing to automated bank transfer with immediate bill credit.',
        recommendedChannel: 'SMS',
        urgency: 'High (48h)',
      };
    } else {
      return {
        id: 'ret-med-security-bundle',
        title: 'Complimentary Security & Cloud Backup Pack',
        actionType: 'Support',
        cost: 20,
        expectedChurnReductionPct: 21,
        expectedAnnualSavings: Math.round(annualRev * 0.21),
        description: 'Activate free 6-month cybersecurity suite and multi-device antivirus to increase product stickiness.',
        recommendedChannel: 'Email',
        urgency: 'Standard (7d)',
      };
    }
  } else {
    // Low risk - Nurture & cross-sell
    return {
      id: 'ret-low-vip-loyalty',
      title: 'Milestone Loyalty Rewards & Family Plan Discount',
      actionType: 'VIP Care',
      cost: 15,
      expectedChurnReductionPct: 12,
      expectedAnnualSavings: Math.round(annualRev * 0.12),
      description: 'Reward account tenure with free roaming passes or streaming service trial to deepen ecosystem loyalty.',
      recommendedChannel: 'App Push',
      urgency: 'Standard (7d)',
    };
  }
}

/**
 * Recalculate customer state with What-If simulation parameters
 */
export function simulateWhatIf(
  baseCustomer: TelecomCustomer,
  sim: WhatIfSimulation
): {
  newProbability: number;
  newRiskLevel: RiskLevel;
  deltaProbability: number; // e.g. -0.22 (reduced risk by 22%)
  newContributions: SHAPContribution[];
  newRecommendation: RetentionAction;
  preservedRevenueYearly: number;
} {
  const result = calculateChurnProbability({
    contract: sim.contract,
    tenureMonths: sim.tenureMonths,
    monthlyCharges: sim.monthlyCharges,
    internetService: sim.internetService,
    techSupport: sim.techSupport,
    onlineSecurity: sim.onlineSecurity,
    paymentMethod: sim.paymentMethod,
    seniorCitizen: baseCustomer.seniorCitizen,
    supportTicketsLast90d: baseCustomer.supportTicketsLast90d,
    networkComplaints: baseCustomer.networkComplaints,
    paperlessBilling: baseCustomer.paperlessBilling,
  });

  const delta = result.probability - baseCustomer.churnProbability;
  const annualRev = sim.monthlyCharges * 12;
  const preservedRevenue = delta < 0 ? Math.round(annualRev * Math.abs(delta)) : 0;

  return {
    newProbability: result.probability,
    newRiskLevel: result.riskLevel,
    deltaProbability: delta,
    newContributions: result.contributions,
    newRecommendation: result.recommendedAction,
    preservedRevenueYearly: preservedRevenue,
  };
}

/**
 * Profile and infer schema from an array of records (uploaded CSV or dataset)
 */
export function profileDataset(data: any[]): DatasetProfile {
  if (!data || data.length === 0) {
    return {
      totalRows: 0,
      totalColumns: 0,
      missingCells: 0,
      missingCellsPct: 0,
      duplicateRows: 0,
      churnRatePct: 0,
      fields: [],
      healthScore: 100,
    };
  }

  const columns = Object.keys(data[0]);
  let totalMissing = 0;
  const fields: SchemaField[] = [];

  columns.forEach((col) => {
    let missingCount = 0;
    const valuesSet = new Set<string>();
    const samples: string[] = [];
    let isNumeric = true;

    data.forEach((row) => {
      const val = row[col];
      if (val === undefined || val === null || val === '' || val === 'NA' || val === 'null') {
        missingCount++;
        totalMissing++;
      } else {
        const strVal = String(val);
        valuesSet.add(strVal);
        if (samples.length < 4 && !samples.includes(strVal)) {
          samples.push(strVal);
        }
        if (isNaN(Number(val)) && typeof val !== 'boolean') {
          isNumeric = false;
        }
      }
    });

    const colLower = col.toLowerCase();
    let type: SchemaField['type'] = 'Categorical';
    if (colLower.includes('id') || colLower.includes('customer_id')) {
      type = 'ID';
    } else if (valuesSet.size === 2 && (samples.includes('Yes') || samples.includes('true') || samples.includes('1'))) {
      type = 'Boolean';
    } else if (isNumeric) {
      type = 'Numerical';
    }

    let role: SchemaField['role'] = 'Feature';
    if (colLower.includes('churn')) {
      role = 'Target';
    } else if (type === 'ID') {
      role = 'Identifier';
    } else if (colLower.includes('name') || colLower.includes('email') || colLower.includes('phone')) {
      role = 'Metadata';
    }

    fields.push({
      name: col,
      type,
      missingCount,
      missingPct: Number(((missingCount / data.length) * 100).toFixed(2)),
      uniqueValues: valuesSet.size,
      sampleValues: samples,
      role,
    });
  });

  const totalCells = data.length * columns.length;
  const missingCellsPct = Number(((totalMissing / (totalCells || 1)) * 100).toFixed(2));
  
  // Calculate churn rate if target exists
  let churnCount = 0;
  data.forEach((r) => {
    if (r.churn === true || r.churn === 'Yes' || r.Churn === 'Yes' || r.predictedChurn === true) {
      churnCount++;
    }
  });
  const churnRatePct = Number(((churnCount / data.length) * 100).toFixed(1));

  // Health score calculation
  const completenessScore = Math.max(0, 100 - missingCellsPct * 4);
  const schemaHealth = fields.length >= 10 ? 100 : 80;
  const healthScore = Math.round(completenessScore * 0.7 + schemaHealth * 0.3);

  return {
    totalRows: data.length,
    totalColumns: columns.length,
    missingCells: totalMissing,
    missingCellsPct,
    duplicateRows: 0,
    churnRatePct,
    fields,
    healthScore,
  };
}

/**
 * Calculate Population Stability Index (PSI) for MLOps drift detection
 */
export function calculatePSI(baselineDist: number[], currentDist: number[]): number {
  let psi = 0;
  for (let i = 0; i < baselineDist.length; i++) {
    const b = Math.max(baselineDist[i], 0.0001);
    const c = Math.max(currentDist[i], 0.0001);
    psi += (c - b) * Math.log(c / b);
  }
  return Number(Math.max(0, psi).toFixed(4));
}

/**
 * Export Customer batch array to clean CSV format
 */
export function exportToCSV(customers: TelecomCustomer[], filename = 'churnguard_predictions.csv'): void {
  const headers = [
    'CustomerID',
    'CustomerName',
    'Contract',
    'TenureMonths',
    'MonthlyCharges',
    'InternetService',
    'PredictedChurn',
    'ChurnProbabilityPct',
    'RiskLevel',
    'TopChurnDriver',
    'RecommendedAction',
    'ActionCostUSD',
    'ExpectedAnnualSavingsUSD'
  ];

  const rows = customers.map((c) => [
    `"${c.id}"`,
    `"${c.name}"`,
    `"${c.contract}"`,
    c.tenureMonths,
    c.monthlyCharges.toFixed(2),
    `"${c.internetService}"`,
    c.predictedChurn ? 'YES' : 'NO',
    (c.churnProbability * 100).toFixed(1) + '%',
    c.riskLevel,
    `"${c.shapContributions[0]?.feature || 'Tenure'}"`,
    `"${c.recommendedAction?.title || 'Standard Engagement'}"`,
    c.recommendedAction?.cost || 0,
    c.recommendedAction?.expectedAnnualSavings || 0
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
