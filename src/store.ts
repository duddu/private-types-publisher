import { copyFile, mkdir, readFile, writeFile } from 'fs'
import { basename, extname, join } from 'path'
import { promisify } from 'util'

interface IStoreItems extends Map<string, Set<string>> {}

class Barrel {
  imports: Set<string> = new Set()
  exports: Set<string> = new Set()

  // constructor (content: Buffer) {
  constructor(lines: string[] = []) {
    // const lines = content.toString().split("\n");
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
  // _store: Map<string, Barrel> = new Map();
  private barrels: IStoreItems = new Map()
  private models: IStoreItems = new Map()

  // get (path: string): Barrel {
  //     if (this._store.has(path)) return this._store.get(path);
  //     try {
  //         const content = readFileSync(path).toString().split("\n");
  //         return this._store.set(path, {

  //         }).get(path);
  //     } catch (e) {
  //         return new Barrel();
  //     }
  // }

  addBarrel(path: string, lines: string[]): void {
    if (this.barrels.has(path)) {
      // return this.barrels.set(path, lines.concat(this.barrels.get(path)));
      return lines.forEach(line => this.barrels.get(path)!.add(line))
    }
    this.barrels.set(path, new Set(lines))
  }

  addModel(path: string, file: string): void {
    if (this.models.has(path)) {
      // return this.barrels.set(path, lines.concat(this.barrels.get(path)));
      this.models.get(path)!.add(file)
      return
    }
    this.models.set(path, new Set([file]))
  }

  async write(): Promise<void> {
    // console.log("models", this.models.size);
    for (const [dir, files] of this.models.entries()) {
      // console.log({dir, files});
      await promisify(mkdir)(dir, {
        recursive: true
      })
      console.log('made dir', dir)
      for (const file of files) {
        // console.log({file});
        const filePath = extname(file) ? file : `${file}.d.ts`
        await promisify(copyFile)(join(__dirname, filePath), join(dir, basename(filePath)))
        console.log('copied file', filePath)
      }
    }
    // console.log("barrels", this.barrels.size);
    for (const [dir, lines] of this.barrels.entries()) {
      const barrelPath = join(dir, 'index.d.ts')
      let content = [...lines]
      try {
        const read = await promisify(readFile)(barrelPath)
        content = content.concat(read.toString().split('\n'))
      } catch (e) {
        // No original file present
      }
      // console.log(new Barrel(content));
      await new Barrel(content).write(barrelPath)
    }
  }
}
