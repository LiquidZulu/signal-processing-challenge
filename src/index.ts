import 'reflect-metadata'
import { Container, inject, injectable } from 'inversify';
import * as plt from 'matplotnode';
import * as fs  from 'fs';
import {
    IDataAccess,
    IDataReader,
    IDirectoryReader,
    IPreProcessor,
    ISpikeDetector,
    ISpikeStatistic,
    ISignalStatistics,
    IAnalyserAndOutput,
    IOutput
} from './interfaces/all'
import { SERVICE_IDENTIFIER } from './constants/identifiers'
import { readDirRecursive, toWindows, weightedAverage, sumArr } from './util/functions'


const C = new Container();

const conf = {
    INPUT: {
        dataDir: '../data' // `${process.cwd()}/data`
    },
    PRE_PROCESSOR: {
        smoothing: {
            windowSize: 7,
            weights: [1,2,3,3,3,2,1],
        }
    },
    PROCESSOR: {
        spikeTolerance: 100
    },
    OUTPUT: {}
}

// read in data from the file

@injectable()
class DirectoryReaderRecursive implements IDirectoryReader {
    read(dir: string) {
        return readDirRecursive(dir)
    }
}

@injectable()
class DataReaderLD implements IDataReader {
    constructor(
        @inject(SERVICE_IDENTIFIER.IDirectoryReader) DirReader: IDirectoryReader
    ){
        this.directoryReader = DirReader
    }

    read(dir:string) {

        const files = this.directoryReader.read(dir);
        let rawData = ''

        for(let file of files){
            rawData = `${rawData}\n${fs.readFileSync(file, {encoding:'utf8'}).trim()}`;
        }

        return rawData;
    }

    directoryReader: IDirectoryReader;
}

@injectable()
class GetData implements IDataAccess {
    constructor(
        @inject(SERVICE_IDENTIFIER.IDataReader) DataReader: IDataReader
    ){
        this.reader = DataReader;
    }

    read(dir:string): Array<number> {

        const rawData = this.reader.read(dir);
        let numData = []

        for(let i of rawData.split('\n')){
            numData.push(Number(i.trim()))
        }

        return numData;
    }

    reader: IDataReader;
}


// pre-processing

@injectable()
class SlidingWindowWA implements IPreProcessor {
    constructor(DataGetter: IDataAccess) {
        this.numData = DataGetter.read(conf.INPUT.dataDir);
    }

    public proc(size: number, weights: Array<number>) {
        const windowArr = toWindows(this.numData, size);
        let procArr = []

        for(let window of windowArr){
            procArr.push(weightedAverage(window, weights))
        }

        return procArr;
    }

    public numData: Array<number>;
}


// analysis

@injectable()
class DetectSpikes implements ISpikeDetector {
    constructor(
        @inject(SERVICE_IDENTIFIER.IPreProcessor) PreProcessor: IPreProcessor
    ){
        this.preProcessor = PreProcessor;
    }

    detect(): Array<number[]> {
        const preProcData = this.preProcessor.proc(conf.PRE_PROCESSOR.smoothing.windowSize, conf.PRE_PROCESSOR.smoothing.weights);
        let procData: Array<number[]> = [] // [[start_frame, end_frame], ...]

        for(let i=0; i<preProcData.length - 2; i++){
            if(preProcData[i+2] - preProcData[i] > conf.PROCESSOR.spikeTolerance) {
                // i is start frame
                let endFrame = 50;
                for(let x=1; x<=50; x++){
                    if (preProcData[i] > preProcData[i+1]) {
                        endFrame = x;
                        x = 51;
                    }
                }
                procData.push([i,i+endFrame])
            }
        }

        return procData
    }

    public preProcessor: IPreProcessor;
}

@injectable()
class SpikeMinMax implements ISpikeStatistic {
    constructor(
        @inject(SERVICE_IDENTIFIER.ISpikeDetector) SpikeDetector: ISpikeDetector
    ) {
        this.spikeDetector = SpikeDetector
        this.statNames = ['min', 'max']
    }

    proc(): Array<number[]> {
        const spikeArr = this.spikeDetector.detect()
        const dataArr = this.spikeDetector.preProcessor.numData
        const minMaxArr: Array<number[]> = [];
        let [min, max]: number[] = [dataArr[0], dataArr[0]];

        for(let spike of spikeArr) {
            for(let i of dataArr.slice(spike[0],spike[1])) {
                if (i !== min && i !== max) i < min ? min = i : max = i;
            }
            minMaxArr.push([min, max])
        }

        return minMaxArr;
    }

    public statNames: Array<string>;
    public spikeDetector: ISpikeDetector;
}

@injectable()
class SpikeAvg implements ISpikeStatistic {
    constructor(
        @inject(SERVICE_IDENTIFIER.ISpikeDetector) SpikeDetector: ISpikeDetector
    ) {
        this.spikeDetector = SpikeDetector
        this.statNames = ['avg']
    }

    proc(): Array<number[]> {
        const spikeArr = this.spikeDetector.detect()
        const dataArr = this.spikeDetector.preProcessor.numData
        const avgArr: Array<number[]> = [];

        for(let spike of spikeArr) {
            const thisSpike = dataArr.slice(spike[0],spike[1]);
            avgArr.push([weightedAverage(thisSpike)])
        }

        return avgArr;
    }

    public statNames: Array<string>;
    public spikeDetector: ISpikeDetector;
}

@injectable()
class SpikeArea implements ISpikeStatistic {
    constructor(
        @inject(SERVICE_IDENTIFIER.ISpikeDetector) SpikeDetector: ISpikeDetector
    ) {
        this.spikeDetector = SpikeDetector
        this.statNames = ['area']
    }

    proc(): Array<number[]> {
        const spikeArr = this.spikeDetector.detect()
        const dataArr = this.spikeDetector.preProcessor.numData
        const areaArr: Array<number[]> = [];

        for(let spike of spikeArr) {
            const thisSpike = dataArr.slice(spike[0],spike[1]);
            areaArr.push([sumArr(thisSpike)])
        }

        return areaArr;
    }

    public statNames: Array<string>;
    public spikeDetector: ISpikeDetector;
}

@injectable()
class SpikeInfo implements ISignalStatistics {
    constructor(
        @inject(SERVICE_IDENTIFIER.ISpikeDetector) SpikeDetector: ISpikeDetector,
        @inject(SERVICE_IDENTIFIER.ISpikeStatistic) StatGrabbers: Array<ISpikeStatistic>
    ) {
        const spikeArr = SpikeDetector.detect()
        const statArrs: number[][][] = []

        for(let grabber of StatGrabbers){
            statArrs.push(grabber.proc())
        }

        this.infoArr = []
        this.statisticType = 'spikes'

        for(let i=0; i < spikeArr.length; i++){
            let info: { [key: string]: number } = {start: spikeArr[i][0], end: spikeArr[i][1]};

            for(let j=0; j < statArrs.length; j++) { // [ [spike 0 stat 0, spike 0 stat 1, ...], ... ]
                for(let k=0; k < statArrs[j][i].length; k++){ // enumerating through the group of stats being tracked
                    info[StatGrabbers[j].statNames[k]] = statArrs[j][i][k]
                }
            }
            this.infoArr.push(info)
        }
    }

    public infoArr: Array<object>;
    public statisticType: string;
}

@injectable()
class AnalyseData {
    constructor(
        @inject(SERVICE_IDENTIFIER.IAnalyserAndOutput) SignalAnalysersWithOutput: Array<IAnalyserAndOutput>,
    ) {
        for( let a of SignalAnalysersWithOutput ) {
            for( let o of a.Output ) {
                let report: { [key: string]: any } = { source: conf.INPUT.dataDir }
                report[a.Analyser.statisticType] = a.Analyser.infoArr;
                o.output(report)
            }
        }
    }
}

@injectable()
class OutputGraphAndJSON implements IOutput {
    constructor(outDir: string, extraData?: {[key: string]: any}) {
        this.outDir = outDir
        !extraData ? this.extraData = {} : this.extraData = extraData
    }

    public output(r: {}) {
        const outJSON = `${this.outDir}/output.json`
        const outGraph = `${this.outDir}/output.png`

        fs.writeFileSync(outJSON, JSON.stringify({...r, graph: outGraph}))
        console.log(`${outJSON} has been written`)

        if(!!this.extraData.dataToGraph){
            plt.xkcd()
            if(!!this.extraData.graphTitle){plt.title(this.extraData.graphTitle)}
            plt.plot(
                this.extraData.dataToGraph.map((_: any, i: number) => i),
                this.extraData.dataToGraph
            )
            plt.legend()
            plt.save(outGraph)
            console.log(`${outGraph} has been written`)
        }
        else{
            console.warn(`No graph data provided, ${outGraph} has not been written`)
        }
    }

    public outDir: string;
    public extraData: {[key: string]: any};
}

C.bind<IDirectoryReader>(SERVICE_IDENTIFIER.IDirectoryReader).to(DirectoryReaderRecursive);
C.bind<IDataReader>(SERVICE_IDENTIFIER.IDataReader).to(DataReaderLD);
C.bind<IDataAccess>(SERVICE_IDENTIFIER.IDataAccess).to(GetData);
C.bind<IPreProcessor>(SERVICE_IDENTIFIER.IPreProcessor).to(SlidingWindowWA);
C.bind<ISpikeDetector>(SERVICE_IDENTIFIER.ISpikeDetector).to(DetectSpikes);
C.bind<ISpikeStatistic>(SERVICE_IDENTIFIER.ISpikeStatistic).to(SpikeMinMax);
C.bind<ISpikeStatistic>(SERVICE_IDENTIFIER.ISpikeStatistic).to(SpikeAvg);
C.bind<ISpikeStatistic>(SERVICE_IDENTIFIER.ISpikeStatistic).to(SpikeArea);
C.bind<ISignalStatistics>(SERVICE_IDENTIFIER.ISignalStatistics).to(SpikeInfo);
C.bind<AnalyseData>(Symbol.for('AnalyseData')).to(AnalyseData);
C.bind<IOutput>(SERVICE_IDENTIFIER.IOutput).to(OutputGraphAndJSON);

const analyse = C.get<AnalyseData>(Symbol.for('AnalyseData'));

analyse()

/*class Conductor {
    constructor(
        Input: IDataAccess,
        PreProcessor: IPreProcessor,
        Processor: IAnalyseData,
        Output: IOutput,
        Config: IConfig
    ) {
        this.rawData = Input.read(Config.INPUT.dataDir);
        this.preProcData = PreProcessor.proc(Config.PRE_PROCESSOR.smoothing.windowSize, Config.PRE_PROCESSOR.smoothing.weights);
        this.procData =
    }

    public data: Array<number>;
}*/
