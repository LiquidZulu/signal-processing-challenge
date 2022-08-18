import { IReadData, IReadRaw } from './'
import { inject, injectable } from 'inversify'

@injectable()
export class DataReaderLD implements IReadData {
    constructor(
        @inject(IReadRaw) rawReader: IReadRaw
    ) {
        this.rawReader = rawReader;
    }

    read(fileName: string, conf?: { [key: string]: any }) {
        const rawData = this.rawReader.read(fileName, conf);
        let numData = []

        for( let i of rawData.split('\n') ){
            numData.push(Number(i.trim()))
        }

        return numData
    }

    public rawReader: IReadRaw;
}
