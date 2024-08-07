#!/usr/bin/env node
import { CLI_AGENT } from './CLIAgent.js';

try {
    await CLI_AGENT.main();
} catch (error) {
    console.log(error.message)
}
