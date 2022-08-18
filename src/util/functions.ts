// from https://stackoverflow.com/questions/57001515/sliding-window-over-array-in-javascript
export const toWindows = (arr: Array<number>, size: number): Array<number[]> => {
    return Array.from(
        {length: arr.length - (size - 1)},
        (_, i) => arr.slice(i, i+size)
    )
}

export const weightedAverage = (arr: Array<number>, weights?: Array<number>): number => {
    if(!weights) weights = Array.from(arr, () => 1)
    let sum = 0

    for(let i=0; i<arr.length; i++) {
        sum += weights[i] * arr[i]
    }

    return sum / (()=>{let s=0;for(let x of weights){s+=x};return s})()
}

export const sumArr = (arr: Array<number>): number => {
    let sum = 0
    for(let i of arr){
        sum += i
    }
    return sum
}
