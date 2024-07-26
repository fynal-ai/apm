#!/usr/bin/env node
import minimist from 'minimist';
import { APM_AGENT } from './APMAgent.js';
async function main() {
	const options = minimist(process.argv.slice(2));
	console.log('options', options);

	if (options.help) {
		console.log(`
Examples:

  - show help
    apm --help
  - init a agent package
    apm init    
  - login to Agent Store
    apm login
  - publish to Agent Store
    apm publish
  - install from Agent Store
    apm install <name>[:<version>]
        `);
		return;
	}

	const { _ } = options;

	// install
	if (_[0] === 'install') {
		const agentSpec = _[1];
		if (!agentSpec) {
			throw new Error('Invalid agent spec');
		}
		await APM_AGENT.install(agentSpec);
	}

	// uninstall
	if (_[0] === 'uninstall') {
		const agentSpec = _[1];
		if (!agentSpec) {
			throw new Error('Invalid agent spec');
		}
		await APM_AGENT.uninstall(agentSpec);
	}
}
main();
