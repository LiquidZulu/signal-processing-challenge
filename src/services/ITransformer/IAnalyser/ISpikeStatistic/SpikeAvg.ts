import { ISpikeStatistic } from './'
import { weightedAverage } from '../../../../util/functions'
import { injectable } from 'inversify'

@injectable()
export class SpikeAvg implements ISpikeStatistic {
    constructor () {
        this.statNames = ['avg']
    }

    proc(data: Array<number>, spikes: Array<number[]>): Array<number[]> {
        if(!data[0]) throw new Error('empty data array passed to SpikeAvg->proc()')

        let avgArr: Array<number[]> = [];

        for( let spike of spikes ){
            const thisSpike = data.slice(spike[0], spike[1])
            avgArr.push([weightedAverage(thisSpike)])
        }

        return avgArr
    }

    public statNames: Array<string>
}
