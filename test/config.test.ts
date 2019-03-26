import * as mockFs from 'mock-fs'
import { join } from 'path'

const help = require('./utils/fs-mock-helper')
import { BASE_DIR_PATH, getConfig, IConfig } from '../src/config'

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
        'package.json': JSON.stringify(packageJsonMock),
        '.shared-models.json': JSON.stringify(Object.assign(configMock, overrides)),
        'node_modules/callsites': help.duplicateFSInMemory(
            join(process.cwd(), 'node_modules/callsites')
        )
    })
    // jest.dontMock(join(process.cwd(), '.shared-models.json'))
    // jest.dontMock(require.resolve(join(process.cwd(), '.shared-models.json')))
}

describe('Config test', () => {
    it('getConfig() should return config with defaults', async () => {
        initMockFs()
        expect(await getConfig()).toEqual({
            baseDir: BASE_DIR_PATH,
            packageName: packageJsonMock.name,
            ...configMock
        })
    })

    it('getConfig() should return config with overriden baseDir', async () => {
        initMockFs({
            baseDir: 'overridenBaseDir'
        })
        expect(await getConfig()).toEqual({
            baseDir: 'overridenBaseDir',
            packageName: packageJsonMock.name,
            ...configMock
        })
    })

    it('getConfig() should return config with overriden packageName', async () => {
        initMockFs({
            packageName: 'overridenPackageName'
        })
        expect(await getConfig()).toEqual({
            baseDir: BASE_DIR_PATH,
            packageName: 'overridenPackageName',
            ...configMock
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

    afterEach(async () => {
        // console.log({cache: require.cache})
        // decache(join(process.cwd(), '.shared-models.json'));
        // delete require.cache[join(process.cwd(), '.shared-models.json')]
        // delete require.cache[require.resolve(join(process.cwd(), '.shared-models.json'))]
        // delete require.cache[require.resolve(join(process.cwd(), 'package.json'))]
        // await promisify(unlink)(join(process.cwd(), '.shared-models.json'))
        mockFs.restore()
        jest.resetModules()
        // require.requireMock
    })
})
