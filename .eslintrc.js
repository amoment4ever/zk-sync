module.exports = {
  env: {
    es2021: true,
    node: true,
  },
  extends: 'airbnb-base',
  overrides: [
    {
      env: {
        node: true,
      },
      files: [
        '.eslintrc.{js,cjs}',
      ],
      parserOptions: {
        sourceType: 'script',
      },
    },
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'no-return-await': 0,
    'consistent-return': 0,
    'no-restricted-syntax': 0,
    'no-await-in-loop': 0,
    'max-len': 0,
    'no-loop-func': 0,
    'no-continue': 0,
    'default-case': 0,
    'import/no-extraneous-dependencies': 0,
    'no-plusplus': 0,
  },
};
