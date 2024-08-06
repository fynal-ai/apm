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
- publish cwd agent folder to Agent Store
  apm publish
- login to agent store. If no username is specified, the username in $HOME/.apm/apm.json is used.
  apm login
  apm login --username <username>
  apm login --username <username> --password <password>
```

```js
import { APMAgent } from '@fynal-ai/apm';

class Agent {
	constructor() {
		this.apmAgent = new APMAgent();
	}
	async run(params, saveconfig) {
		const output = {
			text: 'text',
		};

		this.apmAgent.save_output(saveconfig, output); // save output

		return output;
	}
}
```

## Dev

1. change code in `src` directory
2. change version in `package.json`
3. (login) pnpm config set '//registry.npmjs.org/:\_authToken' <YOUR_PUBLISH_TOKEN>
4. publish to npm
   ```sh
   pnpm run pubish
   ```

## Q&A

### items.findLastIndex is not a function

Upgrade Node.Js to >= 18.0.0

### apm --help is Atom Package Manage but not Agent Package Manage

1. which apm
2. mv <path/to/apm> <path/to/apm2>
