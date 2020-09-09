import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Alarm } from '../data';

@Injectable({ providedIn: 'root' })
export class AlarmService {
    constructor(private http: HttpClient) {}

    getAll(limit: number = 10000) {
        let params = new HttpParams();
        params = params.append('limit', limit+'');
        return this.http.get<Alarm[]>(`/api/alarms/all/`, { params: params });
    }

    getSummary(limit: number = 10000) {
        let params = new HttpParams();
        params = params.append('limit', limit+'');
        return this.http.get<Alarm[]>(`/api/alarms/summary/`, { params: params });
    }

    getRecentActive(limit: number = 10) {
        let params = new HttpParams();
        params = params.append('limit', limit+'');
        return this.http.get<Alarm[]>(`/api/alarms/recent/active/`, { params: params });
    }

    getRecentInctive(limit: number = 10) {
        let params = new HttpParams();
        params = params.append('limit', limit+'');
        return this.http.get<Alarm[]>(`/api/alarms/recent/inactive/`, { params: params });
    }

    delete(id: string) {
        return this.http.delete(`/api/alarms/${id}`);
    }

    getById(id: string) {
        return this.http.get<Alarm>(`/api/alarms/${id}`);
    }

    getByTopic(topic: string, limit: number = 10000) {
        return this.http.post<Alarm[]>(`/api/alarms/topic/`, { "topic": topic, "limit": limit });
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
