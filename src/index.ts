import { getConfig } from './config'
import { writeNamespaces } from './namespaces'
import { clone } from './repo'

const main = async (): Promise<void> => {
    const { targetDir, namespaces, packageName, repository } = await getConfig()
    const repo = await clone(repository.url, targetDir)
    await writeNamespaces(namespaces, targetDir)
    await repo.update(packageName, namespaces)
}

main().catch(e => {
    console.error('Unhandled exception')
    throw e
})
