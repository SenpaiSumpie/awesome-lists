// -------------------------------------------------------------------------- //
//-                           HUSKY PRE COMMIT HOOK                          -//
// -------------------------------------------------------------------------- //
// @ts-check
/* -------------------------------------------------------------------------- */
(async () => {
  const confirm = await import('@inquirer/prompts').then((module) => module.confirm);
  const $ = await import('execa').then((module) => module.$);
  const figures = await import('figures').then((module) => module.default);
  const { createSpinner } = await import('nanospinner');
  /* ------------------------------------------------------------------------ */
  try {
    // const confirmUpdate = await confirm({
    //   message: 'Do you want to update the main README.md before commiting?',
    //   default: true,
    // });

    // if (!confirmUpdate) process.exit(0);

    const spinner = createSpinner('Running pre-commit hook...').start();

    const updater = $`pnpm run awesome --update`;

    updater.stdout.on('data', (data) => spinner.update({ text: String(data) }));

    await new Promise((resolve, reject) => {
      try {
        updater.on('close', (code) => {
          if (code === 0) {
            resolve();
          }
          reject();
        });

        updater.on('error', (err) => {
          reject(err);
        });
      } catch (error) {
        reject(error);
      }
    });

    spinner.update({ text: `${figures.tick} Main ReadMe Updated!` });

    const gitAddAll = $`git add .`;

    gitAddAll.stdout.on('data', (data) => spinner.update({ text: String(data) }));

    await new Promise((resolve, reject) => {
      try {
        gitAddAll.on('close', (code) => {
          if (code === 0) {
            resolve();
          }
          reject();
        });

        gitAddAll.on('error', (err) => {
          reject(err);
        });
      } catch (error) {
        reject(error);
      }
    });

    spinner.success({ text: `Done!` });

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
