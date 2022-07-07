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
    // return "33[38;2;"+gColor[incolor] ? gColor[incolor] : DFT_BLACK+"m"
    // eslint-disable-next-line prefer-template,quotes
    return "\x1b[38;2;" + gColor[incolor] + "m"
}

const setClear = () => '\x1b[0m'

const setBG = (incolor) => {
    incolor = incolor.toLowerCase()
    // eslint-disable-next-line prefer-template,quotes
    return "\x1b[48;2;" + gColor[incolor] + "m"
}

module.exports = {
    setFG,
    setBG,
    setClear,
}
