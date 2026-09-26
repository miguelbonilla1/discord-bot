import { readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { REST, Routes } from 'discord.js';
import { getRequiredEnv } from './src/config/config.js';

const directory = resolve('src/slashCommands');
const files = (await readdir(directory)).filter((file) => file.endsWith('.js'));
const commands = [];

for (const file of files) {
  const command = await import(pathToFileURL(resolve(directory, file)).href);
  commands.push(command.data.toJSON());
}

const clientId = getRequiredEnv('CLIENT_ID');
const token = getRequiredEnv('DISCORD_TOKEN');
const guildId = process.env.GUILD_ID?.trim();
const route = guildId ? Routes.applicationGuildCommands(clientId, guildId) : Routes.applicationCommands(clientId);
const rest = new REST({ version: '10' }).setToken(token);

console.log(`Registering ${commands.length} commands ${guildId ? `for guild ${guildId}` : 'globally'}...`);
await rest.put(route, { body: commands });
console.log('Discord commands registered successfully.');
