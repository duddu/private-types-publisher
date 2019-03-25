import { Store } from '../src/store'

/**
 * Dummy test
 */
describe('Store test', () => {
    it('works if true is truthy', () => {
        expect(true).toBeTruthy()
    })

    it('Store is instantiable', () => {
        expect(new Store()).toBeInstanceOf(Store)
    })
})
