export abstract class IPreProcessor {
    abstract proc(data: Array<number>, conf: { [key: string]: any }): Array<number>;
}
