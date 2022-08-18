export abstract class IReadRaw {
    abstract read(fileName: string, conf?: { [key: string]: any }): string;
}
