const { declare } = require('@babel/helper-plugin-utils')
const path = require('path')

const targetCalleeName = ['log', 'info', 'error', 'debug', 'trace'].map((item) => `console.${item}`)

const xyconsolePlugin = declare((api, options, dirname) => {
    const fileset = new Set()
    const { types, template } = api
    const { tsfmt } = options

    function getFilename() {
        const af = Array.from(fileset)
        if (af.length === 0) {
            return 'unknown'
        }
        const [full] = af
        return path.basename(full)
    }

    function getParent(zpath) {
        const ret = {}

        const { container } = zpath.parentPath.parentPath

        const { type: parentType } = container
        ret.type = parentType
        ret.name = 'n/a'

        switch (parentType) {
        case 'File': {
            console.log('File')
            break
        }
        case 'FunctionDeclaration': {
            console.log('FunctionDeclaration')
            ret.name = container.id.name
            break
        }
        case 'ClassMethod': {
            console.log('ClassMethod')
            if (container.key && container.key.type === 'Identifier') {
                ret.name = container.key.name
            }
            break
        }
        case 'ReturnStatement': {
            console.log('ReturnStatement')
            if (container.argument.type === 'JSXElement') {
                const { openingElement } = container.argument
                if (openingElement.name.type === 'JSXIdentifier') {
                    ret.name = openingElement.name.name
                }
            }
            break
        }
        default: {
            console.log('N/A', parentType)
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
            CallExpression(bbpath, PluginPass) {
                // console.log(PluginPass.opts)
                const calleeName = bbpath.get('callee').toString()

                if (!targetCalleeName.includes(calleeName)) {
                    return
                }

                const parent = getParent(bbpath)
                console.log(parent)

                const { line: x, column: y } = bbpath.node.loc.start
                const fn = getFilename()
                const ts = `(new Date()).to${tsfmt}()`
                bbpath.node.arguments.unshift(types.stringLiteral(`[${fn}:${x}]`))

                const newNode = template.expression(ts)()
                bbpath.node.arguments.unshift(newNode)
                // console.log(calleeName)
            },
            ClassDeclaration(bbpath) {

            },
        },
    }
})
module.exports = xyconsolePlugin
