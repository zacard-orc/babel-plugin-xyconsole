const { declare } = require('@babel/helper-plugin-utils')
const path = require('path')
const { setFG, setBG, setClear } = require('./color')

const targetCalleeName = ['log', 'info', 'error', 'debug', 'trace', 'warn'].map((item) => `console.${item}`)

const xyconsolePlugin = declare((api, options, dirname) => {
    const fileset = new Set()
    const method = new Map()

    const { types, template } = api
    const { ide } = options

    function getFilename() {
        const af = Array.from(fileset)
        if (af.length === 0) {
            return 'unknown'
        }
        const [full] = af
        return path.basename(full)
    }

    function getClassName(zpath) {
        if (zpath
            && zpath.parentPath
            && zpath.parentPath.parentPath
            && zpath.parentPath.parentPath.parentPath
            && zpath.parentPath.parentPath.parentPath.parentPath
        ) {
            const { parent } = zpath.parentPath.parentPath.parentPath.parentPath
            if (parent.type === 'ClassDeclaration') {
                return parent.id.name
            }
        }
        return null
    }

    function fmtString(ele, opt) {
        const {
            x, y, file, func,
        } = ele

        const dftLineFmt = `[${file}:${x}][${func}]`

        const {
            lineFmt,
        } = opt
        /*
         <= [%file:%x,%y] %func
         => [${file}:${x}][${func}]
         */
        let cvlineFmt = ''
        if (lineFmt && lineFmt.length > 0) {
            const arg = [...lineFmt.matchAll(/%[a-z]+/g)]
            let cursor = 0

            arg.forEach((el) => {
                const idf = el[0].slice(1)
                // get pretext
                const pre = lineFmt.substring(cursor, el.index)

                cvlineFmt += pre
                // eslint-disable-next-line no-eval
                cvlineFmt += `${eval(idf)}`
                cursor = el.index + idf.length + 1
            })
        }

        return cvlineFmt.length > 0
            ? cvlineFmt
            : dftLineFmt
    }

    function getParent(zpath) {
        const ret = {}

        const { container } = zpath.parentPath.parentPath

        const { type: parentType } = container
        ret.type = parentType
        ret.name = ''

        switch (parentType) {
        case 'File': {
            break
        }
        case 'FunctionDeclaration': {
            ret.name = container.id.name
            break
        }
        case 'ClassMethod': {
            if (container.key && container.key.type === 'Identifier') {
                ret.name = container.key.name

                const className = getClassName(zpath)
                if (className) {
                    ret.name = `${className}:${container.key.name}`
                }
            }
            break
        }
        case 'ReturnStatement': {
            if (container.argument.type === 'JSXElement') {
                const { openingElement } = container.argument
                if (openingElement.name.type === 'JSXIdentifier') {
                    ret.name = openingElement.name.name
                }
            }
            break
        }
        default: {
            ret.type = null
        }
        }

        return ret
    }

    function getTs(opt) {
        const { tsFmt } = opt
        if (tsFmt.includes('V2')) {
            const pureFmt = tsFmt.replace('V2', '')
            return `(new Date()).to${pureFmt}().replace(/[TZ]/g,' ').slice(0,-1)`
        }

        return `(new Date()).to${tsFmt}()`
    }

    function getLevel(raw) {
        switch (raw) {
        case 'log': {
            return `[${setFG('DeepSkyBlue')}${raw}${setClear()}]`
        }
        case 'info': {
            return `[${setFG('LimeGreen')}${raw}${setClear()}]`
        }
        case 'debug': {
            return `[${setFG('DarkCyan')}${raw}${setClear()}]`
        }
        case 'warn': {
            return `[${setFG('DarkOrange')}${raw}${setClear()}]`
        }
        case 'trace': {
            return `[${setFG('Fuchsia')}${raw}${setClear()}]`
        }
        case 'error': {
            return `[${setFG('Crimson')}${raw}${setClear()}]`
        }
        default:
            return `[${setFG('DeepSkyBlue')}${raw}${setClear()}]`
        }
    }

    return {
        pre(state) {
        },
        visitor: {
            Identifier(bbpath, state) {
                fileset.add(state.file.opts.filename)
            },
            ClassMethod(bbpath, state) {
                // todo
            },
            ClassDeclaration(bbpath) {
                // todo
            },
            CallExpression(bbpath, PluginPass) {
                const calleeName = bbpath.get('callee').toString()
                const ce = bbpath.get('callee')

                if (!targetCalleeName.includes(calleeName)) {
                    return
                }

                const parent = getParent(bbpath)

                const { line: x, column: y } = bbpath.node.loc.start
                const file = getFilename()

                const dft = fmtString({
                    x,
                    y,
                    file,
                    func: parent.name,
                }, PluginPass.opts)
                bbpath.node.arguments.unshift(types.stringLiteral(dft))

                const level = getLevel(ce.node.property.name)
                bbpath.node.arguments.unshift(types.stringLiteral(level))

                // https://www.jb51.net/article/122984.htm
                const ts = getTs(PluginPass.opts)
                const newNode = template.expression(ts)()

                // eslint-disable-next-line no-unused-expressions
                ide === 'browser'
                    ? bbpath.node.arguments.splice(1, 0, newNode)
                    : bbpath.node.arguments.unshift(newNode)
            },
        },
        post(state) {
        },
    }
})
module.exports = xyconsolePlugin
