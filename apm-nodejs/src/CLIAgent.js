#!/usr/bin/env node
import minimist from 'minimist';
import readline from 'readline';
import { APM_AGENT } from './APMAgent.js';
class CLIAgent {
	async main() {
		const options = minimist(process.argv.slice(2));
		// console.log('options', options);

		if (options.help || options._.length === 0) {
			const version = await APM_AGENT.getCLIVersion();
			console.log(`APM(Agent Package Manager) CLI v${version}

Usage:

  - show help
    apm
    apm --help
  - install agent from local folder or agent store
    apm install <agent-folder>
	apm install	
	apm install .
	apm install <name>:[version]
  - uninstall agent
    apm uninstall <name>:[version]
  - publish agent: cd to agent folder and publish agent
    apm publish
  - login to agent store
    apm login --username <username> --password <password>
	apm login
        `);
			return;
		}

		const { _ } = options;

		// read agent.sjon
		await APM_AGENT.loadConfig();

		// install
		if (_[0] === 'install') {
			const agentSpec = _[1];
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

		if (_[0] === 'init') {
			const rl = readline.createInterface({
				input: process.stdin,
				output: process.stdout,
			});

			let author = options.author;
			if (!author) {
				await new Promise((resolve) => {
					rl.question(`Agent author: `, async (input) => {
						author = input;

						resolve(true);
					});
				});
			}

			let name = options.name;
			if (!name) {
				await new Promise((resolve) => {
					rl.question(`Agent name: ${author}/`, async (input) => {
						name = `${author}/${input}`;

						resolve(true);
					});
				});
			}

			let executor = options.executor;
			if (!executor) {
				await new Promise((resolve) => {
					rl.question(`Agent executor (python, nodejs): `, async (input) => {
						executor = input;

						resolve(true);
					});
				});
			}

			rl.close();

			await APM_AGENT.init({ author, name, executor });
		}

		// publish
		if (_[0] === 'publish') {
			await this.login(options);
			await APM_AGENT.publish();
		}

		// login
		if (_[0] === 'login') {
			await this.login(options);
		}
	}
	async login(options) {
		console.log('Login to Agent Store...');
		if (!APM_AGENT.agentStoreSessionToken) {
			// read from cli
			const rl = readline.createInterface({
				input: process.stdin,
				output: process.stdout,
			});

			let username = options.username;
			if (!username) {
				await new Promise((resolve) => {
					rl.question(`Agent Store username: `, async (input) => {
						username = input;

						resolve(true);
					});
				});
				options.username = username;
			}

			let password = options.password;
			if (!password) {
				await new Promise((resolve) => {
					rl.question(`Agent Store password: `, async (input) => {
						password = input;

						resolve(true);
					});
				});
				options.password = password;
			}

			rl.close();

			await APM_AGENT.login({ username, password });
		}

		console.log(
			`Logged to Agent Store with user`,
			options.username || APM_AGENT.agentStoreUsername
		);
	}
}

const CLI_AGENT = new CLIAgent();

export { CLI_AGENT };