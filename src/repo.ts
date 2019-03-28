import { mkdirp, remove } from 'fs-extra'
import { dirname } from 'path'
import * as git from 'simple-git/promise'
import { DefaultLogFields, ListLogSummary } from 'simple-git/typings/response'

import { INamespaces } from './config'

interface IRepositoryUpdateOptions {
    dryRun?: boolean
}

export const getCommitMessage = (packageName: string): string =>
    `Update shared models for ${packageName}`

export class Repository {
    private repo: git.SimpleGit

    constructor(repo: git.SimpleGit) {
        this.repo = repo
    }

    async update(
        packageName: string,
        namespaces: INamespaces,
        options: IRepositoryUpdateOptions = {}
    ): Promise<ListLogSummary<DefaultLogFields>> {
        const { not_added } = await this.repo.status()
        await this.repo.add(not_added)
        await this.repo.commit(
            [getCommitMessage(packageName), JSON.stringify(namespaces, null, 4)]
            // undefined,
            // { '--amend': null }
        )
        await this.repo.push(undefined, undefined, {
            ...(options.dryRun ? { '--dry-run': null } : {})
            // '-f': null
        })
        return this.repo.log()
    }
}

export const clone = async (url: string, targetDir: string): Promise<Repository> => {
    await remove(targetDir)
    await mkdirp(targetDir)
    if (!url) throw new Error('No repository url provided')
    const repo = git(dirname(targetDir))
    await repo.clone(url, targetDir)
    await repo.cwd(targetDir)
    return new Repository(repo)
}
