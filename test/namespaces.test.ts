import { readFileSync } from 'fs'
import * as mockFS from 'mock-fs'
import { join } from 'path'

import { writeNamespaces } from '../src/namespaces'
import {
    getMockFSWithModules,
    mockModelsFS,
    mockNamespaces,
    mockTargetDirName,
    mockTargetDirPath
} from './utils/helpers'

describe('Namespaces test', () => {
    describe('writeNamespaces()', () => {
        let baseMockFS: {}
        let key = Object.keys(mockNamespaces)[0]

        beforeAll(async () => {
            baseMockFS = await getMockFSWithModules()
        })

        beforeEach(async () => {
            mockFS({
                ...baseMockFS,
                ...mockModelsFS
            })
            await writeNamespaces(mockNamespaces, mockTargetDirName)
        })

        it('should write first level namespace', () => {
            const file = readFileSync(join(mockTargetDirPath, 'index.d.ts'))
            expect(file.toString()).toStrictEqual(
                `import * as ${key} from "./${key.toLowerCase()}";\n\nexport { ${key} };`
            )
        })

        it('should write nested level namespace', () => {
            key = Object.keys(mockNamespaces[key])[0]
            const file = readFileSync(
                join(mockTargetDirPath, Object.keys(mockNamespaces)[0].toLowerCase(), 'index.d.ts')
            )
            expect(file.toString()).toStrictEqual(
                `import * as ${key} from "./${key.toLowerCase()}";\n\nexport { ${key} };`
            )
        })

        it('should write barrel with sorted models', () => {
            const file = readFileSync(
                join(
                    mockTargetDirPath,
                    Object.keys(mockNamespaces)[0].toLowerCase(),
                    key.toLowerCase(),
                    'index.d.ts'
                )
            )
            expect(file.toString()).toStrictEqual(
                `export * from "./model1";\nexport * from "./model2";`
            )
        })
    })

    afterEach(mockFS.restore)
})
