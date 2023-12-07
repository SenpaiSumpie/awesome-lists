// @ts-check
import { capitalCase } from 'case-anything';
import chalk from 'chalk';
import fse from 'fs-extra';
import fsp from 'fs/promises';
import Handlebars from 'handlebars';
import { createSpinner } from 'nanospinner';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
/* -------------------------------------------------------------------------- */
await updateMain();
/* -------------------------------------------------------------------------- */
async function updateMain() {
  const spinner = createSpinner('Updating Main README.md...').start();

  // get the name of each folder in the lists directory
  spinner.update({ text: 'Retrieving all lists...' });

  try {
    let allLists = await fsp.readdir(path.join(__dirname, '..', 'lists')).then((lists) => {
      return lists.map((list) => {
        return {
          githubUrl: `https://github.com/parkercode98/test-awesome-list/blob/main/lists/${list}/${list}.md`,
          title: capitalCase(list, { keepSpecialCharacters: false }),
        };
      });
    });

    if (!allLists || !allLists.length) {
      console.log(chalk.yellow('No lists found!'));
      process.exit(0);
    }

    // console.log(allLists);

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
