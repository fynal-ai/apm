<div align="center">
	<h1>APM (Agent Package Manager)
</h1>
</div>

<br>

## Quick

1. Download [docker-compose.yml](./docker-compose.yml) to start APM Server
   ```sh
   docker compose -f docker-compose.yml up
   ```
   See http://127.0.0.1:12008/documentation for Application development.
2. Install agent from APM CLI [@fynal-ai/apm](https://www.npmjs.com/package/@fynal-ai/apm)
   ```sh
   pnpm install -g @fynal-ai/apm
   apm --help
   ```

## Deploy APM Server alone with exist external database

Instead of deploying all in one with [docker-compose.yml](./docker-compose.yml), you can deploy APM
Server alone with exist external database.

```sh
export APM_LOCAL_REPOSITORY_DIR=~/.apm

docker run --name apm-test --rm -p 12008:12008  -v $APM_LOCAL_REPOSITORY_DIR:/app/.apm -e MONGO_CONNECTION_STRING=<MONGO_CONNECTION_STRING> -e REDIS_CONNECTION_STRING=<REDIS_CONNECTION_STRING> fynalai/apm:latest
```

See http://127.0.0.1:12008/documentation for Application development.

For more environment variables, see [Dockerfile.latest](./Dockerfile.latest)

## Install agent from Agent Store

<div align="center">
	<img src="frt/static/svg/AgentFlow-Install agent from Agent Store.drawio.svg" alt="APM" />
</div>

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
