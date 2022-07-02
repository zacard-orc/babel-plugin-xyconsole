const fs = require('fs')
const path = require('path')

const parser = require('@babel/parser')
const { transformFromAstSync } = require('@babel/core')
const chalk = require('chalk')
const diff = require('diff')

require('babel-register')

const devPlugin = require('../src')

function runTest(dir) {
    const exitCode = 0

    const sourceCode = fs.readFileSync(`${dir}/basic.js`, {
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

    // console.log(outputCode)

    // const expected = fs.readFileSync(`${dir}/expected.js`, 'utf-8')
    //
    function normalizeLines(str) {
        return str
            .trimRight()
            .replace(/\r\n/g, '')
            .replace(/;/g, '')
    }

    process.stdout.write(chalk.bgCyan(dir))
    process.stdout.write('\n\n')

    const warning = chalk.hex('#FFA500').bold// Orange color

    // https://en.wikipedia.org/wiki/ANSI_escape_code#8-bit
    // ansi-256

    const dres = diff.diffLines(normalizeLines(sourceCode), normalizeLines(outputCode), {
        newlineIsToken: true,
        ignoreWhitespace: false,
    })
        .reduce((prev, part) => {
            const { value, added } = part
            if (added && part.value.includes('..') >= 0) {
                prev.push(value)
                process.stdout.write(`${warning(' =>')} ${chalk.bgAnsi256(215)(value)}`)
            } else {
                process.stdout.write(value)
            }

            return prev
        }, [])

    console.log(dres)
    return dres
}

runTest(path.resolve(__dirname, 'code'))
