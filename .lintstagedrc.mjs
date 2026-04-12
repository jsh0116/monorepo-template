import micromatch from 'micromatch';

function buildESLintCommand(filenames) {
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
      buildESLintCommand(webNextFiles),
      buildPrettierCommand(webNextFiles),
      buildESLintCommand(scriptFiles),
      buildPrettierCommand(scriptFiles),
      buildPrettierCommand(etcFiles),
    ];
  },
};

export default linter;
