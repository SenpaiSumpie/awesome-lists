// @ts-check
import { confirm, input } from '@inquirer/prompts';
import { capitalCase, kebabCase } from 'case-anything';
import fse from 'fs-extra';
import fsp from 'fs/promises';
import Handlebars from 'handlebars';
import { createSpinner } from 'nanospinner';
import path from 'path';
import { _dirname, correctPath } from './utils.js';
import { $ } from 'execa';
/* -------------------------------------------------------------------------- */
const __dirname = _dirname();
/* -------------------------------------------------------------------------- */
await createNewList();
/* -------------------------------------------------------------------------- */
async function createNewList() {
  // - Create the config
  const title = await input({
    message: 'Enter a name for your new list:',
    validate: (input) => !!input.trim() || 'Please enter a name',
  }).then((input) => input.trim());

  const description = await input({
    message: 'Enter a description for your new list:',
    validate: (input) => !!input.trim() || 'Please enter a description',
  }).then((input) => input.trim());

  const config = {
    $schema: correctPath(
      path.relative(
        path.resolve(__dirname, '..', 'lists', kebabCase('cool list')),
        path.resolve(__dirname, './data/schema/list-schema.json')
      )
    ),
    title: capitalCase(title, { keepSpecialCharacters: false }),
    fileName: kebabCase(title),
    description,
    date: new Date().toISOString(),
    categories: [],
  };

  const spinner = createSpinner('Creating new list...').start();

  try {
    // - Compile Handlebar templates
    spinner.update({ text: 'Compiling templates...' });
    const listTemplate = Handlebars.compile(await fsp.readFile(path.join(__dirname, 'templates/list.hbs'), 'utf-8'));
    const titleTemplate = Handlebars.compile(await fsp.readFile(path.join(__dirname, 'templates/title.hbs'), 'utf-8'));

    const listMarkdown = listTemplate({
      title: config.title,
      description: config.description,
      date: new Date(config.date).toLocaleString(),
    });
    const titleMarkdown = titleTemplate({ title: config.title });
    /* ---------------------------------- */

    // - Create new list directory
    spinner.update({ text: 'Creating new list directory...' });
    const listDirectory = path.join(__dirname, '..', 'lists', config.fileName);
    await fsp.mkdir(listDirectory);

    // - Create new assets directory
    const assetsDir = path.join(listDirectory, 'assets');
    await fsp.mkdir(assetsDir);

    // - Create new .gitkeep file
    spinner.update({ text: 'Creating a .gitkeep file...' });
    await fse.createFile(path.join(assetsDir, '.gitkeep'));

    // - Write titleMarkdown to assets/title.svg
    spinner.update({ text: 'Creating a title.svg file...' });
    await fsp.writeFile(path.join(assetsDir, 'title.svg'), titleMarkdown, {
      encoding: 'utf-8',
    });

    // - Write listMarkdown to <ListDirectory>/<ListName>.md
    spinner.update({ text: `Creating a ${config.fileName}.md file...` });
    await fsp.writeFile(path.join(listDirectory, `${config.fileName}.md`), listMarkdown, {
      encoding: 'utf-8',
    });

    // - Write config to <ListDirectory>/<ListName>.hbs.json
    spinner.update({ text: `Creating a ${config.fileName}.hbs.json file...` });
    await fse.writeJson(path.join(listDirectory, `${config.fileName}.hbs.json`), config, {
      spaces: 2,
      encoding: 'utf-8',
    });

    // - Update Main List
    const { all: output } = await $`node ${path.join(__dirname, 'update-main.js')}`;

    spinner.success({ text: 'Done!' });
    const continueCreating = await confirm({
      message: 'Would you like to create another list?',
      default: false,
    });

    // - Recursively call createNewList() if user wants to create another list
    if (continueCreating) await createNewList();
  } catch (err) {
    spinner.error({ text: 'Oops! Something went wrong...' });
  }
}
