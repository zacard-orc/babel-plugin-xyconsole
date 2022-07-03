const { declare } = require('@babel/helper-plugin-utils')
const types = require('@babel/types')

const targetCalleeName = ['log', 'info', 'error', 'debug', 'trace'].map((item) => `console.${item}`)

const xyconsolePlugin = declare((api, options, dirname) => {
    // console.log('a', api)
    // console.log('b', options)
    // console.log('c', dirname)
    const fileset = new Set()
    return {
        visitor: {
            Identifier(path, state) {
                fileset.add(state.file.opts.filename)
            },
            CallExpression(path, PluginPass) {
                // console.log(PluginPass.opts)
                const calleeName = path.get('callee').toString()

                if (targetCalleeName.includes(calleeName)) {
                    const { line, column } = path.node.loc.start
                    path.node.arguments.unshift(types.stringLiteral(`filename: (${line}, ${column})`))
                }

                // console.log(calleeName)
            },
        },
    }
})
module.exports = xyconsolePlugin
