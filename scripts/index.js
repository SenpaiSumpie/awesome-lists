// @ts-check
console.clear();
/* -------------------------------------------------------------------------- */
import { select } from '@inquirer/prompts';
import c from 'chalk';
import { Command } from 'commander';
import { $ } from 'execa';
import fse from 'fs-extra';
import path from 'path';
import { _dirname } from './utils.js';
const $$ = $({ stdio: 'inherit' });
/* -------------------------------------------------------------------------- */
const __dirname = _dirname();
/* -------------------------------------------------------------------------- */

const program = new Command();

program
  .option('-c, --create', 'Create a new awesome list')
  .option('-u, --update', 'Update the main README.md file with the latest lists')
  .parse(process.argv);
//

program.parse();

const programOptions = program.opts();

/* -------------------------------------------------------------------------- */
let answer;
if (!!programOptions?.create) {
  answer = `node ${path.join(__dirname, 'make-new-list.js')}`;
} else if (!!programOptions?.update) {
  answer = `node ${path.join(__dirname, 'update-main.js')}`;
} else {
  answer = await select({
    message: 'What would you like to do?',
    choices: [
      {
        value: `node ${path.join(__dirname, 'make-new-list.js')}`,
        name: 'Create a new list',
        description: 'Create a new awesome list',
      },
      {
        value: `node ${path.join(__dirname, 'update-main.js')}`,
        name: 'Update Main README.md',
        description: 'Update the main README.md file with the latest lists',
      },
      { value: `pnpm run dev`, name: 'Start Development Server', description: 'Start Development Server' },
      { name: '🍿', value: 'exit', description: 'Just looking around...(exit)' },
    ],
  });
}
// Start Development Server
if (answer === 'exit') {
  console.clear();
  process.exit(0);
}

try {
  await $$`${answer}`;
} catch (err) {
  console.log(`\n${c.red`Oops!`} ${c.yellow`(⚆_⚆)`}\n`.concat(c.red(`Something went wrong.\n${err?.message ?? ''}`)));
  process.exit(0);
}
