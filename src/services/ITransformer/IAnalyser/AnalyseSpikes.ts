import { IAnalyser } from './'
import { ISpikeDetector } from './ISpikeDetector'
import { ISpikeStatistic } from './ISpikeStatistic'
import { TFeature } from '../../../types'
import { inject, multiInject, injectable } from 'inversify'

@injectable()
export class AnalyseSpikes implements IAnalyser {
    constructor(
        @inject(ISpikeDetector) SpikeDetector: ISpikeDetector,
        @multiInject(ISpikeStatistic) StatGrabbers: Array<ISpikeStatistic>
    ) {
        this.spikeDetector = SpikeDetector;
        this.statGrabbers = StatGrabbers;
    }

    public proc(preProcData: Array<number>, conf?: { [key: string]: any }): Array<TFeature> {
        const spikes = this.spikeDetector.proc(preProcData, conf)
        let statArrs: number[][][] = [];

        for( let grabber of this.statGrabbers ){
            statArrs.push(grabber.proc(preProcData, spikes))
        }

        let infoArr = []

        for( let i=0; i<spikes.length; i++ ){
            let info: { [key: string]: number } = { start: spikes[i][0], end: spikes[i][1] }

            for( let j=0; j<statArrs.length; j++ ){
                for( let k=0; k<statArrs[j][i].length; k++ ){ // enumerating through the group of stats being tracked
                    info[this.statGrabbers[j].statNames[k]] = statArrs[j][i][k]
                }
            }
            infoArr.push(info)
        }

        return [
            {
                name: 'spikes',
                data: infoArr
            } // here we only have one feature we are analysing, namely spikes
        ];
    }

    public spikeDetector: ISpikeDetector;
    public statGrabbers: Array<ISpikeStatistic>;
}
