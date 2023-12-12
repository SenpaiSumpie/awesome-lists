// -------------------------------------------------------------------------- //
//-                                   UTILS                                  -//
// -------------------------------------------------------------------------- //
// @ts-check
import c from 'chalk';
import { $ } from 'execa';
import eyes from 'eyes';
import os from 'os';
import path from 'path';
import { simpleGit as git } from 'simple-git';
import { fileURLToPath } from 'url';
/* -------------------------------------------------------------------------- */

// ---------------------------------- File ---------------------------------- //
export function _dirname() {
  return path.dirname(fileURLToPath(import.meta.url));
}

export function correctPath(inputPath) {
  // Detect the operating system
  const platform = os.platform();

  // Check for Git Bash or similar Unix-like shell on Windows
  if (platform === 'win32' && process.env.SHELL && process.env.SHELL.includes('bash')) {
    return path.posix.normalize(inputPath.replace(/\\/g, '/'));
  } else if (platform === 'win32') {
    return path.win32.normalize(inputPath);
  } else {
    return path.posix.normalize(inputPath);
  }
}

// ---------------------------------- Exec ---------------------------------- //
export const $$ = $({ stdio: 'inherit' });

export const sleep = (ms = 2000) => new Promise((resolve) => setTimeout(resolve, ms));

// ----------------------------------- Git ---------------------------------- //
export const getCurrentBranch = async () => {
  return await git()
    .raw(['rev-parse', '--abbrev-ref', 'HEAD'])
    .then((res) => res.trim().replace('\n', ''));
};

// ---------------------------------- Misc ---------------------------------- //
/**
 * @typedef {[thing: any, label?: string]} LogParams
 * @param {LogParams} params
 */
export const log = (...params) => {
  const [thing, label] = params;
  const inspect = eyes.inspector({
    hideFunctions: false,
    maxLength: 100000,
    pretty: true,
    stream: process.stdout,
  });
  if (!!label) {
    inspect(thing, c.magentaBright(label));
  } else {
    inspect(thing);
  }
};
