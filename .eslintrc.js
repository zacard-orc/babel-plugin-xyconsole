module.exports = {
    env: {
        browser: true,
        commonjs: true,
        es2021: true,
        node: true,
        'jest/globals': true,
    },
    extends: [
        'plugin:react/recommended',
        'airbnb',
    ],
    parserOptions: {
        ecmaFeatures: {
            jsx: true,
        },
        ecmaVersion: 12,
    },
    plugins: [
        'react',
        'jest',
    ],
    rules: {
        semi: ['error', 'never'],
        indent: ['error', 4],
        'no-param-reassign': 0,
        'no-console': 0,
    },
}
