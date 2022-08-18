import { ISpikeStatistic } from './'
import { sumArr } from '../../../../util/functions'
import { injectable } from 'inversify'

@injectable()
export class SpikeArea implements ISpikeStatistic {
    constructor () {
        this.statNames = ['area']
    }

    proc(data: Array<number>, spikes: Array<number[]>): Array<number[]> {
        if(!data[0]) throw new Error('empty data array passed to SpikeArea->proc()')

        let areaArr: Array<number[]> = [];

        for( let spike of spikes ){
            const thisSpike = data.slice(spike[0], spike[1])
            areaArr.push([sumArr(thisSpike)])
        }

        return areaArr
    }

    public statNames: Array<string>
}
