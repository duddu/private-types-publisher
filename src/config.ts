import { readFile } from 'fs'
import { join } from 'path'
import { promisify } from 'util'

export interface INamespaces {
    [k: string]: INamespaces | string[]
}

export interface IConfig {
    baseDir: string
    namespaces: INamespaces
    packageName: string
    repository: {
        url: string
    }
}

const CONFIG_JSON_PATH = join(process.cwd(), '.shared-models.json')
const BASE_DIR_PATH = join(process.cwd(), 'shared-models')

const getPackageName = async (): Promise<string> => {
    const config = await promisify(readFile)(join(process.cwd(), 'package.json'))
    return JSON.parse(config.toString()).name
}

const getConfigDefaults = async (): Promise<IConfig> => ({
    baseDir: BASE_DIR_PATH,
    namespaces: {},
    packageName: await getPackageName(),
    repository: {
        url: 'null'
    }
})

export const getConfig = async (): Promise<IConfig> => {
    let defaults = await getConfigDefaults()
    try {
        const read = await promisify(readFile)(CONFIG_JSON_PATH)
        const config: IConfig = JSON.parse(read.toString())
        if (!config.namespaces || Object.keys(config.namespaces).length === 0) {
            throw new Error('No namespaces provided in configuration object.')
        }
        return Object.assign(defaults, config)
    } catch (e) {
        throw e
    }
}
