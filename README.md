APM (Agent Package Manager)

# Quick

1. Download [docker-compose.yml](./docker-compose.yml) to start APM Server
   ```sh
   docker compose -f docker-compose.yml up
   ```
   http://127.0.0.1:12008/documentation
2. Install agent from APM CLI [@fynal-ai/apm](https://www.npmjs.com/package/@fynal-ai/apm)
   ```sh
   pnpm install -g @fynal-ai/apm
   apm --help
   ```

# Development

[seperate-dev-start.md](./docs/seperate-dev-start.md)
