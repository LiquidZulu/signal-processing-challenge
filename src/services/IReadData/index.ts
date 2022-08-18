import { IReadRaw } from './IReadRaw/index'
export { IReadRaw } from './IReadRaw/index'
export { DataReaderLD } from './DataReaderLD'
export { RawReaderSync } from './IReadRaw/RawReader'

export abstract class IReadData {
    abstract read(fileName: string, conf?: { [key: string]: any }): Array<number>;
    abstract rawReader: IReadRaw;
}
