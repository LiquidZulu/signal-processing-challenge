import { ITransformer } from './'
import { IPreProcessor } from './IPreProcessor'
import { IAnalyser } from './IAnalyser'
import { TFeature } from '../../types'
import { inject, injectable } from 'inversify'

@injectable()
export class VoltageSpikes implements ITransformer {

    constructor(
        @inject(IPreProcessor) PreProcessor: IPreProcessor,
        @inject(IAnalyser) Analyser: IAnalyser
    ){
        this.preProcessor = PreProcessor
        this.analyser = Analyser
    }

    public proc(
        data: Array<number>,
        conf: { [key: string]: any }
    ): [Array<number>, Array<TFeature>] {
        const preProcData = this.preProcessor.proc(data, conf);
        const analysedData = this.analyser.proc(preProcData)
        return [preProcData, analysedData]
    }

    public preProcessor: IPreProcessor;
    public analyser: IAnalyser
}
