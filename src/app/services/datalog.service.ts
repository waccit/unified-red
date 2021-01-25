import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DataLog, DataLogQuery } from '../data';

@Injectable({
    providedIn: 'root',
})
export class DataLogService {
    constructor(private http: HttpClient) {}

    query(queryParams: DataLogQuery) {
        return this.http.put<DataLog[]>(`/api/datalog/`, queryParams);
    }

    listTopics() {
        return this.http.get<string[]>('/api/loggers/');
    }
}
