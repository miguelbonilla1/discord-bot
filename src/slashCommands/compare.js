import { SlashCommandBuilder } from 'discord.js';
import { config } from '../config/config.js';
import { getCryptoQuotes, MarketDataError } from '../services/coinmarketcap.js';
import { createComparisonEmbed } from '../presentation/embeds.js';
import { normalizeSymbols } from '../utils/formatters.js';
import { replyWithError } from '../utils/interaction.js';

export const data = new SlashCommandBuilder()
  .setName('compare')
  .setDescription('Compare the market performance of up to five cryptocurrencies')
  .addStringOption((option) => option.setName('symbols').setDescription('Comma-separated symbols, for example BTC, ETH, SOL').setRequired(true).setMaxLength(80))
  .addStringOption((option) => option.setName('currency').setDescription('Currency used to display values').addChoices(
    { name: 'US Dollar (USD)', value: 'USD' },
    { name: 'Euro (EUR)', value: 'EUR' },
    { name: 'Brazilian Real (BRL)', value: 'BRL' },
  ));

export async function execute(interaction) {
  await interaction.deferReply();
  try {
    const symbols = normalizeSymbols(interaction.options.getString('symbols', true), config.maxCompareSymbols);
    if (symbols.length < 2) {
      throw new MarketDataError('At least two symbols are required.', 'Enter at least two symbols, for example: BTC, ETH.');
    }
    const currency = interaction.options.getString('currency') ?? 'USD';
    const assets = await getCryptoQuotes(symbols, currency);
    if (assets.length < 2) {
      throw new MarketDataError('Fewer than two assets returned.', 'I could not find enough valid assets to compare.');
    }
    await interaction.editReply({ embeds: [createComparisonEmbed(assets)] });
  } catch (error) {
    await replyWithError(interaction, error);
  }
}
