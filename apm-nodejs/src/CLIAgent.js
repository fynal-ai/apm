#!/usr/bin/env node
import fs from 'fs-extra';
import inquirer from 'inquirer';
import minimist from 'minimist';
import path from 'path';
import { APM_AGENT } from './APMAgent.js';

class CLIAgent {
	async main() {
		const options = minimist(process.argv.slice(2));
		// console.log('options', options);

		// version
		if (options.version || options.v) {
			const version = await APM_AGENT.getCLIVersion();
			console.log(version);
			return;
		}

		// help
		if (options.help || options._.length === 0) {
			const version = await APM_AGENT.getCLIVersion();
			console.log(`APM(Agent Package Manager) CLI v${version}

Usage: apm [command] [flags]
       apm [ -h | --help | -v | --version ]

Create agent in cwd from template
  apm init
  apm init --author <author> --name <name> --executor <executor>
  apm init --author <author> --name <name> --executor <executor> --force

Install agent to APM server from local folder or agent store. If no agent name is specified, the agent in the current folder is installed. Duplicate agents are overwritten.
  apm install <agent-folder>
  apm install	
  apm install .
  apm install <name>[:version]

Uninstall agent. If no agent name is specified, the agent in the current folder is uninstalled in APM Server.
  apm uninstall
  apm uninstall <name>[:version]

List installed agents in APM Server
  apm list
  apm list --limit 20
  apm list --q "hello"
  apm list --executor nodejs

View agent details in APM Server
  apm inspect <name>[:version]

Publish cwd agent folder to Agent Store
  apm publish

Login to agent store. If no username is specified, the username in $HOME/.apm/apm.json is used.
  apm login
  apm login --username <username>
  apm login --username <username> --password <password>

Search agents in Agent Store
  apm search
  apm search --limit 20
  apm search --q "hello"
  apm search --executor nodejs

Update apm package to latest in local Node.Js Agent Folders together:
  for i in $(ls); do pnpm add @fynal-ai/apm:latest --dir $i; done

Install local Agent Folders together to APM Server:
  for i in $(ls); do apm install $i; done
        `);
			return;
		}

		const { _ } = options;

		// read agent.sjon
		await APM_AGENT.loadConfig();

		// install
		let agentSpec = '';
		switch (_[0]) {
			case 'install':
				agentSpec = _[1];

				// install from Agent Store, login if needed
				if (agentSpec) {
					const isAgentFolder = await APM_AGENT.isAgentFolder(agentSpec);
					if (!isAgentFolder) {
						console.log(`Try install from Agent Store`);
						await this.login(options);
					}
				}

				await APM_AGENT.install(agentSpec);
				break;

			// uninstall
			case 'uninstall':
				agentSpec = _[1];
				await APM_AGENT.uninstall(agentSpec);
				break;

			// inspect
			case 'inspect':
				agentSpec = _[1];
				await APM_AGENT.inspect(agentSpec);
				break;

			// list
			case 'list':
				await APM_AGENT.list({
					...options,

					_: undefined,
				});
				break;

			case 'init':
				await this.init(options);
				break;

			// publish
			case 'publish':
				await this.login(options);
				await APM_AGENT.publish();
				break;

			// login
			case 'login':
				await this.login(options);
				break;

			// search
			case 'search':
				await APM_AGENT.search({
					...options,

					_: undefined,
				});
				break;

			// run
			case 'run':
				agentSpec = _[1];
				await APM_AGENT.run(agentSpec, {
					input: options['i'] || options['input'],
				});
				break;
			default:
				console.log(`Command ${_[0]} is unknown. Try apm --help`);
		}

		// Command not exist
	}

	async init(options) {
		try {
			// author
			if (!options.author) {
				const answers = await inquirer.prompt([
					{
						type: 'input',
						name: 'author',
						message: 'Agent author:',
						validate: (input) => {
							return APM_AGENT.validateAuthor(input);
						},
					},
				]);
				options.author = answers.author;
			}

			// name,
			if (!options.name) {
				const answers = await inquirer.prompt([
					{
						type: 'input',
						name: 'name',
						message: `Agent name:`,
						transformer: function (input) {
							return `${options.author}/${input}`;
						},
						validate: (input) => {
							return APM_AGENT.validateAgentName(input);
						},
					},
				]);
				options.name = `${options.author}/${answers.name}`;
			}

			// executor
			if (!options.executor) {
				const answers = await inquirer.prompt({
					type: 'list',
					name: 'executor',
					message: 'Agent executor:',
					choices: [
						{ name: 'python', value: 'python' },
						{ name: 'nodejs', value: 'nodejs' },
						{ name: 'remote', value: 'remote' },
					],
				});
				options.executor = answers.executor;
			}

			// apikey_provider
			if (!options.apikey_provider) {
				const answers = await inquirer.prompt({
					type: 'list',
					name: 'apikey_provider',
					message: 'API Key Provider:',
					choices: [
						{ name: 'from User', value: 'user' },
						{ name: 'from Me', value: 'me' },
					],
				});
				options.apikey_provider = answers.apikey_provider;
			}

			// force
			if (!options.force) {
				const agentName = options.name.split('/').at(-1);
				const agentdir = path.resolve(agentName);
				if (await fs.exists(agentdir)) {
					const answers = await inquirer.prompt([
						{
							type: 'confirm',
							name: 'force',
							message: `Agent folder already exists in ${agentdir}, overwrite?`,
							default: false,
						},
					]);
					options.force = answers.force;

					// loop ask name
					if (options.force != true) {
						delete options.name;
						return this.init(options);
					}
				}
			}

			await APM_AGENT.init(options);
		} catch (error) {
			console.log(error.message);
			if (error.message === 'items.findLastIndex is not a function') {
				console.log('Try upgrade Node.Js >= 18.0.0');
			}
		}
	}

	async login(options) {
		try {
			console.log('Login or register to Agent Store...');

			if (APM_AGENT.agentStoreSessionToken && !options.username && !options.password) {
				console.log(
					`Logged to Agent Store with user`,
					options.username || APM_AGENT.agentStoreUsername
				);
				return;
			}

			// username
			if (!options.username) {
				const answers = await inquirer.prompt([
					{
						type: 'input',
						name: 'username',
						message: `Agent Store username:`,
						validate: (input) => {
							return APM_AGENT.validateUsername(input);
						},
					},
				]);
				options.username = answers.username;
			}

			// password
			if (!options.password) {
				const answers = await inquirer.prompt([
					{
						type: 'password',
						name: 'password',
						message: `Agent Store password:`,
						mask: '*',
						validate: (input) => {
							return APM_AGENT.validatePassword(input);
						},
					},
				]);
				options.password = answers.password;
			}

			await APM_AGENT.login({ username: options.username, password: options.password });

			console.log(
				`Logged to Agent Store with user`,
				options.username || APM_AGENT.agentStoreUsername
			);
		} catch (error) {
			console.log(error.message);
		}
	}
}

const CLI_AGENT = new CLIAgent();

export { CLI_AGENT };
