import { join } from 'path'

export interface INamespaces {
    [k: string]: INamespaces | string[]
}

export interface IConfig {
    targetDir: string
    namespaces: INamespaces
    packageName: string
    repository: {
        url: string
    }
}

export const BASE_DIR = process.cwd()
export const TARGET_DIR = 'shared-models'
export const CONFIG_FILE = '.shared-models.json'
export const PACKAGE_JSON = 'package.json'

const getPackageName = async (): Promise<string> => {
    return require(join(BASE_DIR, PACKAGE_JSON)).name
}

const getConfigDefaults = async (): Promise<IConfig> => ({
    targetDir: join(BASE_DIR, TARGET_DIR),
    namespaces: {},
    packageName: await getPackageName(),
    repository: {
        url: ''
    }
})

export const getConfig = async (): Promise<IConfig> => {
    const defaults = await getConfigDefaults()
    const config: IConfig = require(join(BASE_DIR, CONFIG_FILE))
    if (!config.namespaces || Object.keys(config.namespaces).length === 0) {
        throw new Error('No namespaces provided in configuration object.')
    }
    return Object.assign(defaults, config)
}
