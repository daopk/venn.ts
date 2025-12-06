declare module 'fmin' {
    export function nelderMead(
        fn: (x: number[]) => number,
        x0: number[],
        parameters?: {
            maxIterations?: number
            nonZeroDelta?: number
            zeroDelta?: number
            minErrorDelta?: number
            minTolerance?: number
            rho?: number
            chi?: number
            psi?: number
            sigma?: number
            history?: { x: number[], fx: number }[]
        },
    ): { x: number[], fx: number }

    export function bisect(
        fn: (x: number) => number,
        a: number,
        b: number,
        parameters?: {
            tolerance?: number
            maxIterations?: number
        },
    ): number

    export function conjugateGradient(
        fn: (x: number[], fxprime: number[]) => number,
        x0: number[],
        parameters?: {
            maxIterations?: number
            learnRate?: number
            history?: { x: number[], fx: number }[]
        },
    ): { x: number[], fx: number }

    export function zeros(n: number): number[]

    export function zerosM(rows: number, cols: number): number[][]

    export function norm2(x: number[]): number

    export function scale(x: number[], alpha: number): number[]
}
