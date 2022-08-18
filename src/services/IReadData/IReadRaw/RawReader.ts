import { IReadRaw } from './'
import { injectable } from 'inversify'
import * as fs from 'fs'

@injectable()
export class RawReaderSync implements IReadRaw {
    read(fileName: string, conf?: { [key: string]: any }) {
        if(!conf?.READ.encoding) return fs.readFileSync(fileName, {encoding: 'utf8'}).trim()
        else return String(fs.readFileSync(fileName, {encoding: conf.READ.encoding})).trim()
    }
}
