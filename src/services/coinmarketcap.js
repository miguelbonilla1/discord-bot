import axios from 'axios';
import { getRequiredEnv } from '../config/config.js';
import { normalizeCurrency, normalizeSymbols } from '../utils/formatters.js';

const API_URL = 'https://pro-api.coinmarketcap.com/v1';

export class MarketDataError extends Error {
  constructor(message, userMessage, cause) {
    super(message, { cause });
    this.name = 'MarketDataError';
    this.userMessage = userMessage;
  }
}

const mapQuote = (asset, currency) => {
  const quote = asset?.quote?.[currency];
  if (!asset || !quote) return null;
  return {
    id: asset.id, name: asset.name, symbol: asset.symbol, slug: asset.slug, rank: asset.cmc_rank,
    circulatingSupply: asset.circulating_supply, totalSupply: asset.total_supply, maxSupply: asset.max_supply,
    price: quote.price, volume24h: quote.volume_24h, volumeChange24h: quote.volume_change_24h,
    percentChange1h: quote.percent_change_1h, percentChange24h: quote.percent_change_24h,
    percentChange7d: quote.percent_change_7d, marketCap: quote.market_cap,
    marketCapDominance: quote.market_cap_dominance, lastUpdated: quote.last_updated, currency,
  };
};

export const getCryptoQuotes = async (symbols, currency = 'USD') => {
  const normalizedSymbols = normalizeSymbols(symbols);
  const normalizedCurrency = normalizeCurrency(currency);
  if (normalizedSymbols.length === 0) {
    throw new MarketDataError('No valid symbols supplied.', 'Enter at least one valid symbol, such as BTC.');
  }

  try {
    const response = await axios.get(`${API_URL}/cryptocurrency/quotes/latest`, {
      params: { symbol: normalizedSymbols.join(','), convert: normalizedCurrency },
      headers: { 'X-CMC_PRO_API_KEY': getRequiredEnv('COINMARKETCAP_API_KEY'), Accept: 'application/json' },
      timeout: 10_000,
    });
    return normalizedSymbols.map((symbol) => {
      const result = response.data?.data?.[symbol];
      return mapQuote(Array.isArray(result) ? result[0] : result, normalizedCurrency);
    }).filter(Boolean);
  } catch (error) {
    if (error instanceof MarketDataError) throw error;
    const status = error.response?.status;
    const apiMessage = error.response?.data?.status?.error_message;
    if (status === 400) {
      throw new MarketDataError(apiMessage ?? 'Invalid market request.', 'I could not find that symbol. Try BTC, ETH or SOL.', error);
    }
    if (status === 429) {
      throw new MarketDataError('Rate limit reached.', 'The market data limit was reached. Please try again in a moment.', error);
    }
    throw new MarketDataError(apiMessage ?? error.message, 'Market data is temporarily unavailable. Please try again shortly.', error);
  }
};

export const getCryptoQuote = async (symbol, currency = 'USD') => {
  const [quote] = await getCryptoQuotes([symbol], currency);
  if (!quote) throw new MarketDataError(`No result for ${symbol}.`, 'I could not find that symbol. Try BTC, ETH or SOL.');
  return quote;
};
