import { mkdir } from 'fs'
import { dirname } from 'path'
import * as rimraf from 'rimraf'
import * as git from 'simple-git/promise'
import { promisify } from 'util'

import { INamespaces } from './config'

export class Repository {
  private repo: git.SimpleGit
  constructor(repoInit: git.SimpleGit) {
    this.repo = repoInit
  }
  async update(packageName: string, namespaces: INamespaces): Promise<void> {
    const { not_added } = await this.repo.status()
    await this.repo.add(not_added)
    await this.repo.commit(
      [`Update shared models for ${packageName}`, JSON.stringify(namespaces, null, 4)],
      undefined,
      { '--amend': null }
    )
    return this.repo.push(undefined, undefined, { '-f': null })
  }
}

export const clone = async (baseDir: string, url: string): Promise<Repository> => {
  await promisify(rimraf)(baseDir)
  await promisify(mkdir)(baseDir, {
    recursive: true
  })
  if (!url) throw new Error('No repository url provided')
  await git(dirname(baseDir)).clone(url, baseDir)
  return new Repository(git(baseDir))
}
