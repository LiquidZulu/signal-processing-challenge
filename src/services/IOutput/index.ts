import { TFeature } from '../../types'

export abstract class IOutput {
    abstract output(
        rawData: Array<number>,
        preProcData: Array<number>,
        analysedData: Array<TFeature>,
        conf: { [key: string]: any }
    ): void;
}
