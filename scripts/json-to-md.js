// -------------------------------------------------------------------------- //
//-                             JSON TO MARKDOWN                             -//
// -------------------------------------------------------------------------- //
// @ts-check
/* -------------------------------------------------------------------------- */
import { select } from '@inquirer/prompts';
import { kebabCase } from 'case-anything';
import { Command } from 'commander';
import fse from 'fs-extra';
import fsp from 'fs/promises';
import { glob } from 'glob';
import Handlebars from 'handlebars';
import { createSpinner } from 'nanospinner';
import path from 'path';
import { format } from 'prettier';
import { _dirname } from './utils.js';
/* -------------------------------------------------------------------------- */
const __dirname = _dirname();
const program = new Command();
/* -------------------------------------------------------------------------- */

program
  .name('json-to-md')
  .version('1.0.0')
  .description('Converts JSON to markdown')
  .argument('[path]', 'Path to the json file', (val, pre) => path.resolve(process.cwd(), val))
  .addOption(program.createOption('--json', 'Output as JSON').default(true).implies({ html: false }))
  .addOption(program.createOption('--html', 'Output as HTML').default(true).implies({ json: false }))
  .option('--log', 'Log the output', false);
//

program.parse();

const programOptions = program.opts();
const programArguments = program.processedArgs;

const spinner = programOptions?.log
  ? {
      update: () => {},
      success: () => {},
      error: () => {},
    }
  : createSpinner('Updating JSON Data...').start();

/* -------------------------------------------------------------------------- */

try {
  const jsonFilePath = await (async () => {
    return (
      programArguments?.[0] ||
      (await select({
        message: 'Select a JSON file',
        choices: await glob('**/*.hbs.json', {
          cwd: path.resolve(__dirname, '../lists'),
          absolute: true,
        }).then((files) =>
          files.map((file) => ({
            name: path.basename(file),
            value: file,
          }))
        ),
      }))
    );
  })();

  const outputPath = (() => {
    if (jsonFilePath) {
      return path.join(path.dirname(jsonFilePath), `${path.basename(jsonFilePath).split('.')[0]}.md`);
    }
    throw new Error('Cannot find output path');
  })();

  /* -------------------------------------------------------------------------- */
  // - Read JSON file
  spinner.update({ text: 'Reading JSON Data...' });

  const jsonFileContents = await fse.readJson(jsonFilePath, { encoding: 'utf-8' });

  if (!jsonFileContents || !jsonFileContents?.['$schema'].includes('list-schema.json')) {
    throw new Error('Invalid JSON File');
  }

  // - Compile Handlebar templates
  spinner.update({ text: 'Compiling templates...' });
  Handlebars.registerHelper('kebab', function (str) {
    return kebabCase(String(str).toLowerCase());
  });
  const listTemplate = Handlebars.compile(await fsp.readFile(path.join(__dirname, 'templates/list.hbs'), 'utf-8'));
  const listMarkdown = listTemplate({
    title: jsonFileContents.title,
    description: jsonFileContents.description,
    date: new Date().toLocaleString(),
    categories: jsonFileContents.categories,
  });

  // - Write the listMarkdown to the output path
  spinner.update({ text: `Writing to ${path.basename(outputPath)}...` });

  if (!programOptions?.log) {
    const formattedMarkdown = await format(listMarkdown, {
      filepath: outputPath,
      arrowParens: 'always',
      bracketSpacing: true,
      endOfLine: 'lf',
      htmlWhitespaceSensitivity: 'css',
      insertPragma: false,
      singleAttributePerLine: false,
      bracketSameLine: false,
      jsxBracketSameLine: false,
      jsxSingleQuote: true,
      printWidth: 120,
      proseWrap: 'preserve',
      quoteProps: 'as-needed',
      requirePragma: false,
      semi: true,
      singleQuote: true,
      tabWidth: 2,
      trailingComma: 'es5',
      useTabs: false,
      embeddedLanguageFormatting: 'auto',
      vueIndentScriptAndStyle: false,
      parser: 'markdown',
    });
    await fsp.writeFile(outputPath, formattedMarkdown, {
      encoding: 'utf-8',
    });
  }

  spinner.success({ text: 'Done!' });
} catch (error) {
  spinner.error({ text: 'Oops! Something went wrong...' });
  console.error(error);
}

/* -------------------------------------------------------------------------- */
