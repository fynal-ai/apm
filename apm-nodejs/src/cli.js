#!/usr/bin/env node
import minimist from 'minimist';
function main() {
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
}
main();
