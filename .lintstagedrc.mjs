import micromatch from 'micromatch';
import { relative } from 'path';

function buildNextLintCommand(app, filenames) {
  if (filenames.length === 0) {
    return 'echo "No NextJS files to lint"';
  }

  return `pnpm --filter ${app} lint --fix --file ${filenames
    .map((filename) =>
      relative(process.cwd(), filename).replace(`apps/${app}`, '.')
    )
    .join(' --file ')}`;
}

function buildEslintCommand(filenames) {
  if (filenames.length === 0) {
    return 'echo "No files to lint"';
  }

  return `pnpm eslint --fix --no-ignore ${filenames
    .filter((filename) => !filename.includes('/public/'))
    .join(' ')}`;
}

function buildPrettierCommand(filenames) {
  const filtedFilenames = filenames.filter((f) => !f.includes('/public/'));

  if (filtedFilenames.length === 0) {
    return 'echo "No files to prettier"';
  }

  return `pnpm prettier --write ${filtedFilenames.join(' ')}`;
}

function getNextFilesForApp(app, allFiles) {
  return micromatch(allFiles, [`**/apps/${app}/src/**/*.{js,jsx,ts,tsx}`]);
}

const linter = {
  '*': (allFiles) => {
    const webNextFiles = getNextFilesForApp('web', allFiles);
    const scriptFiles = micromatch(allFiles, [
      '**/apps/web/!(src)/**/?(.)*.{js,mjs,ts}',
      '**/packages/**/?(.)*.{js,mjs,ts}',
    ]);
    const etcFiles = micromatch(allFiles, ['**/?(.)*.{html,css,json}']);

    return [
      buildNextLintCommand('web', webNextFiles),
      buildPrettierCommand(webNextFiles),
      buildEslintCommand(scriptFiles),
      buildPrettierCommand(scriptFiles),
      buildPrettierCommand(etcFiles),
    ];
  },
};

export default linter;
