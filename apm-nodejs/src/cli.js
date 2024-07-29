#!/usr/bin/env node
import minimist from 'minimist';
import { APM_AGENT } from './APMAgent.js';
async function main() {
	const options = minimist(process.argv.slice(2));

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
  - uninstall agent
    apm uninstall <name>[:<version>]
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

	// init
	if (_[0] === 'init') {
		await APM_AGENT.init();
	}

	// publish
	if (_[0] === 'publish') {
		await APM_AGENT.publish();
	}
}
main();
