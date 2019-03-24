import { copyFile, mkdir, readFile, writeFile } from 'fs'
import { basename, extname, join } from 'path'
import { promisify } from 'util'

interface IStoreItems extends Map<string, Set<string>> {}

class Barrel {
  imports: Set<string> = new Set()
  exports: Set<string> = new Set()

  constructor(lines: string[] = []) {
    if (lines.length > 0) {
      this.imports = new Set(lines.filter(line => line.startsWith('import ')))
      this.exports = new Set(lines.filter(line => line.startsWith('export ')))
    }
  }

  async write(path: string): Promise<void> {
    let lines: string[] = []
    if (this.imports.size > 0) {
      lines = lines.concat([...this.imports].sort(), '')
    }
    lines = lines.concat([...this.exports].sort())
    return promisify(writeFile)(path, lines.join('\n'))
  }
}

export class Store {
  private barrels: IStoreItems = new Map()
  private models: IStoreItems = new Map()

  addBarrel(path: string, lines: string[]): void {
    if (this.barrels.has(path)) {
      return lines.forEach(line => this.barrels.get(path)!.add(line))
    }
    this.barrels.set(path, new Set(lines))
  }

  addModel(path: string, file: string): void {
    if (this.models.has(path)) {
      this.models.get(path)!.add(file)
      return
    }
    this.models.set(path, new Set([file]))
  }

  async write(): Promise<void> {
    for (const [dir, files] of this.models.entries()) {
      await promisify(mkdir)(dir, {
        recursive: true
      })
      for (const file of files) {
        const filePath = extname(file) ? file : `${file}.d.ts`
        await promisify(copyFile)(join(process.cwd(), filePath), join(dir, basename(filePath)))
      }
    }
    for (const [dir, lines] of this.barrels.entries()) {
      const barrelPath = join(dir, 'index.d.ts')
      let content = [...lines]
      try {
        const read = await promisify(readFile)(barrelPath)
        content = content.concat(read.toString().split('\n'))
      } catch (e) {
        // No original file present
      }
      await new Barrel(content).write(barrelPath)
    }
  }
}
