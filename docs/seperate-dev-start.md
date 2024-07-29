~/.bashrc or ~/.zshrc :

```sh
export APM_REPO_DIR="Your cloned APM Repo Path" # like /Users/username/apm
alias apm-caddy="cd $APM_REPO_DIR && caddy run --config ./caddy/Caddyfile"
alias apm-front="cd $APM_REPO_DIR && cd frt && . ../setenv.sh && pnpm run dev"
alias apm-backend="cd $APM_REPO_DIR && . ./setenv.sh && symlink-dir apm-init $APM_LOCAL_REPOSITORY_DIR/apm-init && pnpm run dev.tsc.once && node ./build/index.js --inspect=9449"
```

Use `apm-caddy` to start caddy, `apm-front` to start frontend, `apm-backend` to start backend.
