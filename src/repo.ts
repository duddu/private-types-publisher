import { mkdirp, remove } from 'fs-extra'
import { dirname } from 'path'
import * as git from 'simple-git/promise'

import { INamespaces } from './config'

export class Repository {
    private repo: git.SimpleGit

    constructor(repo: git.SimpleGit) {
        this.repo = repo
    }

    async update(packageName: string, namespaces: INamespaces): Promise<void> {
        const { not_added } = await this.repo.status()
        await this.repo.add(not_added)
        await this.repo.commit(
            [`Update shared models for ${packageName}`, JSON.stringify(namespaces, null, 4)],
            undefined
            // { '--amend': null }
        )
        return this.repo.push()
        // return this.repo.push(undefined, undefined, { '-f': null })
    }
}

export const clone = async (
    url: string,
    baseDir: string,
    repo?: git.SimpleGit
): Promise<Repository> => {
    await remove(baseDir)
    await mkdirp(baseDir)
    if (!url) throw new Error('No repository url provided')
    if (!repo) repo = git(dirname(baseDir))
    await repo.clone(url, baseDir)
    await repo.cwd(baseDir)
    return new Repository(repo)
}
