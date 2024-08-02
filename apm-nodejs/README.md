## Install as CLI

```sh
pnpm add -g @jobsimi/apm
```

```sh
apm --help
```

## Program Usage

```js
import { APMAgent } from '@jobsimi/apm';

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
3. publish to npm
   ```sh
   pnpm run pub
   ```
