import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuditEntry } from '../data/audit-entry.model';

@Injectable({ providedIn: 'root' })
export default class AuditService {
    private readonly baseURL = '/api/audit';
    constructor(private http: HttpClient) {}

    getLog(name) {
        return this.http.get<AuditEntry[]>(this.baseURL + '/log/' + name);
    }

    getLogsList() {
        return this.http.get<String[]>(this.baseURL + '/logs');
    }
}
