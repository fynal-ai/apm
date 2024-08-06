APM(Agent Package Manager) CLI and library

## Install as CLI

```sh
pnpm add -g @fynal-ai/apm
```

```sh
apm --help
```

## Program Usage

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
