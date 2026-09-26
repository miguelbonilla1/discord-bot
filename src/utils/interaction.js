import { MarketDataError } from '../services/coinmarketcap.js';

export const replyWithError = async (interaction, error) => {
  const content = error instanceof MarketDataError
    ? `⚠️ ${error.userMessage}`
    : '⚠️ Something went wrong while processing this command. Please try again.';
  console.error(`[command:${interaction.commandName}]`, error);
  if (interaction.deferred || interaction.replied) {
    await interaction.editReply({ content, embeds: [] });
    return;
  }
  await interaction.reply({ content, ephemeral: true });
};
