# Crypto Pulse — Discord Market Assistant

Crypto Pulse turns a Discord server into a lightweight cryptocurrency dashboard. It retrieves live CoinMarketCap data, presents it in readable Discord embeds and lets communities compare assets without leaving the conversation.

## Why this project exists

Crypto communities often jump between Discord and external dashboards to answer simple market questions. Crypto Pulse keeps the useful context—price, trend, volume, market cap and supply—inside the channel where the discussion is already happening.

## Features

- Live quotes in USD, EUR or BRL
- 1-hour, 24-hour and 7-day performance
- Market cap, volume, circulating supply and ranking
- Comparison of up to five assets, sorted by 24-hour performance
- Rich embeds with positive and negative trend colors
- Slash commands plus a legacy `!crypto` command
- Per-user command cooldowns
- Friendly handling of invalid symbols, API limits and network failures
- Health endpoint for hosting platforms
- Graceful shutdown and environment validation
- Automated tests for market-data formatting and input normalization

## Commands

| Command | Example | Description |
| --- | --- | --- |
| `/crypto` | `/crypto symbol:BTC currency:USD` | Detailed market snapshot for one asset |
| `/compare` | `/compare symbols:BTC, ETH, SOL` | Compare up to five assets |
| `/help` | `/help` | Display the command guide |
| `!crypto` | `!crypto BTC BRL` | Legacy text-command alternative |

## Architecture

```text
Discord interaction
       │
       ▼
Command validation ──► cooldown protection
       │
       ▼
CoinMarketCap service ──► normalized market model
       │
       ▼
Discord embed presenter ──► user response
```

```text
src/
├── commands/          Legacy message commands
├── config/            Environment and runtime configuration
├── presentation/      Discord embed builders
├── services/          CoinMarketCap integration
├── slashCommands/     /crypto, /compare and /help
├── utils/             Formatting and interaction helpers
└── index.js           Discord client and health server
```

## Local setup

Requirements: Node.js 20+, a Discord application and a CoinMarketCap API key.

1. Clone the repository and run `npm install`.
2. Copy `.env.example` to `.env` and add your credentials.
3. Run `npm run deploy:commands` to register the Discord commands.
4. Run `npm start`.
5. Open `http://localhost:5000/health` to check its status.

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `DISCORD_TOKEN` | Yes | Discord bot authentication |
| `CLIENT_ID` | Yes | Discord application ID |
| `COINMARKETCAP_API_KEY` | Yes | Market-data API authentication |
| `GUILD_ID` | No | Fast command registration in a development server |
| `PORT` | No | Health server port; defaults to `5000` |

Never commit `.env`. If a credential has ever been included in Git history, rotate it before deploying.

## Tests

Run `npm test`. The suite uses Node's built-in test runner and does not call external services.

## Deployment note

Discord bots maintain a persistent gateway connection, so they should run on a long-lived Node.js service rather than a serverless function. Configure the same environment variables in the hosting provider and use `/health` for monitoring.

## Tech stack

Node.js · Discord.js · Express · Axios · CoinMarketCap API

## Disclaimer

Market data is informational and may be delayed. Nothing returned by this bot is financial advice.
