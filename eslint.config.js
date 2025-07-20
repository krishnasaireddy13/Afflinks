export default [
  {
    files: ['**/*.js', '**/*.jsx'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        React: 'writable',
      },
    },
    rules: {
      // Add your rules here
    },
  },
];
