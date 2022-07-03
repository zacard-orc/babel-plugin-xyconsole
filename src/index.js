const { declare } = require('@babel/helper-plugin-utils')

const xyconsolePlugin = declare((api, options, dirname) => {
    // console.log('a', api)
    console.log('b', options)
    console.log('c', dirname)
    const fileset = new Set()
    return {
        visitor: {
            Identifier(path, state) {
                fileset.add(state.file.opts.filename)
            },
            CallExpression(path, PluginPass) {
                // console.log(PluginPass.opts)
                const calleeName = path.get('callee').toString()
                console.log(calleeName)
            },
        },
    }
})
module.exports = xyconsolePlugin
