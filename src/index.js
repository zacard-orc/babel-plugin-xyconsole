const { declare } = require('@babel/helper-plugin-utils')

const xyconsolePlugin = declare((api, options, dirname) => {
    // console.log('a', api)
    console.log('b', options)
    return {
        visitor: {
            Identifier(path, state) {
                console.log(state.file.opts.filename)
            },
            ImportDeclaration(path, PluginPass) {
                // if (path.node.source.value.includes(`@/${PluginPass.opts.hitDir[0]}`)) {
                if (path.node.source.value.includes('@')) {
                    path.node.source.value = path.node.source.value.replace('@', '..')
                }
            },
            CallExpression(path, PluginPass) {
                // console.log(PluginPass.opts)
            },
        },
    }
})
module.exports = xyconsolePlugin
