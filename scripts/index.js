// @ts-check
import { select } from '@inquirer/prompts';
import c from 'chalk';
import { $ } from 'execa';
import fse from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
const $$ = $({ stdio: 'inherit' });
const __dirname = path.dirname(fileURLToPath(import.meta.url));
/* -------------------------------------------------------------------------- */
console.clear();
let answer;

// if args is create or update, then use that
const rtArg = process.argv[2].trim() ?? '';

if (!!rtArg && (rtArg === 'create' || rtArg === 'update')) {
  answer = rtArg === 'create' ? './make-new-list.js' : './update-main.js';
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
