import * as mockFS from 'mock-fs'
import { join } from 'path'

import { BASE_DIR, CONFIG_FILE, getConfig, IConfig, PACKAGE_JSON, TARGET_DIR } from '../src/config'
import { getMockPackageName, getMockFSWithModules } from './utils/helpers'

const packageJsonMock = {
    name: getMockPackageName()
}

const configMock: Partial<IConfig> = {
    namespaces: {
        SampleNamespace: {
            NestedSampleNamespace: ['/path/to/model1', '/path/to/model2']
        }
    },
    repository: {
        url: 'repo-url.git'
    }
}

const getBaseMockFS = async (): Promise<{}> => ({
    ...(await getMockFSWithModules()),
    [PACKAGE_JSON]: JSON.stringify(packageJsonMock)
})

describe('Config test', () => {
    let initMockFS: (overrides?: Partial<IConfig>) => void

    beforeAll(async () => {
        const baseMockFS = await getBaseMockFS()
        initMockFS = (overrides = {}) => {
            mockFS({
                ...baseMockFS,
                [CONFIG_FILE]: JSON.stringify({
                    ...configMock,
                    ...overrides
                })
            })
        }
    })

    describe('getConfig()', () => {
        it('should return config with defaults', async () => {
            await initMockFS()
            await expect(getConfig()).resolves.toEqual({
                ...configMock,
                packageName: packageJsonMock.name,
                targetDir: join(BASE_DIR, TARGET_DIR)
            })
        })

        it('should return config with overriden baseDir', async () => {
            await initMockFS({
                targetDir: 'overridenBaseDir'
            })
            await expect(getConfig()).resolves.toEqual({
                ...configMock,
                packageName: packageJsonMock.name,
                targetDir: 'overridenBaseDir'
            })
        })

        it('should return config with overriden packageName', async () => {
            await initMockFS({
                packageName: 'overridenPackageName'
            })
            await expect(getConfig()).resolves.toEqual({
                ...configMock,
                packageName: 'overridenPackageName',
                targetDir: join(BASE_DIR, TARGET_DIR)
            })
        })

        it('should throw if no namespaces are provided', async () => {
            await initMockFS({
                namespaces: undefined
            })
            await expect(getConfig()).rejects.toThrow()
        })

        it('should throw if empty namespaces are provided', async () => {
            await initMockFS({
                namespaces: {}
            })
            await expect(getConfig()).rejects.toThrow()
        })
    })

    afterEach(() => {
        mockFS.restore()
        jest.resetModules()
    })
})
