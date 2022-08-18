import { ISpikeStatistic } from './'
import { injectable } from 'inversify'

@injectable()
export class SpikeMinMax implements ISpikeStatistic {
    constructor () {
        this.statNames = ['min', 'max']
    }

    proc(data: Array<number>, spikes: Array<number[]>): Array<number[]> {
        if(!data[0]) throw new Error('empty data array passed to SpikeMinMax->proc()')

        let minMaxArr: Array<number[]> = [];
        let [min, max]: number[] = [data[0], data[0]];

        for( let spike of spikes ){
            for( let i of data.slice(spike[0], spike[1]) ) {
                if(i!==min && i !== max) i < min ? min = i : max = i
            }
            minMaxArr.push([min, max])
        }

        return minMaxArr
    }

    public statNames: Array<string>
}
