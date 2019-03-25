import { basename, join } from 'path'

import { INamespaces } from './config'
import { Store } from './store'

const parseNamespaces = (store: Store, namespaces: INamespaces, parentDir: string): Store => {
    for (const namespace of Object.keys(namespaces)) {
        const nestedDir = join(parentDir, namespace.toLowerCase())
        const nestedConfig = namespaces[namespace]
        store.addBarrel(parentDir, [
            `import * as ${namespace} from "./${namespace.toLowerCase()}";`,
            `export { ${namespace} };`
        ])
        if (!Array.isArray(nestedConfig)) {
            return parseNamespaces(store, nestedConfig, nestedDir)
        }
        store.addBarrel(
            nestedDir,
            nestedConfig.map(model => {
                store.addModel(nestedDir, model)
                return `export * from "./${basename(model)}";`
            })
        )
    }
    return store
}

export const writeNamespaces = async (namespaces: INamespaces, baseDir: string): Promise<void> => {
    const store = new Store()
    const parsed = parseNamespaces(store, namespaces, baseDir)
    return parsed.write()
}
