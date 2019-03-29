import { readdir, readFileSync, stat } from 'fs'
import { basename, extname, join } from 'path'
import { promisify } from 'util'

import { BASE_DIR } from '../../src/config'

interface IModule {
    [k: string]: IModule | string
}

const nodeModulesWhitelist = ['callsites']
const extensionsWhitelist = ['.ts', '.js']
const modulesBaseDir = join(BASE_DIR, 'node_modules')

export const getMockPackageName = (): string => `test_package_name_${new Date().valueOf()}`

export const getMockFSWithModules = async (): Promise<{ ['node_modules']: IModule }> => {
    const modules: IModule = {}
    for (const modulePath of nodeModulesWhitelist) {
        modules[modulePath] = await getPathContents(join(modulesBaseDir, modulePath))
    }
    return { node_modules: modules }
}

const getPathContents = async (path: string): Promise<IModule> => {
    const contents: IModule = {}
    const ls = await promisify(readdir)(path)
    for (const item of ls) {
        const itemPath = join(path, item)
        const content = await parseContent(itemPath)
        if (content) contents[item] = content
    }
    return contents
}

const parseContent = async (path: string): Promise<IModule | string | null> => {
    const stats = await promisify(stat)(path)
    if (stats.isDirectory()) {
        return getPathContents(path)
    }
    const ext = extname(basename(path))
    if (extensionsWhitelist.indexOf(ext) !== -1) {
        // This needs to be sync due to issues with mock-fs
        return readFileSync(path, 'utf-8')
    }
    return null
}
