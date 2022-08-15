import 'reflect-metadata'
import { Container } from 'inversify'
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
} from '../interfaces/all'
import { SERVICE_IDENTIFIER } from '../constants/identifiers'
