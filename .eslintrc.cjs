module.exports = {
  env: {
    browser: true,
    es2023: true,
    node: true
  },
  extends: ['standard'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
    'promise/param-names': 'off'
  }
}