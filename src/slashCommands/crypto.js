import { SlashCommandBuilder } from 'discord.js';
import { getCryptoQuote } from '../services/coinmarketcap.js';
import { createCryptoEmbed } from '../presentation/embeds.js';
import { replyWithError } from '../utils/interaction.js';

export const data = new SlashCommandBuilder()
  .setName('crypto')
  .setDescription('Show live market data for a cryptocurrency')
  .addStringOption((option) => option.setName('symbol').setDescription('Ticker symbol, for example BTC, ETH or SOL').setRequired(true).setMaxLength(12))
  .addStringOption((option) => option.setName('currency').setDescription('Currency used to display values').addChoices(
    { name: 'US Dollar (USD)', value: 'USD' },
    { name: 'Euro (EUR)', value: 'EUR' },
    { name: 'Brazilian Real (BRL)', value: 'BRL' },
  ));

export async function execute(interaction) {
  await interaction.deferReply();
  try {
    const symbol = interaction.options.getString('symbol', true);
    const currency = interaction.options.getString('currency') ?? 'USD';
    const asset = await getCryptoQuote(symbol, currency);
    await interaction.editReply({ embeds: [createCryptoEmbed(asset)] });
  } catch (error) {
    await replyWithError(interaction, error);
  }
}
