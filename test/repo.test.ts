import { remove, writeFile } from 'fs-extra'
import { tmpdir } from 'os'
import { join } from 'path'
import * as git from 'simple-git/promise'

import { clone, getCommitMessage, Repository } from '../src/repo'

const CLONE_PATH = join(tmpdir(), 'shared-types-publisher/clone')
const GIT_USER = `Unit Tester ${Date.now}`

describe.only('Repository test', () => {
    let repo: Repository

    beforeAll(async () => {
        jest.setTimeout(10000)
        repo = await clone('https://github.com/duddu/shared-types-publisher.git', CLONE_PATH)
    })

    it('class is instantiable', () => {
        expect(new Repository(git(CLONE_PATH))).toBeInstanceOf(Repository)
    })

    describe('clone()', () => {
        it('should return a new instance of Repository', () => {
            expect(repo).toBeInstanceOf(Repository)
        })

        it('should throw if no url is provided', async () => {
            await expect(clone('', join(CLONE_PATH, 'throw-test'))).rejects.toThrow()
        })
    })

    describe('update()', () => {
        it('should push the updates to the remote origin', async () => {
            await writeFile(join(CLONE_PATH, 'EDIT'), `Edited by ${GIT_USER}`)
            await git(CLONE_PATH).addConfig('user.name', GIT_USER)
            const logs = await repo.update('package-name-test', {}, { dryRun: true })
            expect(logs.latest.author_name).toEqual(GIT_USER)
            expect(logs.latest.message).toEqual(getCommitMessage('package-name-test'))
        })
    })

    afterAll(async () => {
        await remove(CLONE_PATH)
    })
})
