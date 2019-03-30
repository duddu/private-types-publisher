import { readFile } from 'fs-extra'
import * as mockFS from 'mock-fs'
import { join } from 'path'

import { Store } from '../src/store'
import { getMockFSWithModules, mockModelsFS, mockTargetDirName } from './utils/helpers'

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
                ...mockModelsFS
            })
        })

        it('should add a model to the store', async () => {
            store.addModel(mockTargetDirName, 'path/to/model1.d.ts')
            await store.write()
            const file = await readFile(join(mockTargetDirName, 'model1.d.ts'))
            expect(file.toString()).toEqual('model1ContentMock')
        })

        it('should add a model with implicit extension to the store', async () => {
            store.addModel(mockTargetDirName, 'path/to/model1')
            await store.write()
            const file = await readFile(join(mockTargetDirName, 'model1.d.ts'))
            expect(file.toString()).toEqual('model1ContentMock')
        })

        it('should add a model in nested path to the store', async () => {
            store.addModel(join(mockTargetDirName, 'nested/path'), 'path/to/model1')
            await store.write()
            const file = await readFile(join(mockTargetDirName, 'nested/path/model1.d.ts'))
            expect(file.toString()).toEqual('model1ContentMock')
        })

        it('should add multiple models to the same path of the store', async () => {
            store.addModel(mockTargetDirName, 'path/to/model1')
            store.addModel(mockTargetDirName, 'path/to/model2')
            await store.write()
            const file1 = await readFile(join(mockTargetDirName, 'model1.d.ts'))
            const file2 = await readFile(join(mockTargetDirName, 'model2.d.ts'))
            expect(file1.toString()).toEqual('model1ContentMock')
            expect(file2.toString()).toEqual('model2ContentMock')
        })
    })

    describe('addBarrel()', () => {
        beforeEach(() => {
            store = new Store()
            mockFS({
                [mockTargetDirName]: {
                    nestedDir: {
                        'index.d.ts': 'import 1\n\nexport 1'
                    }
                }
            })
        })

        it('should add an empty barrel to the store', async () => {
            store.addBarrel(mockTargetDirName, [])
            await store.write()
            const file = await readFile(join(mockTargetDirName, 'index.d.ts'))
            expect(file.toString()).toEqual('')
        })

        it('should add a barrel with exports to the store', async () => {
            store.addBarrel(mockTargetDirName, ['export 1'])
            await store.write()
            const file = await readFile(join(mockTargetDirName, 'index.d.ts'))
            expect(file.toString()).toEqual('export 1')
        })

        it('should add a barrel with imports and exports to the store', async () => {
            store.addBarrel(mockTargetDirName, ['import 1', 'export 1'])
            await store.write()
            const file = await readFile(join(mockTargetDirName, 'index.d.ts'))
            expect(file.toString()).toEqual('import 1\n\nexport 1')
        })

        it('should add multiple lines to the same barrel in the store', async () => {
            store.addBarrel(mockTargetDirName, ['export 1'])
            store.addBarrel(mockTargetDirName, ['export 2'])
            await store.write()
            const file = await readFile(join(mockTargetDirName, 'index.d.ts'))
            expect(file.toString()).toEqual('export 1\nexport 2')
        })

        it('should add a barrel with existing imports and exports to the store', async () => {
            store.addBarrel(join(mockTargetDirName, 'nestedDir'), ['import 2', 'export 2'])
            await store.write()
            const file = await readFile(join(mockTargetDirName, 'nestedDir/index.d.ts'))
            expect(file.toString()).toEqual('import 1\nimport 2\n\nexport 1\nexport 2')
        })
    })

    afterEach(mockFS.restore)
})
