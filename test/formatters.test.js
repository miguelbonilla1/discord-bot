import test from 'node:test';
import assert from 'node:assert/strict';
import { formatMoney, formatPercent, normalizeCurrency, normalizeSymbol, normalizeSymbols } from '../src/utils/formatters.js';

test('normalizes one cryptocurrency symbol', () => {
  assert.equal(normalizeSymbol(' btc! '), 'BTC');
});

test('normalizes, deduplicates and limits a symbol list', () => {
  assert.deepEqual(normalizeSymbols('btc, eth BTC; sol ada', 3), ['BTC', 'ETH', 'SOL']);
});

test('falls back to USD for unsupported currencies', () => {
  assert.equal(normalizeCurrency('cad'), 'USD');
});

test('formats positive and negative market changes', () => {
  assert.equal(formatPercent(2.345), '▲ +2.35%');
  assert.equal(formatPercent(-1.2), '▼ -1.20%');
});

test('preserves precision for low-priced assets', () => {
  assert.equal(formatMoney(0.00001234, 'USD'), '$0.00001234');
});
