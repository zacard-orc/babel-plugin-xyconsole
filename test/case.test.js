const { runTest } = require('./index')

describe('babel case', () => {
    it('@ to ..', () => {
        const reg = /\[*:*\]/i
        expect(runTest('basic.js', reg)).toBeGreaterThan(0)
    })
})
