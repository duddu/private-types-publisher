import { mkdirp, remove, writeFile } from 'fs-extra'
import { tmpdir } from 'os'
import { join } from 'path'
import * as git from 'simple-git/promise'

import { clone, getCommitMessage, Repository } from '../src/repo'
import { getMockPackageName } from './utils/helpers'

const TEST_BASE_PATH = join(tmpdir(), 'shared-types-publisher/repo')
const ORIGIN_PATH = join(TEST_BASE_PATH, 'origin')
const CLONE_PATH = join(TEST_BASE_PATH, 'clone')
const GIT_USER = `Unit Tester ${new Date().valueOf()}`
const PACKAGE_TEST = getMockPackageName()

describe('Repository test', () => {
    let repo: Repository

    beforeAll(async () => {
        await remove(ORIGIN_PATH)
        await mkdirp(ORIGIN_PATH)
        await git(ORIGIN_PATH).init(true)
        repo = await clone(ORIGIN_PATH, CLONE_PATH)
    })

    it('class is instantiable', () => {
        expect(new Repository(git(CLONE_PATH))).toBeInstanceOf(Repository)
    })

    describe('clone()', () => {
        it('should return a new instance of Repository', () => {
            expect(repo).toBeInstanceOf(Repository)
        })

        it('should throw if no url is provided', async () => {
            await expect(clone('', join(CLONE_PATH, 'throw_test'))).rejects.toThrow()
        })
    })

    describe('update()', () => {
        it('should push the updates to the remote origin', async () => {
            await writeFile(join(CLONE_PATH, 'EDIT'), `Edited by ${GIT_USER}`)
            await git(CLONE_PATH).addConfig('user.name', GIT_USER)
            const logs = await repo.update(PACKAGE_TEST, {})
            expect(logs.latest.author_name).toEqual(GIT_USER)
            expect(logs.latest.message).toEqual(getCommitMessage(PACKAGE_TEST))
        })
    })

    afterAll(async () => remove(TEST_BASE_PATH))
})
