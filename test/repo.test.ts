// import { stat } from 'fs-extra'
// import * as mockFs from 'mock-fs'
// import * as git from 'simple-git/promise'

// import { clone, Repository } from "../src/repo";
// import { join } from 'path';

// const gitRepo = git(join(process.cwd(), 'baseDir'))

// describe('Repository test', () => {
//     let repo: Repository

//     it('class is instantiable', async () => {
//         mockFs({
//             baseDir: {}
//         })
//         const log = await gitRepo.status()
//         expect(log).toEqual('')
//         // repo = await clone('https://github.com/github/gitignore.git', join(process.cwd(), 'baseDir'), gitRepo)
//         // expect(repo).toBeInstanceOf(Repository)
//         // const log = await stat('baseDir')
//         // expect(log).toEqual('')
//         // const file = await readFile('baseDir/.travis.yml')
//         // expect(file.toString()).toEqual('')
//         // expect(repo.update).toBe(Function)
//     })
// })
