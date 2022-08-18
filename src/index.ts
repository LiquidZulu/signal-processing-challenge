import 'reflect-metadata'
import { Container, inject, multiInject, injectable } from 'inversify'
import {
    // read
    IReadData,
    DataReaderLD,
    IReadRaw,
    RawReaderSync,

    // transform
    ITransformer,
    VoltageSpikes,
    IPreProcessor,
    SlidingWindowWA,
    IAnalyser,
    AnalyseSpikes,
    ISpikeStatistic,
    SpikeArea,
    SpikeAvg,
    SpikeMinMax,
    ISpikeDetector,
    DetectSpikes,

    // output
    IOutput,
    GraphData,
    MakeJSON
} from './services'
import { TFeature } from './types'

const C = new Container()

@injectable()
class Application {
    /*
     * When making use of multiple transformers, one must specify
     * the correct outputter for each, for example if I want to
     * use t_1, t_2, and t_3, I would also need to bind o_1, o_2,
     * and o_3. Note that this has not been tested as the
     * specification only required a single transformation, but
     * thats the idea anyway.
     */
    constructor(
        @inject(IReadData) DataReader: IReadData,
        @multiInject(ITransformer) Transformers: Array<ITransformer>,
        @multiInject(IOutput) Outputters: Array<IOutput>
    ) {
        // read
        //  - from data/*.dat files

        this.dataReader = DataReader


        // transform
        //  - pre-processing
        //  - analysis
        //    - getting a list of stats for desired features (here the only feature we care about is voltage spikes)

        this.transformers = Transformers // transformers[i].analyser will provide the information on what features it covers


        // output
        //  - graph the data
        //  - write a JSON of our statistics

        this.outputters = Outputters
    }

    public run(conf?: { [key: string]: any }, _cb?: (result: any)=>void) {

        // read
        //  - from data/*.dat files

        if(!conf?.READ.fileName) throw new Error('Application->run() requires conf.READ.fileName')

        const data = this.dataReader.read(conf.READ.fileName)


        // transform
        //  - pre-processing
        //  - analysis
        //    - getting a list of stats for desired features (here the only feature we care about is voltage spikes)

        let preProcDataArr: Array<number[]> = []
        let analysedDataArr: Array<TFeature[]> = []

        for( let transformer of this.transformers ){
            const [preProcData, analysedData] = transformer.proc(data, conf)
            preProcDataArr.push(preProcData)
            analysedDataArr.push(analysedData)

            for( let outputter of this.outputters ){
                console.log(outputter.output(data, preProcData, analysedData, conf), ' output finished.')
            }
        }


        // do something when complete, if desired
        if(!!_cb) _cb([data, preProcDataArr, analysedDataArr])
        else console.log('Application complete')
    }

    public dataReader: IReadData;
    public transformers: Array<ITransformer>;
    public outputters: Array<IOutput>;
}

// read
C.bind(IReadData).to(DataReaderLD)

C.bind(IReadRaw).to(RawReaderSync)


// transform
C.bind(ITransformer).to(VoltageSpikes)

C.bind(IPreProcessor).to(SlidingWindowWA)

C.bind(IAnalyser).to(AnalyseSpikes)

C.bind(ISpikeStatistic).to(SpikeArea)
C.bind(ISpikeStatistic).to(SpikeAvg)
C.bind(ISpikeStatistic).to(SpikeMinMax)

C.bind(ISpikeDetector).to(DetectSpikes)


// output
C.bind(IOutput).to(GraphData)
C.bind(IOutput).to(MakeJSON)


// application
C.bind(Application).toSelf()

const app = C.get(Application)

try{
    app.run({
        READ: {
            fileName: `${process.cwd()}/data/record-1.dat`
        },
        TRANSFORM: {
            spikes: {
                tolerance: 100
            },
            preProcessing: {
                windowSize: 7,
                weights: [1,2,3,3,3,2,1]
            }
        },
        OUTPUT: {
            outGraph: `${process.cwd()}/output/record-1.png`,
            outJSON: `${process.cwd()}/output/record-1.json`
        }
    })

    app.run({
        READ: {
            fileName: `${process.cwd()}/data/record-2.dat`
        },
        TRANSFORM: {
            spikes: {
                tolerance: 100
            },
            preProcessing: {
                windowSize: 7,
                weights: [1,2,3,3,3,2,1]
            }
        },
        OUTPUT: {
            outGraph: `${process.cwd()}/output/record-2.png`,
            outJSON: `${process.cwd()}/output/record-2.json`
        }
    })

}catch(e){
    console.error(e)
}
