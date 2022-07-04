import logger from '@common/lbz'

console.log(1)

function func() {
    console.info(2)

    function abc() {
        console.log('abcd')
    }
}

export default class Clazz {
    say() {
        console.debug(3)
    }

    render() {
        return <div>{console.error(4)}</div>
    }
}

export class Nic {
    say() {
        console.debug(3)
    }

    static za() {
        console.debug('zab')
    }

    render() {
        return <Bze>{console.error(4)}</Bze>
    }
}
