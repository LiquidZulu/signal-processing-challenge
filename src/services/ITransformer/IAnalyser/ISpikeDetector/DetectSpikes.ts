import { ISpikeDetector } from './'
import { injectable } from 'inversify'

@injectable()
export class DetectSpikes implements ISpikeDetector {
    proc(data: Array<number>, conf?: { [key: string]: any }): Array<number[]> {
        let spikes: Array<number[]> = []
        let tolerance = 100

        if(!!conf?.TRANSFORM.spikes.tolerance) tolerance = conf.TRANSFORM.spikes.tolerance

        for( let i=0; i<data.length - 2; i++ ){
            if(data[i+2] - data[i] > tolerance){
                // i is start frame
                let endFrame = 50;
                for( let x=1; x<=50; x++ ){
                    if( data[i+x] > data[i+x+1] ){
                        endFrame = x;
                        x = 51;
                    }
                }
                spikes.push([i,i+endFrame])
                i+=endFrame // make sure the spikes dont overlap
            }
        }

        return spikes;
    }
}
