const currencySymbols = { USD: '$', EUR: '€', BRL: 'R$' };

export const SUPPORTED_CURRENCIES = Object.freeze(Object.keys(currencySymbols));

export const normalizeSymbol = (value = '') =>
  String(value).trim().toUpperCase().replace(/[^A-Z0-9]/g, '');

export const normalizeSymbols = (value, limit = 5) => {
  const source = Array.isArray(value) ? value : String(value ?? '').split(/[\s,;]+/);
  return [...new Set(source.map(normalizeSymbol).filter(Boolean))].slice(0, limit);
};

export const normalizeCurrency = (value = 'USD') => {
  const currency = String(value).trim().toUpperCase();
  return SUPPORTED_CURRENCIES.includes(currency) ? currency : 'USD';
};

export const formatMoney = (value, currency = 'USD') => {
  if (!Number.isFinite(value)) return 'N/A';
  const maximumFractionDigits = value >= 1 ? 2 : value >= 0.01 ? 4 : 8;
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: normalizeCurrency(currency), maximumFractionDigits,
  }).format(value);
};

export const formatCompactMoney = (value, currency = 'USD') => {
  if (!Number.isFinite(value)) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: normalizeCurrency(currency), notation: 'compact', maximumFractionDigits: 2,
  }).format(value);
};

export const formatPercent = (value) => {
  if (!Number.isFinite(value)) return 'N/A';
  const arrow = value > 0 ? '▲' : value < 0 ? '▼' : '•';
  return `${arrow} ${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
};

export const formatSupply = (value, symbol) => {
  if (!Number.isFinite(value)) return 'N/A';
  const supply = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 2 }).format(value);
  return `${supply} ${symbol}`;
};
