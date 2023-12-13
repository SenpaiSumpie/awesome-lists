// @ts-check
import { capitalCase } from 'case-anything';
import chalk from 'chalk';
import fse from 'fs-extra';
import fsp from 'fs/promises';
import Handlebars from 'handlebars';
import { createSpinner } from 'nanospinner';
import path from 'path';
import { _dirname, getCurrentBranch } from './utils.js';
import { Command } from 'commander';
/* -------------------------------------------------------------------------- */
const __dirname = _dirname();
/* -------------------------------------------------------------------------- */
const program = new Command();

program
  .name('update-main')
  .description('Update the main README.md file')
  .version('1.0.0')
  .option('-b, --branch [branch]', 'Specify the branch to update README.md on', 'main')
  .parse(process.argv);
//
const programOptions = program.opts();
/* ---------------------------------- */
await updateMain();
/* -------------------------------------------------------------------------- */
async function updateMain() {
  const BRANCH = programOptions.branch;

  if (!BRANCH) {
    console.log(chalk.yellow('System Error: Cannot get current branch name...'));
    process.exit(0);
  }

  const spinner = createSpinner('Updating Main README.md...').start();

  spinner.update({ text: 'Retrieving all lists...' });

  try {
    let allLists = await fsp.readdir(path.join(__dirname, '..', 'lists')).then((lists) => {
      return lists.map((list) => {
        return {
          githubUrl: `https://github.com/SenpaiSumpie/awesome-lists/blob/${BRANCH}/lists/${list}/${list}.md`,
          title: capitalCase(list, { keepSpecialCharacters: false }),
        };
      });
    });

    if (!allLists || !allLists.length) {
      console.log(chalk.yellow('No lists found!'));
      process.exit(0);
    }

    spinner.update({ text: 'Generating contents...' });

    const mainTemplateContents = await fsp.readFile(path.join(__dirname, 'templates/main.hbs'), 'utf-8');

    const mainTemplate = Handlebars.compile(mainTemplateContents);

    const mainMD_Content = mainTemplate({ lists: allLists, date: new Date().toLocaleString() });

    const mainReadMeFilePath = path.join(__dirname, '..', 'README.md');

    const mainExists = await fse.exists(mainReadMeFilePath);

    if (!mainExists) throw new Error('File does not exist');

    spinner.update({ text: 'Writing to README.md...' });

    await fsp.writeFile(mainReadMeFilePath, mainMD_Content, {
      encoding: 'utf-8',
    });

    spinner.success({ text: 'Updated Successfully!' });
  } catch (err) {
    spinner.error({ text: 'Oops! Something went wrong...' });
  }
}
