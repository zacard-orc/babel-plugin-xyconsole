const { runTest } = require('./index')

describe('babel case', () => {
    it('basic', () => {
        const reg = /\[*:*\]/i
        expect(runTest('basic.js', reg)).toBeGreaterThan(0)
    })

    it('combo', () => {
        const reg = /\[*:*\]/i
        expect(runTest('combo_1.js', reg)).toBeGreaterThan(0)
    })
})
