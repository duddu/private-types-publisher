import { getConfig } from './config'
import { writeNamespaces } from './namespaces'
import { clone } from './repo'

const main = async (): Promise<void> => {
  const { baseDir, namespaces, packageName, repository } = await getConfig()
  const repo = await clone(baseDir, repository.url)
  await writeNamespaces(namespaces, baseDir)
  await repo.update(packageName, namespaces)
}

main().catch(e => console.error('EEEEEEEEEERRRORR----------', e))
