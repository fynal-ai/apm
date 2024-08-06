APM (Agent Package Manager)

## Quick

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

## Development

[seperate-dev-start.md](./docs/seperate-dev-start.md)

[publish-packages-to-public.md](./docs/publish-packages-to-public.md)

## Q&A

### Configure Agent Store endpoint to switch between dev and production environment

setenv.sh:

```sh
export APM_AGENT_STORE_BASE_URL="https://agentstoreemp.baystoneai.com"
```

docker-compose.yml:

```
- APM_AGENT_STORE_BASE_URL=http://172.16.7.141:11008
```
