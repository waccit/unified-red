import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RoleName } from '../data/roleName.model';
import { first } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class RoleService {
    roles: [RoleName] = null;

    constructor(private http: HttpClient) {
        this.getAll().pipe(first()).subscribe(roles => this.roles = roles);
    }

    getAll() {
        return this.http.get<[RoleName]>(`/api/roles`);
    }

    update(level: string, role: any) {
        return this.http.put<RoleName>(`/api/roles/${level}`, role);
    }
}
