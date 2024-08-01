append to your ~/.bashrc or ~/.zshrc :

```sh
export APM_REPO_DIR="Your cloned APM Repo Path" # like /Users/username/apm
alias apm-caddy="cd $APM_REPO_DIR && caddy run --config ./caddy/Caddyfile"
alias apm-front="cd $APM_REPO_DIR && cd frt && . ../setenv.sh && pnpm run dev"
alias apm-backend="cd $APM_REPO_DIR && . ./setenv.sh && symlink-dir apm-init $APM_LOCAL_REPOSITORY_DIR/apm-init && pnpm run dev.tsc.once && node ./build/index.js --inspect=9449"
```

Use `apm-caddy` to start caddy, `apm-front` to start frontend, `apm-backend` to start backend.

## Q&A

### how to get setenv.sh

```sh
cd $APM_REPO_DIR
bash ./installer/installer.sh
```

### backend node module not found

```sh
cd $APM_REPO_DIR
pnpm install
```

### frt node module not found

```sh
cd $APM_REPO_DIR/frt
pnpm install
```

### mongodb not found

```sh
docker run --name myMongo -d -p 27017:27017 -u $(id -u):$(id -g) -v $HOME/mongodb6:/data/db mongodb/mongodb-community-server:latest --dbpath /data/db --replSet rs0
```

## redis not found

```sh
docker run --rm --name myRedis -p 6379:6379 -d redis:latest
```
