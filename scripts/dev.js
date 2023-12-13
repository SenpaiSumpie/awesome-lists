// -------------------------------------------------------------------------- //
//-                                DEVELOPMENT                               -//
// -------------------------------------------------------------------------- //

import c from 'chalk';
import chokidar from 'chokidar';
import { $ } from 'execa';
import figures from 'figures';
import fse from 'fs-extra';
import path from 'path';
import { _dirname, log } from './utils.js';
/* -------------------------------------------------------------------------- */
const __dirname = _dirname();
// -------------------------------------------------------------------------- //
watch();
/* -------------------------------------------------------------------------- */

function watch() {
  console.clear();
  console.log(c.cyanBright('Watching for changes...'));
  /* ---------------------------------- */
  const hbsJsonWatcher = chokidar.watch('**/*.hbs.json', {
    cwd: path.resolve(__dirname, '../lists'),
    ignoreInitial: true,
    persistent: true,
  });
  const markdownWatcher = chokidar.watch('**/*.md', {
    cwd: path.resolve(__dirname, '../lists'),
    ignoreInitial: true,
    persistent: true,
  });
  /* ---------------------------------- */
  hbsJsonWatcher.on('change', (cpath, stats) => {
    log({ path: cpath }, 'CHANGE EVENT');
    const fullPath = path.resolve(__dirname, '../lists', cpath);
    const relativeMarkdownFileName = path.basename(cpath, '.hbs.json').concat('.md');
    const relativeMarkdownFilePath = path.join(path.dirname(cpath), relativeMarkdownFileName);
    if (fse.pathExistsSync(fullPath)) {
      (async () => {
        markdownWatcher.unwatch(relativeMarkdownFilePath);
        try {
          const { all: output } = await $`node ${path.join(__dirname, 'json-to-md.js')} ${fullPath}`;
          console.log(
            `${figures.tick} ${c.greenBright('Updated corresponding markdown file: ')}${c.yellowBright(
              relativeMarkdownFileName
            )}`
          );
        } catch (error) {
          console.log(c.red('Could not update corresponding markdown file.'));
        } finally {
          markdownWatcher.add(relativeMarkdownFilePath);
        }
      })();
    }
  });

  markdownWatcher.on('change', (cpath, stats) => {
    log({ path: cpath }, 'CHANGE EVENT');
    const fullPath = path.resolve(__dirname, '../lists', cpath);
    const relativeJsonFileName = path.basename(cpath, '.md').concat('.hbs.json');
    const relativeJsonFilePath = path.join(path.dirname(cpath), relativeJsonFileName);
    if (fse.pathExistsSync(fullPath)) {
      (async () => {
        hbsJsonWatcher.unwatch(relativeJsonFilePath);
        try {
          const { all: output } = await $`node ${path.join(__dirname, 'md-to-json.js')} ${fullPath}`;
          console.log(
            `${figures.tick} ${c.greenBright('Updated corresponding json file: ')}${c.yellowBright(
              relativeJsonFileName
            )}`
          );
        } catch (error) {
          console.log(c.red('Could not update corresponding json file.'));
        } finally {
          hbsJsonWatcher.add(relativeJsonFilePath);
        }
      })();
    }
  });
}
