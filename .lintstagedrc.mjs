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
  const filtered = filenames.filter((f) => !f.includes('/public/'));

  if (filtered.length === 0) {
    return 'echo "No files to prettier"';
  }

  return `pnpm prettier --write ${filtered.join(' ')}`;
}

const linter = {
  '*': (allFiles) => {
    const scriptFiles = micromatch(allFiles, [
      '**/apps/**/?(.)*.{js,mjs,ts,tsx,jsx}',
      '**/packages/**/?(.)*.{js,mjs,ts,tsx,jsx}',
    ]);
    const etcFiles = micromatch(allFiles, ['**/?(.)*.{html,css,json}']);

    return [
      buildESLintCommand(scriptFiles),
      buildPrettierCommand(scriptFiles),
      buildPrettierCommand(etcFiles),
    ];
  },
};

export default linter;
