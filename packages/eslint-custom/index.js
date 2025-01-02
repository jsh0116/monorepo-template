module.exports = {
  extends: ['next', 'turbo', 'prettier'],
  plugins: ['simple-import-sort'],
  rules: {
    '@next/next/no-html-link-for-pages': 'off',
    'simple-import-sort/imports': 'warn',
    'simple-import-sort/exports': 'error',
    'no-console': ['warn', { allow: ['info', 'warn', 'error'] }],
  },
  parserOptions: {
    babelOptions: {
      presets: [require.resolve('next/babel')],
    },
  },
};
