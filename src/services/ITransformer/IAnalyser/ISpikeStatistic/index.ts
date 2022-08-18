export abstract class ISpikeStatistic {
    abstract proc(
        data: Array<number>,
        spikes: Array<number[]>
    ): Array<number[]>;  // [ [spike 0 stat 0, spike 0 stat 1, ...], ... ]
    abstract statNames: Array<string>;
}
