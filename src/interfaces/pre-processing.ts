export interface IPreProcessor {
    numData: Array<number>;
    proc(size: number, weights: Array<number>): Array<number>;
}
