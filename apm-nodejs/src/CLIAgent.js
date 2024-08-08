#!/usr/bin/env node
import fs from "fs-extra";
import inquirer from "inquirer";
import Joi from "joi";
import minimist from 'minimist';
import path from 'path';
import { APM_AGENT } from './APMAgent.js';

class CLIAgent {
	regex = {
		author: /^[a-zA-Z][a-zA-Z0-9_\-]{2,28}[a-zA-Z0-9]$/,
		password: /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,20}$/,
		agentName: /^[a-zA-Z][a-zA-Z0-9_\-]{0,28}[a-zA-Z0-9]?$/,
	};
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
			return;
		}

		// uninstall
		if (_[0] === 'uninstall') {
			const agentSpec = _[1];
			await APM_AGENT.uninstall(agentSpec);
			return
		}

		// list
		if (_[0] === 'list') {
			await APM_AGENT.list({
				...options,

				_: undefined
			});
			return;
		}

		if (_[0] === 'init') {
			await this.init(options);
			return;
		}

		// publish
		if (_[0] === 'publish') {
			await this.login(options);
			await APM_AGENT.publish();
			return;
		}

		// login
		if (_[0] === 'login') {
			await this.login(options);
			return;
		}

		// search
		if (_[0] === 'search') {
			await APM_AGENT.search({
				...options,

				_: undefined
			});
			return;
		}

		// run
		if (_[0] === 'run') {
			const agentSpec = _[1];
			await APM_AGENT.run(agentSpec, {
				input: options["i"] || options["input"]
			});
			return
		}


		// Command not exist
		console.log(`Command ${_[0]} not exist. Try apm --help`);
	}

	async init(options) {
		try {

			// author
			if (!options.author) {
				const answers = await inquirer.prompt([
					{
						type: "input",
						name: "author",
						message: "Agent author:",
						validate: (input) => {
							const schema = Joi.string()
								.regex(this.regex.author)
								.lowercase()
								.required().label("author")
							const e = schema.validate(input).error;
							if (e?.message) {
								return e.message;
							}
							return true;
						}
					}
				])
				options.author = answers.author
			}

			// name, 
			if (!options.name) {
				const answers = await inquirer.prompt([
					{
						type: "input",
						name: "name",
						message: `Agent name:`,
						transformer: function (input) {
							return `${options.author}/${input}`
						},
						validate: (input) => {
							const schema = Joi.string()
								.regex(this.regex.agentName)
								.required().label("name")
							const e = schema.validate(input).error;
							if (e?.message) {
								return e.message;
							}
							return true;
						}
					}
				])
				options.name = `${options.author}/${answers.name}`
			}

			// executor
			if (!options.executor) {
				const answers = await inquirer.prompt({
					type: "list",
					name: "executor",
					message: "Agent executor:",
					choices: [
						{ name: "python", value: "python" },
						{ name: "nodejs", value: "nodejs" },
						{ name: "remote", value: "remote" },
					]
				})
				options.executor = answers.executor
			}

			// force
			if (!options.force) {
				const agentName = options.name.split("/").at(-1);
				const agentdir = path.resolve(agentName)
				if (await fs.exists(agentdir)) {
					const answers = await inquirer.prompt([
						{
							type: "confirm",
							name: "force",
							message: `Agent folder already exists in ${agentdir}, overwrite?`,
							default: false
						}
					])
					options.force = answers.force

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
			if (error.message === "items.findLastIndex is not a function") {
				console.log("Try upgrade Node.Js >= 18.0.0")
			}
		}
	}
	async login(options) {
		try {
			console.log('Login or register to Agent Store...',);

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
						type: "input",
						name: "username",
						message: `Agent Store username:`,
						validate: (input) => {
							const schema = Joi.string()
								.regex(this.regex.author)
								.lowercase()
								.required().label("username")
							const e = schema.validate(input).error;
							if (e?.message) {
								return e.message;
							}
							return true;
						}
					}
				])
				options.username = answers.username
			}

			// password
			if (!options.password) {
				const answers = await inquirer.prompt([

					{
						type: "password",
						name: "password",
						message: `Agent Store password:`,
						mask: '*',
						validate: (input) => {
							const schema = Joi.string()
								.regex(this.regex.password)
								.required().label("password")
							const e = schema.validate(input).error;
							if (e?.message) {
								return e.message;
							}
							return true;
						}
					}
				])
				options.password = answers.password
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
