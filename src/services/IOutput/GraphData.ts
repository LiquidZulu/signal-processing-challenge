import { IOutput } from './'
import { TFeature } from '../../types'
import { injectable } from 'inversify'
const plt = {
    subplot: (...a: any[])=>{},
    title: (...a: any[])=>{},
    plot: (...a: any[])=>{},
    legend: (...a: any[])=>{},
    save: (...a: any[])=>{console.log('this is when the graph would get saved')},
}//require('matplotnode')

@injectable()
export class GraphData implements IOutput {
    public output(
        rawData: Array<number>,
        preProcData: Array<number>,
        analysedData: Array<TFeature>,
        conf: { [key: string]: any }
    ): string {

        plt.subplot('211')
        plt.title('Raw Data')
        plt.plot(
            rawData.map((_, i)=>i),
            rawData
        )
        plt.legend()

        plt.subplot('212')
        plt.title('Smoothed Data')
        plt.plot(
            preProcData.map((_, i)=>i),
            preProcData
        )
        plt.legend()

        plt.save(conf.OUTPUT.outGraph)

        return "Graph"
    }
}
