import { Writable } from 'stream'
import { Logger, transports } from 'winston'

import { getLogger } from '../src/logger'

describe('Logger test', () => {
    let logger: Logger
    let writable: Writable
    let lastLog: string | null

    beforeEach(() => {
        writable = new Writable({
            write: (chunk: Buffer, _encoding, cb) => {
                lastLog = chunk.toString()
                cb()
            },
            destroy: () => (lastLog = null)
        })
        logger = getLogger('test/logger').add(
            new transports.Stream({
                stream: writable,
                eol: '#'
            })
        )
    })

    it('should write logs with scope', () => {
        logger.silly('test_scope')
        expect(lastLog).toStrictEqual('[shared-types-publisher] [@test/logger] [35msilly[39m: test_scope#')
    })

    it('should write logs with serialized metadata', () => {
        logger.silly('test_metadata', { data: ['a', 'b'] })
        expect(lastLog).toStrictEqual(
            '[shared-types-publisher] [@test/logger] [35msilly[39m: test_metadata data=["a","b"]#'
        )
    })

    afterEach(() => writable.destroy())
})
