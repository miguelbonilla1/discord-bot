import { readdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import express from 'express';
import { ActivityType, Client, Collection, Events, GatewayIntentBits } from 'discord.js';
import { config, getRequiredEnv, validateEnvironment } from './config/config.js';
import { handleCryptoCommand } from './commands/crypto.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const startedAt = Date.now();
const cooldowns = new Map();

validateEnvironment();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

client.slashCommands = new Collection();

const loadCommands = async () => {
  const directory = join(__dirname, 'slashCommands');
  const files = (await readdir(directory)).filter((file) => file.endsWith('.js'));
  for (const file of files) {
    const command = await import(pathToFileURL(join(directory, file)).href);
    if (!command.data?.name || typeof command.execute !== 'function') {
      throw new Error(`Invalid command module: ${file}`);
    }
    client.slashCommands.set(command.data.name, command);
  }
};

const cooldownRemaining = (interaction) => {
  const key = `${interaction.user.id}:${interaction.commandName}`;
  const remaining = config.commandCooldownMs - (Date.now() - (cooldowns.get(key) ?? 0));
  if (remaining > 0) return Math.ceil(remaining / 1_000);
  cooldowns.set(key, Date.now());
  setTimeout(() => cooldowns.delete(key), config.commandCooldownMs).unref();
  return 0;
};

client.once(Events.ClientReady, (readyClient) => {
  readyClient.user.setActivity('/crypto · /compare', { type: ActivityType.Watching });
  console.log(`Discord connected as ${readyClient.user.tag}. ${client.slashCommands.size} commands loaded.`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const command = client.slashCommands.get(interaction.commandName);
  if (!command) return;
  const seconds = cooldownRemaining(interaction);
  if (seconds > 0) {
    await interaction.reply({ content: `Please wait ${seconds}s before using this command again.`, ephemeral: true });
    return;
  }
  await command.execute(interaction);
});

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;
  if (message.content.toLowerCase().startsWith(`${config.prefix}crypto`)) await handleCryptoCommand(message);
});

client.on(Events.Error, (error) => console.error('[discord:error]', error));
client.on(Events.Warn, (warning) => console.warn('[discord:warning]', warning));

const app = express();
app.disable('x-powered-by');
app.get('/', (_request, response) => response.json({
  service: 'Crypto Pulse Discord Bot',
  status: client.isReady() ? 'online' : 'starting',
}));
app.get('/health', (_request, response) => response.status(client.isReady() ? 200 : 503).json({
  status: client.isReady() ? 'healthy' : 'starting',
  discord: client.isReady() ? 'connected' : 'disconnected',
  uptimeSeconds: Math.floor((Date.now() - startedAt) / 1_000),
  commands: client.slashCommands.size,
}));

const shutdown = (signal) => {
  console.log(`${signal} received. Closing Discord connection.`);
  client.destroy();
  process.exit(0);
};

process.once('SIGINT', () => shutdown('SIGINT'));
process.once('SIGTERM', () => shutdown('SIGTERM'));

await loadCommands();
app.listen(config.port, () => console.log(`Health server listening on port ${config.port}.`));
await client.login(getRequiredEnv('DISCORD_TOKEN'));
