import { getCryptoQuote, MarketDataError } from '../services/coinmarketcap.js';
import { createCryptoEmbed } from '../presentation/embeds.js';

export const handleCryptoCommand = async (message) => {
  const args = message.content.trim().split(/\s+/);
  const symbol = args[1];
  const currency = args[2] ?? 'USD';

  if (!symbol) {
    await message.reply('Use `!crypto BTC` or `!crypto BTC BRL`.');
    return;
  }

  try {
    const asset = await getCryptoQuote(symbol, currency);
    await message.reply({ embeds: [createCryptoEmbed(asset)] });
  } catch (error) {
    console.error('[command:legacy-crypto]', error);
    const content = error instanceof MarketDataError ? error.userMessage : 'Market data is temporarily unavailable.';
    await message.reply(`⚠️ ${content}`);
  }
};
