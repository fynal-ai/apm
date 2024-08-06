## Docker: Push fynalai/apm:base and fynalai/apm:latest to registry.docker.io

```sh
cd $APM_LOCAL_REPOSITORY_DIR
# login
docker login --username fynalai

# build base
pnpm run docker.build.base
# push base
pnpm run docker.push.base

# build latest
pnpm run docker.build.latest
# push latest
pnpm run docker.push.latest
```

## npm: Publish @fynal-ai/apm to registry.npmjs.org

[Publish to npm](../apm-nodejs/README.md#dev)

```sh
cd $APM_LOCAL_REPOSITORY_DIR
cd apm-nodejs
pnpm run publish
```

## pypi: Publish fynal-ai-apm to pypi.org

[Publish to pypi](../apm-python/README.md#dev)

```sh
cd $APM_LOCAL_REPOSITORY_DIR
cd apm-python
pnpm run build
pnpm run publish
```
