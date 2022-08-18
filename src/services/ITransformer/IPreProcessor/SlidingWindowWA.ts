import { IPreProcessor } from './'
import { toWindows, weightedAverage } from '../../../util/functions'
import { injectable } from 'inversify'

@injectable()
export class SlidingWindowWA implements IPreProcessor {

    public proc(data: Array<number>, conf: { [key: string]: any }){

        if(!conf.TRANSFORM.preProcessing.windowSize) throw new Error('SlidingWindowWA->proc() requires conf.TRANSFORM.preProcessing.windowSize to be set')
        if(!conf.TRANSFORM.preProcessing.weights) throw new Error('SlidingWindowWA->proc() requires conf.TRANSFORM.preProcessing.weights to be set')

        const windowArr = toWindows(data, conf.TRANSFORM.preProcessing.windowSize)
        let procArr = []

        for( let window of windowArr ){
            procArr.push(weightedAverage(window, conf.TRANSFORM.preProcessing.weights))
        }

        return procArr
    }
}
