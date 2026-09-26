import dotenv from 'dotenv';

dotenv.config();

const parsePort = (value) => {
  const port = Number.parseInt(value ?? '5000', 10);
  return Number.isInteger(port) && port > 0 ? port : 5000;
};

export const config = Object.freeze({
  prefix: '!',
  port: parsePort(process.env.PORT),
  commandCooldownMs: 3_000,
  maxCompareSymbols: 5,
  colors: {
    primary: 0x7c3aed,
    positive: 0x22c55e,
    negative: 0xef4444,
    neutral: 0x64748b,
  },
});

export const getRequiredEnv = (name) => {
  const value = process.env[name]?.trim();

  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
};

export const validateEnvironment = () => {
  ['DISCORD_TOKEN', 'CLIENT_ID', 'COINMARKETCAP_API_KEY'].forEach(getRequiredEnv);
};
