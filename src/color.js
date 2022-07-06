// https://htmlcolorcodes.com/color-names/
const colors = require('color-name')

const gColor = Object.entries(colors).reduce((prev, el) => {
    const [c, code] = el
    prev[c.toLowerCase()] = code.join(';')
    return prev
}, {})

const DFT_BLACK = '0;0,0'
const DFT_WHITE = '255;255;255'

const setFG = (incolor) => {
    incolor = incolor.toLowerCase()
    return `\\033[38;2;${gColor[incolor] ? gColor[incolor] : DFT_BLACK}m`
}
const setBG = (incolor) => {
    incolor = incolor.toLowerCase()
    return `\\033[48;2;${gColor[incolor] ? gColor[incolor] : DFT_WHITE}m`
}

module.exports = {
    setFG,
    setBG,
}
