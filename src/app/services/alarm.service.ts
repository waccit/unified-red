import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Alarm } from '../data';

@Injectable({ providedIn: 'root' })
export class AlarmService {
    constructor(private http: HttpClient) {}

    getAll() {
        return this.http.get<Alarm[]>(`/api/alarms`);
    }

    delete(id: string) {
        return this.http.delete(`/api/alarms/${id}`);
    }

    getById(id: string) {
        return this.http.get<Alarm>(`/api/alarms/${id}`);
    }

    update(id: string, alarm: any) {
        return this.http.put<Alarm>(`/api/alarms/${id}`, alarm);
    }

    ackById(id: string) {
        return this.http.get<Alarm[]>(`/api/alarms/ack/${id}`);
    }

    ackByTopic(topic: string) {
        return this.http.post<Alarm[]>(`/api/alarms/ack/`, { "topic": topic });
    }

}
