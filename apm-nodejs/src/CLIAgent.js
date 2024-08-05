#!/usr/bin/env node
import fs from "fs-extra";
import inquirer from "inquirer";
import Joi from "joi";
import minimist from 'minimist';
import path from 'path';
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
- create agent in cwd from template
  apm init
  apm init --author <author> --name <name> --executor <executor>
  apm init --author <author> --name <name> --executor <executor> --force
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
  apm login
  apm login --username <username>
  apm login --username <username> --password <password>
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
			await this.init(options);
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

	async init(options) {
		try {

			// author
			options = await inquirer.prompt([
				...(options.author ? [] : [
					{
						type: "input",
						name: "author",
						message: "Agent author:",
						validate: function (input) {
							const schema = Joi.string()
								.regex(/^[a-zA-Z][a-zA-Z0-9_]{2,28}[a-zA-Z0-9]$/)
								.lowercase()
								.required().min(2)
								.max(30).label("author")
							const e = schema.validate(input).error;
							if (e?.message) {
								return e.message;
							}
							return true;
						}
					}
				]),
			])

			// name, executor
			options = {
				...options,

				...await inquirer.prompt([

					...(options.name ? [] : [
						{
							type: "input",
							name: "name",
							message: `Agent name:`,
							transformer: function (input) {
								return `${options.author}/${input}`
							}
						}
					]),
					...(options.executor ? [] : [{
						type: "list",
						name: "executor",
						message: "Agent executor:",
						choices: [
							{ name: "python", value: "python" },
							{ name: "nodejs", value: "nodejs" },
							{ name: "remote", value: "remote" },
						]
					}])
				])
			}

			// force
			const agentName = options.name.split("/").at(-1);
			const agentdir = path.resolve(agentName)
			if (await fs.exists(agentdir)) {
				options = {
					...options,
					...await inquirer.prompt([
						{
							type: "confirm",
							name: "force",
							message: `Agent folder already exists in ${agentdir}, overwrite?`,
							default: false
						}
					])
				}
				if (options.force != true) {
					return;
				}
			}

			await APM_AGENT.init(options);
		} catch (error) {
			console.log(error.message);
		}
	}
	async login(options) {
		console.log('Login to Agent Store...');
		if (!APM_AGENT.agentStoreSessionToken || options.username || options.password) {
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
