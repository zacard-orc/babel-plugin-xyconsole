const fs = require('fs')
const path = require('path')

const parser = require('@babel/parser')
const {
    transformFromAstSync,
} = require('@babel/core')
const chalk = require('chalk')
const diff = require('diff')

const devPlugin = require('../src')

function runTest(sourcefile, matchRule) {
    const dir = path.resolve(__dirname, '../', 'sample/code')
    const full = `${dir}/${sourcefile}`
    const sourceCode = fs.readFileSync(full, {
        encoding: 'utf-8',
    })

    const ast = parser.parse(sourceCode, {
        sourceType: 'unambiguous',
        plugins: ['typescript', 'jsx'],
    })

    // interface TransformOptions
    const { code: outputCode } = transformFromAstSync(ast, sourceCode, {
        highlightCode: true,
        filename: sourcefile,
        minified: true,
        compact: true,
        retainLines: true,
        generatorOpts: {
            jsescOption: {
                minimal: false,
                compact: true,
            },
        },
        plugins: [
            [
                devPlugin,
                {
                    tsFmt: 'ISOStringV2',
                    lineFmt: '[%file:%x] %func',
                    colorSchema: '',
                },
            ],
        ],
    })

    function normalizeLines(str) {
        return str
            .trimRight()
            .replace(/\r\n/g, '')
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

    process.stdout.write('\n')
    process.stdout.write(chalk.bgCyan(`[Diff Total]:${rt.length}`))

    return rt.length
}

const reg = /\[*:*\]/i
// runTest('basic.js', reg)
// runTest('combo_1.js', reg)
runTest('iife.js', reg)

module.exports = {
    runTest,
}
