import { IOutput } from './'
import { TFeature } from '../../types'
import { injectable } from 'inversify'
import * as fs from 'fs'

@injectable()
export class MakeJSON implements IOutput {
    public output(
        rawData: Array<number>,
        preProcData: Array<number>,
        analysedData: Array<TFeature>,
        conf: { [key: string]: any }
    ): string {

        const dataToWrite = JSON.stringify({
            source: conf.READ.fileName,
            graph: conf.OUTPUT.outGraph,
            features: analysedData
        }, null, 4)

        fs.mkdir(require('path').dirname(conf.OUTPUT.outJSON), { recursive: true }, e => { if(!!e) throw e })
        fs.writeFileSync(conf.OUTPUT.outJSON, dataToWrite)

        return "JSON"
    }
}
