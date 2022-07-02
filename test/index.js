const fs = require('fs')
const path = require('path')

const parser = require('@babel/parser')
const { transformFromAstSync } = require('@babel/core')
const chalk = require('chalk')
const diff = require('diff')

require('babel-register')

const devPlugin = require('../src')

function runTest(sourcefile, matchRule) {
    const dir = path.resolve(__dirname, 'code')
    const full = `${dir}/${sourcefile}`
    const sourceCode = fs.readFileSync(full, {
        encoding: 'utf-8',
    })

    const ast = parser.parse(sourceCode, {
        sourceType: 'unambiguous',
        plugins: ['typescript', 'jsx'],
    })

    const { code: outputCode } = transformFromAstSync(ast, sourceCode, {
        plugins: [
            [
                devPlugin,
                {
                    outputDir: path.resolve(__dirname, './docs'),
                    format: 'markdown',
                    linly: 'abc',
                },
            ],
        ],
    })

    function normalizeLines(str) {
        return str
            .trimRight()
            .replace(/\r\n/g, '')
            .replace(/;/g, '')
    }

    process.stdout.write(chalk.bgCyan('[Diff]', full))
    process.stdout.write('\n\n')

    const warning = chalk.hex('#FFA500').bold// Orange color

    // https://en.wikipedia.org/wiki/ANSI_escape_code#8-bit
    // ansi-256

    const raw = diff.diffLines(normalizeLines(sourceCode), normalizeLines(outputCode), {
        newlineIsToken: true,
        ignoreWhitespace: false,
    })
        .reduce((prev, part) => {
            const { value, added } = part
            if (added >= 0) {
                prev.push(value)
                process.stdout.write(`${warning(' =>')} ${chalk.bgAnsi256(215)(value)}`)
            } else {
                process.stdout.write(value)
            }

            return prev
        }, [])

    process.stdout.write('\n\n')
    process.stdout.write(chalk.bgCyan('[Result]'))
    process.stdout.write('\n')
    const rt = raw.filter((el) => {
        const charIdx = el.search(matchRule)
        if (charIdx >= 0) {
            console.log(charIdx, ':', el)
        }
        return charIdx >= 0
    })

    return rt.length
}

// const reg = /\.\./i
// runTest('basic.js', reg)

module.exports = {
    runTest,
}
