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
  answer = './make-new-list.js';
} else if (!!programOptions?.update) {
  answer = './update-main.js';
} else {
  answer = await select({
    message: 'What would you like to do?',
    choices: [
      { value: './make-new-list.js', name: 'Create a new list', description: 'Create a new awesome list' },
      {
        value: './update-main.js',
        name: 'Update Main README.md',
        description: 'Update the main README.md file with the latest lists',
      },
      { name: '🍿', value: 'exit', description: 'Just looking around...(exit)' },
    ],
  });
}

if (answer === 'exit') {
  console.clear();
  process.exit(0);
}

try {
  const filePath = path.join(__dirname, answer);

  const fileExists = await fse.exists(filePath);

  if (!fileExists) throw new Error('File does not exist');

  await $$`node ${filePath}`;
} catch (err) {
  console.log(`\n${c.red`Oops!`} ${c.yellow`(⚆_⚆)`}\n`.concat(c.red(`Something went wrong.\n${err?.message ?? ''}`)));
  process.exit(0);
}
