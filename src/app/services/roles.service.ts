import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RoleName } from '../data/roleName.model';

@Injectable({
    providedIn: 'root',
})
export class RoleService {
    constructor(private http: HttpClient) {}

    getAll() {
        return this.http.get<[RoleName]>(`/api/roles`);
    }

    update(level: string, role: any) {
        return this.http.put<RoleName>(`/api/roles/${level}`, role);
    }
}
