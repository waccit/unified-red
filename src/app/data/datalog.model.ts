export interface DataLog {
    timestamp: string,
    topic: string,
    value: any,
    units?: string,
    presetValue?: string,
    tags?: string[],
    status?: string,
    name?: string
}
