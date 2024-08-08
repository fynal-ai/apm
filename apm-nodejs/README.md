APM(Agent Package Manager) CLI and library

## Install as CLI

```sh
pnpm add -g @fynal-ai/apm
```

```sh
apm --help
```

```
Usage:

- show help
  apm
  apm --help
- show version
  apm --version
  apm -v
- create agent in cwd from template
  apm init
  apm init --author <author> --name <name> --executor <executor>
  apm init --author <author> --name <name> --executor <executor> --force
- install agent from local folder or agent store. If no agent name is specified, the agent in the current folder is installed. Duplicate agents are overwritten.
  apm install <agent-folder>
  apm install
  apm install .
  apm install <name>[:version]
- uninstall agent. If no agent name is specified, the agent in the current folder is uninstalled in APM Server.
  apm uninstall
  apm uninstall <name>[:version]
- list installed agents in APM Server
  apm list
  apm list --limit 20
  apm list --q "hello"
  apm list --executor nodejs
- publish cwd agent folder to Agent Store
  apm publish
- login to agent store. If no username is specified, the username in $HOME/.apm/apm.json is used.
  apm login
  apm login --username <username>
  apm login --username <username> --password <password>
- search agents in Agent Store
  apm search
  apm search --limit 20
  apm search --q "hello"
  apm search --executor nodejs
```

## Program Usage

We package some utilities to help you to create agent.

```js
import { APMAgent } from '@fynal-ai/apm';

class Agent {
	constructor() {
		this.apmAgent = new APMAgent();
	}
	async run(input, saveconfig) {
		const output = {
			text: 'text',
		};

		this.apmAgent.save_output(saveconfig, output); // save output by saveconfig when saveconfig is setted, or print output to console

		return output;
	}
}
```

## Dev

Join US to Contribute:

1. fork at https://github.com/fynal-ai/apm
2. goto `apm-nodejs` directory
3. change code in `src` directory
4. change version in `package.json`
5. (login) pnpm config set '//registry.npmjs.org/:\_authToken' <YOUR_PUBLISH_TOKEN>
6. publish to npm
   ```sh
   pnpm run pubish
   ```

## Q&A

### items.findLastIndex is not a function

Upgrade Node.Js to >= 18.0.0

### apm --help is Atom Package Manage but not Agent Package Manage

1. which apm
2. mv <path/to/apm> <path/to/apm2>
