import { IPreProcessor } from './IPreProcessor'
import { IAnalyser } from './IAnalyser'
import { TFeature } from '../../types'

export abstract class ITransformer {
    abstract proc(
        data: Array<number>,
        conf: { [key: string]: any }
    ): [Array<number>, Array<TFeature>]; // [preProcData, analysedData];
    abstract preProcessor: IPreProcessor;
    abstract analyser: IAnalyser
}
