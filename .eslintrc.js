module.exports = {
    extends: ['@remix-run/eslint-config', '@remix-run/eslint-config/node'],
    rules: {
        quotes: ['error', 'single'],
        semi: ['error', 'never'],
        'no-tabs': ['error', { allowIndentationTabs: false }],
    },
}
