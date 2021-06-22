import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuditEntry } from '../data/audit-entry.model';

@Injectable({ providedIn: 'root' })
export default class AuditService {
    constructor(private http: HttpClient) {}

    getAll() {
        return this.http.get<AuditEntry[]>('/api/audit');
    }
}
