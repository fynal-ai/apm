append to your ~/.bashrc or ~/.zshrc :

```sh
export APM_REPO_DIR="Your cloned APM Repo Path" # like /Users/username/apm
alias apm-caddy="cd $APM_REPO_DIR && caddy run --config ./caddy/Caddyfile"
alias apm-front="cd $APM_REPO_DIR && cd frt && . ../setenv.sh && pnpm run dev"
alias apm-backend="cd $APM_REPO_DIR && . ./setenv.sh && pnpm run dev.tsc.once && node ./build/index.js --inspect=9449"
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
# mongodb
docker run --name mongodb -d -p 27017:27017 --restart always -u root -v $HOME/mongodb6:/data/db mongodb/mongodb-community-server:latest --dbpath /data/db --replSet rs0
# mongosetup
sleep 5 && docker exec -it mongodb mongosh --host 127.0.0.1:27017 --eval "rs.initiate({ _id: \"rs0\", version: 1, members: [ { _id: 0, host : \"127.0.0.1:27017\" } ] })"
```

## redis not found

```sh
docker run --name redis -d --restart always -p 6379:6379 redis:latest
```
