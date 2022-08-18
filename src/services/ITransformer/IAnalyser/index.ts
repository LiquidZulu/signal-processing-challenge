import { TFeature } from '../../../types'
import { ISpikeDetector } from './ISpikeDetector'
import { ISpikeStatistic } from './ISpikeStatistic'

export abstract class IAnalyser {
    abstract proc(preProcData: Array<number>): Array<TFeature>;
    abstract spikeDetector: ISpikeDetector;
    abstract statGrabbers: Array<ISpikeStatistic>;
}
