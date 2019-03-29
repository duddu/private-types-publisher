import { readFile } from 'fs-extra'
import * as mockFS from 'mock-fs'

import { Store } from '../src/store'
import { getMockFSWithModules } from './utils/helpers'

describe('Store test', () => {
    let store: Store

    it('class is instantiable', () => {
        expect(new Store()).toBeInstanceOf(Store)
    })

    describe('addModel()', () => {
        let baseMockFS: {}

        beforeAll(async () => {
            baseMockFS = await getMockFSWithModules()
        })

        beforeEach(() => {
            store = new Store()
            mockFS({
                ...baseMockFS,
                path: {
                    to: {
                        'model1.d.ts': 'model1ContentMock',
                        'model2.d.ts': 'model2ContentMock'
                    }
                }
            })
        })

        it('should add a model to the store', async () => {
            store.addModel('targetDir', 'path/to/model1.d.ts')
            await store.write()
            const file = await readFile('targetDir/model1.d.ts')
            expect(file.toString()).toEqual('model1ContentMock')
        })

        it('should add a model with implicit extension to the store', async () => {
            store.addModel('targetDir', 'path/to/model1')
            await store.write()
            const file = await readFile('targetDir/model1.d.ts')
            expect(file.toString()).toEqual('model1ContentMock')
        })

        it('should add a model in nested path to the store', async () => {
            store.addModel('targetDir/nested/path', 'path/to/model1')
            await store.write()
            const file = await readFile('targetDir/nested/path/model1.d.ts')
            expect(file.toString()).toEqual('model1ContentMock')
        })

        it('should add multiple models to the same path of the store', async () => {
            store.addModel('targetDir', 'path/to/model1')
            store.addModel('targetDir', 'path/to/model2')
            await store.write()
            const file1 = await readFile('targetDir/model1.d.ts')
            const file2 = await readFile('targetDir/model2.d.ts')
            expect(file1.toString()).toEqual('model1ContentMock')
            expect(file2.toString()).toEqual('model2ContentMock')
        })
    })

    describe('addBarrel()', () => {
        beforeEach(() => {
            store = new Store()
            mockFS({
                targetDir: {
                    nestedDir: {
                        'index.d.ts': 'import 1\n\nexport 1'
                    }
                }
            })
        })

        it('should add an empty barrel to the store', async () => {
            store.addBarrel('targetDir', [])
            await store.write()
            const file = await readFile('targetDir/index.d.ts')
            expect(file.toString()).toEqual('')
        })

        it('should add a barrel with exports to the store', async () => {
            store.addBarrel('targetDir', ['export 1'])
            await store.write()
            const file = await readFile('targetDir/index.d.ts')
            expect(file.toString()).toEqual('export 1')
        })

        it('should add a barrel with imports and exports to the store', async () => {
            store.addBarrel('targetDir', ['import 1', 'export 1'])
            await store.write()
            const file = await readFile('targetDir/index.d.ts')
            expect(file.toString()).toEqual('import 1\n\nexport 1')
        })

        it('should add multiple lines to the same barrel in the store', async () => {
            store.addBarrel('targetDir', ['export 1'])
            store.addBarrel('targetDir', ['export 2'])
            await store.write()
            const file = await readFile('targetDir/index.d.ts')
            expect(file.toString()).toEqual('export 1\nexport 2')
        })

        it('should add a barrel with existing imports and exports to the store', async () => {
            store.addBarrel('targetDir/nestedDir', ['import 2', 'export 2'])
            await store.write()
            const file = await readFile('targetDir/nestedDir/index.d.ts')
            expect(file.toString()).toEqual('import 1\nimport 2\n\nexport 1\nexport 2')
        })
    })

    afterEach(mockFS.restore)
})
