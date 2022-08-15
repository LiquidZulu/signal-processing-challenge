export interface IDataAccess { // turning the data into an array, delegates reading
    // constructor(DataReader: IDataReader): void;
    reader: IDataReader;
    read(dir: string): Array<number>; // signal processing will always involve an n-tuple of numbers, we will not be expecting like a set of sets or anything
}

export interface IDataReader { // directly reading the data from the file(s)
    read(dir: string): string;
    directoryReader: IDirectoryReader;
}

export interface IDirectoryReader { // getting an array of files in the directory
    read(dir: string): Array<string>;
}
