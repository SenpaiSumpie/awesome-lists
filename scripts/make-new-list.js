// @ts-check
import { confirm, input } from '@inquirer/prompts';
import { capitalCase, kebabCase } from 'case-anything';
import fse from 'fs-extra';
import fsp from 'fs/promises';
import Handlebars from 'handlebars';
import { createSpinner } from 'nanospinner';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sleep = (ms = 2000) => new Promise((resolve) => setTimeout(resolve, ms));
/* -------------------------------------------------------------------------- */
await createNewList();
/* -------------------------------------------------------------------------- */
async function createNewList() {
  const config = {
    title: await input({
      message: 'Enter a name for your new list:',
      validate: (input) => !!input.trim() || 'Please enter a name',
    }),
    description: await input({
      message: 'Enter a description for your new list:',
      validate: (input) => !!input.trim() || 'Please enter a description',
    }),
    date: new Date().toLocaleString(),
  };

  const spinner = createSpinner('Creating new list...').start();

  try {
    const listTemplate = Handlebars.compile(await fsp.readFile(path.join(__dirname, 'templates/list.hbs'), 'utf-8'));
    const titleTemplate = Handlebars.compile(await fsp.readFile(path.join(__dirname, 'templates/title.hbs'), 'utf-8'));

    const newListmd = listTemplate({ description: config.description, date: config.date });
    const newTitlemd = titleTemplate({ title: capitalCase(config.title.trim()) });

    const newListDir = path.join(__dirname, '..', 'lists', kebabCase(config.title.trim()));

    spinner.update({ text: 'Creating new list directory...' });
    await fsp.mkdir(newListDir);
    const assetsDir = path.join(newListDir, 'assets');
    await fsp.mkdir(assetsDir);

    spinner.update({ text: 'Creating a .gitkeep file...' });
    await fse.createFile(path.join(assetsDir, '.gitkeep'));

    spinner.update({ text: 'Creating a title.svg file...' });
    await fsp.writeFile(path.join(assetsDir, 'title.svg'), newTitlemd, {
      encoding: 'utf-8',
    });

    spinner.update({ text: `Creating a ${kebabCase(config.title.trim())}.md file...` });
    await fsp.writeFile(path.join(newListDir, `${kebabCase(config.title.trim())}.md`), newListmd, {
      encoding: 'utf-8',
    });

    spinner.success({ text: 'Done!' });
    const continueCreating = await confirm({
      message: 'Would you like to create another list?',
      default: false,
    });
    if (continueCreating) {
      await createNewList();
    }
  } catch (err) {
    spinner.error({ text: 'Oops! Something went wrong...' });
  }
}
