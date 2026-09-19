/**
 * Telecom-Only Dataset Schema Validator
 * Enforces strict validation ensuring only telecom subscriber churn datasets are ingested.
 */

export interface TelecomValidationResult {
  isValid: boolean;
  matchedAttributes: string[];
  missingAttributes: string[];
  errorTitle?: string;
  errorMessage?: string;
}

// Canonical telecom column patterns and aliases
const TELECOM_COLUMN_MAP: Record<string, string[]> = {
  customerID: ['customerid', 'custid', 'subscriberid', 'accountid', 'subid', 'clientid', 'id'],
  tenure: ['tenure', 'tenuremonths', 'tenure_months', 'tenureyears', 'months'],
  Contract: ['contract', 'contracttype', 'contract_type', 'agreement'],
  MonthlyCharges: ['monthlycharges', 'monthly_charges', 'monthlycharge', 'monthlyfee', 'recurringcharge'],
  TotalCharges: ['totalcharges', 'total_charges', 'totalcharge', 'totalspent', 'totalrevenue'],
  InternetService: ['internetservice', 'internet_service', 'internet', 'broadband', 'connectiontype'],
  PhoneService: ['phoneservice', 'phone_service', 'phone', 'voice', 'landline', 'multiplelines'],
  PaymentMethod: ['paymentmethod', 'payment_method', 'paymenttype', 'billingmethod'],
  TechSupport: ['techsupport', 'tech_support', 'technicalsupport'],
  OnlineSecurity: ['onlinesecurity', 'online_security', 'security'],
  Partner: ['partner', 'dependents', 'seniorcitizen'],
  Churn: ['churn', 'churned', 'churnstatus', 'churn_status', 'churnlabel', 'churn_label'],
};

// Core telecom features that distinguish a telecom dataset from generic SaaS/ecommerce
const STRONG_TELECOM_INDICATORS = [
  'internetservice',
  'phoneservice',
  'contract',
  'techsupport',
  'onlinesecurity',
  'tenure',
  'monthlycharges'
];

/**
 * Normalizes an arbitrary header string for schema matching
 */
export function normalizeHeader(header: string): string {
  return header.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Validates whether an uploaded dataset contains valid telecom subscriber attributes.
 *
 * Requirements:
 * - Must contain telecom subscriber attributes such as tenure, contract type, monthly charges,
 *   internet service, payment method, and churn status.
 * - Flexible schema matching across column aliases.
 * - Non-telecom datasets (e-commerce, SaaS, generic user logs) are rejected.
 */
export function validateTelecomDataset(headers: string[]): TelecomValidationResult {
  if (!headers || headers.length === 0) {
    return {
      isValid: false,
      matchedAttributes: [],
      missingAttributes: Object.keys(TELECOM_COLUMN_MAP),
      errorTitle: 'Invalid Telecom Dataset Detected.',
      errorMessage:
        'Please upload a valid telecom customer churn dataset containing telecom subscriber attributes such as tenure, contract type, monthly charges, internet service, payment method, and churn status.',
    };
  }

  const normalizedHeaders = headers.map(normalizeHeader);
  const matchedAttributes: string[] = [];
  const missingAttributes: string[] = [];

  for (const [canonicalName, aliases] of Object.entries(TELECOM_COLUMN_MAP)) {
    const isMatched = aliases.some(alias => 
      normalizedHeaders.includes(alias) || 
      normalizedHeaders.some(h => h.includes(alias))
    );

    if (isMatched) {
      matchedAttributes.push(canonicalName);
    } else {
      missingAttributes.push(canonicalName);
    }
  }

  // Count strong telecom indicators
  const strongIndicatorCount = STRONG_TELECOM_INDICATORS.filter(indicator =>
    normalizedHeaders.some(h => h.includes(indicator))
  ).length;

  // A dataset is valid if it has at least 3 strong telecom indicators AND at least 4 overall matched telecom attributes
  const isValidTelecom = strongIndicatorCount >= 3 && matchedAttributes.length >= 4;

  if (!isValidTelecom) {
    return {
      isValid: false,
      matchedAttributes,
      missingAttributes,
      errorTitle: 'Invalid Telecom Dataset Detected.',
      errorMessage:
        'Please upload a valid telecom customer churn dataset containing telecom subscriber attributes such as tenure, contract type, monthly charges, internet service, payment method, and churn status.',
    };
  }

  return {
    isValid: true,
    matchedAttributes,
    missingAttributes,
  };
}
