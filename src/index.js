const { declare } = require('@babel/helper-plugin-utils')
const path = require('path')

const targetCalleeName = ['log', 'info', 'error', 'debug', 'trace'].map((item) => `console.${item}`)

const xyconsolePlugin = declare((api, options, dirname) => {
    const fileset = new Set()
    const method = new Map()

    const { types, template } = api

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

        return `[${file}:${x}][${func}]`
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

    return {
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
                const { tsFmt } = PluginPass.opts

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

                const ts = `(new Date()).to${tsFmt}()`
                const newNode = template.expression(ts)()
                bbpath.node.arguments.unshift(newNode)
            },
        },
    }
})
module.exports = xyconsolePlugin
