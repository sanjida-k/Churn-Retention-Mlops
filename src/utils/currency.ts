export type RegionCurrencyCode = 'INR' | 'USD' | 'EUR' | 'JPY' | 'KRW';

export interface RegionCurrencyConfig {
  code: RegionCurrencyCode;
  country: string;
  currencyName: string;
  symbol: string;
  label: string;
  locale: string;
  rate: number;
}

export const REGION_CURRENCY_MAP: Record<RegionCurrencyCode, RegionCurrencyConfig> = {
  INR: {
    code: 'INR',
    country: 'India',
    currencyName: 'INR',
    symbol: '₹',
    label: 'India (INR ₹)',
    locale: 'en-IN',
    // 1500 USD -> 125000 INR (125,000 / 1500 = 83.33333333333333)
    rate: 125000 / 1500,
  },
  USD: {
    code: 'USD',
    country: 'United States',
    currencyName: 'USD',
    symbol: '$',
    label: 'United States (USD $)',
    locale: 'en-US',
    rate: 1.0,
  },
  EUR: {
    code: 'EUR',
    country: 'Europe',
    currencyName: 'EUR',
    symbol: '€',
    label: 'Europe (EUR €)',
    locale: 'en-IE',
    rate: 1.0,
  },
  JPY: {
    code: 'JPY',
    country: 'Japan',
    currencyName: 'JPY',
    symbol: '¥',
    label: 'Japan (JPY ¥)',
    locale: 'ja-JP',
    // 1500 USD -> 150000 JPY
    rate: 100.0,
  },
  KRW: {
    code: 'KRW',
    country: 'South Korea',
    currencyName: 'KRW',
    symbol: '₩',
    label: 'South Korea (KRW ₩)',
    locale: 'ko-KR',
    // 1500 USD -> 1500000 KRW
    rate: 1000.0,
  },
};

export interface FormatCurrencyOptions {
  compact?: boolean;
  decimals?: number;
}

/**
 * Formats a monetary amount (provided in baseline USD units)
 * into the selected region's currency and locale-specific format.
 */
export function formatCurrency(
  amountInUSD: number,
  currencyCode: RegionCurrencyCode = 'INR',
  options?: FormatCurrencyOptions
): string {
  if (isNaN(amountInUSD) || amountInUSD === null || amountInUSD === undefined) {
    amountInUSD = 0;
  }

  const config = REGION_CURRENCY_MAP[currencyCode] || REGION_CURRENCY_MAP.INR;
  const converted = amountInUSD * config.rate;

  let maxDecimals = 0;
  if (options?.decimals !== undefined) {
    maxDecimals = options.decimals;
  } else if (currencyCode === 'USD' || currencyCode === 'EUR') {
    maxDecimals = Number.isInteger(converted) ? 0 : 2;
  } else {
    maxDecimals = 0;
  }

  if (options?.compact) {
    const formatted = new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: config.currencyName,
      notation: 'compact',
      maximumFractionDigits: options?.decimals !== undefined ? options.decimals : 1,
    }).format(converted);
    return formatted.replace('￥', '¥');
  }

  const formatted = new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.currencyName,
    maximumFractionDigits: maxDecimals,
  }).format(converted);

  return formatted.replace('￥', '¥');
}

/**
 * Helper to replace dollar amounts in SHAP explanation strings or labels.
 * E.g. "$98.45/mo" -> "₹8,204/mo"
 */
export function formatCurrencyInText(
  text: string,
  currencyCode: RegionCurrencyCode = 'INR'
): string {
  if (!text || typeof text !== 'string') return text;
  return text.replace(/\$(\d+(?:\.\d+)?)/g, (_, numStr) => {
    const num = parseFloat(numStr);
    return formatCurrency(num, currencyCode);
  });
}
