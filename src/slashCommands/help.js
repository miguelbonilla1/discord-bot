import { SlashCommandBuilder } from 'discord.js';
import { createHelpEmbed } from '../presentation/embeds.js';

export const data = new SlashCommandBuilder().setName('help').setDescription('Show the Crypto Pulse command guide');

export async function execute(interaction) {
  await interaction.reply({ embeds: [createHelpEmbed()], ephemeral: true });
}
