const { declare } = require('@babel/helper-plugin-utils')
const path = require('path')

const targetCalleeName = ['log', 'info', 'error', 'debug', 'trace'].map((item) => `console.${item}`)

const xyconsolePlugin = declare((api, options, dirname) => {
    const fileset = new Set()
    const { types, template } = api

    function getFilename() {
        const af = Array.from(fileset)
        if (af.length === 0) {
            return 'unknown'
        }
        const [full] = af
        return path.basename(full)
    }

    return {
        visitor: {
            Identifier(bbpath, state) {
                fileset.add(state.file.opts.filename)
            },
            CallExpression(bbpath, PluginPass) {
                // console.log(PluginPass.opts)
                const calleeName = bbpath.get('callee').toString()

                if (targetCalleeName.includes(calleeName)) {
                    const { line: x, column: y } = bbpath.node.loc.start
                    const fn = getFilename()
                    const ts = '(new Date()).toISOString()'
                    bbpath.node.arguments.unshift(types.stringLiteral(`[${fn}:${x}]`))

                    const newNode = template.expression(ts)()
                    bbpath.node.arguments.unshift(newNode)
                }

                // console.log(calleeName)
            },
        },
    }
})
module.exports = xyconsolePlugin
