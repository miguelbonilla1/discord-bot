import { EmbedBuilder } from 'discord.js';
import { config } from '../config/config.js';
import { formatCompactMoney, formatMoney, formatPercent, formatSupply } from '../utils/formatters.js';

const trendColor = (change) => change > 0
  ? config.colors.positive
  : change < 0 ? config.colors.negative : config.colors.neutral;

export const createCryptoEmbed = (asset) =>
  new EmbedBuilder()
    .setColor(trendColor(asset.percentChange24h))
    .setTitle(`${asset.name} (${asset.symbol})`)
    .setURL(`https://coinmarketcap.com/currencies/${asset.slug}/`)
    .setDescription(`**${formatMoney(asset.price, asset.currency)}**  ·  Rank #${asset.rank ?? 'N/A'}`)
    .addFields(
      { name: '1 hour', value: formatPercent(asset.percentChange1h), inline: true },
      { name: '24 hours', value: formatPercent(asset.percentChange24h), inline: true },
      { name: '7 days', value: formatPercent(asset.percentChange7d), inline: true },
      { name: 'Market cap', value: formatCompactMoney(asset.marketCap, asset.currency), inline: true },
      { name: '24h volume', value: formatCompactMoney(asset.volume24h, asset.currency), inline: true },
      { name: 'Circulating supply', value: formatSupply(asset.circulatingSupply, asset.symbol), inline: true },
    )
    .setFooter({ text: `CoinMarketCap · ${asset.currency} · Market data, not financial advice` })
    .setTimestamp(asset.lastUpdated ? new Date(asset.lastUpdated) : new Date());

export const createComparisonEmbed = (assets) => {
  const sorted = [...assets].sort((a, b) => b.percentChange24h - a.percentChange24h);
  const currency = sorted[0]?.currency ?? 'USD';
  const lines = sorted.map((asset, index) => [
    `**${index + 1}. ${asset.name} (${asset.symbol})**`,
    `${formatMoney(asset.price, currency)} · 24h ${formatPercent(asset.percentChange24h)}`,
    `Market cap ${formatCompactMoney(asset.marketCap, currency)}`,
  ].join('\n'));

  return new EmbedBuilder()
    .setColor(config.colors.primary)
    .setTitle('Market comparison')
    .setDescription(lines.join('\n\n'))
    .setFooter({ text: `Sorted by 24h performance · ${currency} · Not financial advice` })
    .setTimestamp();
};

export const createHelpEmbed = () =>
  new EmbedBuilder()
    .setColor(config.colors.primary)
    .setTitle('Crypto Pulse commands')
    .setDescription('Live cryptocurrency insights directly inside Discord.')
    .addFields(
      { name: '/crypto', value: 'Detailed quote, market cap, volume and performance for one asset.' },
      { name: '/compare', value: 'Compare up to five symbols and rank them by 24-hour performance.' },
      { name: '/help', value: 'Display this command guide.' },
      { name: '!crypto BTC', value: 'Legacy text-command alternative.' },
    )
    .setFooter({ text: 'Data provided by CoinMarketCap' });
