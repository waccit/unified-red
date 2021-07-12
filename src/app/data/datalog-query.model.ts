export interface DataLogQuery {
    topic?: string[],
    startTimestamp?: Date,
    endTimestamp?: Date,
    value?: any,
    lowValue?: any,
    highValue?: any,
    status?: string,
    tags?: string[]
    limit?: number
}
