export interface Alarm {
    id: string;
    severity: string;
    name: string;
    topic: string;
    value: string;
    state: string;
    acktime?: Date;
    ackreq?: boolean;
    timestamp?: Date;
}
