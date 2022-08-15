import { IPreProcessor } from './pre-processing'
import { IOutput } from './output'

export interface ISpikeDetector {
    detect(): Array<number[]>;
    preProcessor: IPreProcessor;
}

export interface ISpikeStatistic {
    proc(): Array<number[]>; // [ [spike 0 stat 0, spike 0 stat 1, ...], ... ]
    statNames: Array<string>;
    spikeDetector: ISpikeDetector;
}

export interface ISignalStatistics {
    infoArr: Array<object>;
    statisticType: string;
}

export interface IAnalyserAndOutput {
    Analyser: ISignalStatistics;
    Output: Array<IOutput>;
}
