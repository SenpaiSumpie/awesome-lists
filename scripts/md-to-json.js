// -------------------------------------------------------------------------- //
//-                             MARKDOWN TO JSON                             -//
// -------------------------------------------------------------------------- //
// @ts-check
/* -------------------------------------------------------------------------- */
import { select } from '@inquirer/prompts';
import c from 'chalk';
import { Command } from 'commander';
import fse from 'fs-extra';
import { glob } from 'glob';
import { marked } from 'marked';
import { createSpinner } from 'nanospinner';
import path from 'path';
import sanitizeHtml from 'sanitize-html';
import xml2js from 'xml2js';
import { _dirname, correctPath, log } from './utils.js';
/* -------------------------------------------------------------------------- */
const __dirname = _dirname();
const program = new Command();
/* -------------------------------------------------------------------------- */

program
  .name('md-to-json')
  .version('1.0.0')
  .description('Convert markdown to JSON')
  .argument('[path]', 'Path to the markdown file', (val, pre) => path.resolve(process.cwd(), val))
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
  spinner.update({ text: 'Reading MD Data...' });

  const markdownFilePath = await (async () => {
    return (
      programArguments?.[0] ||
      (await select({
        message: 'Select a markdown file',
        choices: await glob('**/*.md', {
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
    if (markdownFilePath) {
      return path.join(path.dirname(markdownFilePath), `${path.basename(markdownFilePath).split('.')[0]}.hbs.json`);
    }
    return process.cwd();
  })();

  /* -------------------------------------------------------------------------- */

  const markdownFileContents = await fse.readFile(markdownFilePath, 'utf-8');

  const html = await getHTML(markdownFileContents);

  if (programOptions?.log && programOptions?.html) console.log(`${c.magenta('HTML')}:\n%s`, html);

  const json = await xml2js.parseStringPromise(html, {
    trim: true,
    normalizeTags: true,
    normalize: true,
    includeWhiteChars: true,
    chunkSize: 50000,
    explicitRoot: false,
    explicitCharkey: true,
  });

  if (programOptions?.log && programOptions?.json) log(json, 'JSON');

  /* -------------------------------------------------------------------------- */

  const parseKeys = {
    TEXT: '_',
    ATTRIBUTES: '$',
  };

  const parseTools = {
    getText(obj) {
      if (Array.isArray(obj)) {
        return obj.flatMap((item) => this.getText(item));
      }
      if (typeof obj === 'object') {
        return Object.entries(obj)
          .flatMap(([key, value]) => {
            if (key === parseKeys.TEXT) {
              return value;
            }
            if (typeof value === 'object') {
              return this.getText(value);
            }
            return null;
          })
          .filter(Boolean);
      }
      return obj;
    },
  };

  const result = await (async () => {
    const title = json?.header?.[0]?.['$']?.['data-title'] ?? '';
    const description = parseTools.getText(json?.header?.[0]?.p)?.[0] ?? '';

    const categories = (json?.h2 ?? []).reduce((acc, curr, idx, arr) => {
      if (!curr) return acc;
      const name = curr?.[parseKeys.TEXT] ?? '';
      if (!name) return acc;
      /* ----------------- */
      const table = json?.table?.[idx];
      if (!table) return [...acc, { name, items: [] }];
      /* ----------------- */

      const items = (table?.tbody?.[0]?.tr ?? []).map((row) => {
        const anchor = row?.td?.[0]?.a?.[0];
        return {
          name: anchor?.[parseKeys.TEXT] ?? '',
          link: anchor?.[parseKeys.ATTRIBUTES]?.href ?? '',
          description: row?.td?.[1]?.[parseKeys.TEXT] ?? '',
        };
      });

      return [...acc, { name, items }];
    }, []);
    /* ---------------------------------------------------------------------- */
    const previousData = await fse.readJson(outputPath, { encoding: 'utf-8' }).catch(() => {});

    return {
      $schema:
        previousData?.$schema ??
        correctPath(path.relative(path.dirname(outputPath), path.resolve(__dirname, './data/schema/list-schema.json'))),
      title,
      fileName: path.basename(outputPath).split('.')[0],
      description,
      date: new Date().toISOString(),
      categories,
    };
  })();

  if (programOptions?.log) log(result, 'Result');

  spinner.update({ text: 'Writing JSON Data...' });

  if (!programOptions?.log) {
    await fse.writeJson(outputPath, result, {
      spaces: 2,
      encoding: 'utf-8',
    });
  }

  spinner.success({ text: 'Done!' });
} catch (error) {
  spinner.error({ text: 'Oops! Something went wrong...' });
  console.error(error);
}

/* -------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------- */
/**
 * @param {string} markdown
 * @returns {Promise<string>}
 */
async function getHTML(markdown) {
  let html = await marked(markdown);

  html = sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
    allowedAttributes: false,
  });

  html = `<div>\n${html}\n</div>`.replace(/^\s*[\r\n]/gm, '');

  const emptyTable = () => {
    return `
    <table>
    <thead>
    <tr>
    <th>Name</th>
    <th>Description</th>
    </tr>
    </thead>
    <tbody></tbody>
    </table>`
      .trim()
      .replace(/^\s*/gm, '');
  };

  html = html.replace(/(<h2.*?h2>(?!\n{1,}<table))/g, (match) => {
    return `${match}\n${emptyTable()}`;
  });

  return html;
}
