export abstract class ISpikeDetector {
    abstract proc(data: Array<number>, conf?: { [key: string]: any }): Array<number[]>; // [ [start, finish], ... ]
}
