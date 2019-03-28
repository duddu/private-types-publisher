import * as mockFs from 'mock-fs'
import { join } from 'path'

const help = require('./utils/helpers')
import { BASE_DIR, CONFIG_FILE, getConfig, IConfig, PACKAGE_JSON, TARGET_DIR } from '../src/config'

const packageJsonMock = {
    name: 'test-package-name'
}

const configMock: Partial<IConfig> = {
    namespaces: {
        SampleNamespace: {
            NestedSampleNamespace: ['/path/to/model']
        }
    },
    repository: {
        url: 'https://example.com/test.git'
    }
}

const initMockFs = (overrides: Partial<IConfig> = {}) => {
    mockFs({
        [PACKAGE_JSON]: JSON.stringify(packageJsonMock),
        [CONFIG_FILE]: JSON.stringify(Object.assign({}, configMock, overrides)),
        'node_modules/callsites': help.duplicateFSInMemory(join(BASE_DIR, 'node_modules/callsites'))
    })
}

describe('Config test', () => {
    it('getConfig() should return config with defaults', async () => {
        initMockFs()
        await expect(getConfig()).resolves.toEqual({
            ...configMock,
            packageName: packageJsonMock.name,
            targetDir: join(BASE_DIR, TARGET_DIR)
        })
    })

    it('getConfig() should return config with overriden baseDir', async () => {
        initMockFs({
            targetDir: 'overridenBaseDir'
        })
        await expect(getConfig()).resolves.toEqual({
            ...configMock,
            packageName: packageJsonMock.name,
            targetDir: 'overridenBaseDir'
        })
    })

    it('getConfig() should return config with overriden packageName', async () => {
        initMockFs({
            packageName: 'overridenPackageName'
        })
        await expect(getConfig()).resolves.toEqual({
            ...configMock,
            packageName: 'overridenPackageName',
            targetDir: join(BASE_DIR, TARGET_DIR)
        })
    })

    it('getConfig() should throw if no namespaces are provided', async () => {
        initMockFs({
            namespaces: undefined
        })
        await expect(getConfig()).rejects.toThrow()
    })

    it('getConfig() should throw if empty namespaces are provided', async () => {
        initMockFs({
            namespaces: {}
        })
        await expect(getConfig()).rejects.toThrow()
    })

    afterEach(() => {
        mockFs.restore()
        jest.resetModules()
    })
})
