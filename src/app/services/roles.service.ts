import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RoleName } from '../data/roleName.model';
import { first } from 'rxjs/operators';

export interface AclReadWrite {
    read: boolean;
    write: boolean;
}

export interface AclTrend {
    view: boolean;
    enable: boolean;
    clear: boolean;
    add: boolean;
    edit: boolean;
    delete: boolean;
}

export interface AclAlarm {
    view: boolean;
    enable: boolean;
    ack: boolean;
    add: boolean;
    edit: boolean;
    delete: boolean;
}

export interface AclSchedule {
    view: boolean;
    enable: boolean;
    add: boolean;
    edit: boolean;
    delete: boolean;
}

export interface AclEntry {
    datapoint: AclReadWrite;
    dashboards: AclReadWrite;
    trends: AclTrend;
    alarms: AclAlarm;
    schedules: AclSchedule;
    users: AclReadWrite;
    roles: AclReadWrite;
    audit: AclReadWrite; // future
    smtpSettings: AclReadWrite; // future
    dbSettings: AclReadWrite; // future
    editor: AclReadWrite;
}

class Acl {
    [index: string]: AclEntry;
}

@Injectable({
    providedIn: 'root',
})
export class RoleService {
    roles: [RoleName] = null;
    acl: Acl = {
        '1': { // Viewer (1)
            datapoint: { read: true, write: false },
            dashboards: { read: true, write: false },
            trends: { view: true, enable: false, clear: false, add: false, edit: false, delete: false },
            alarms: { view: true, enable: false, ack: false, add: false, edit: false, delete: false },
            schedules: { view: true, enable: false, add: false, edit: false, delete: false },
            users: { read: false, write: false },
            roles: { read: false, write: false },
            audit: { read: false, write: false }, // future
            smtpSettings: { read: false, write: false }, // future
            dbSettings: { read: false, write: false }, // future
            editor: { read: false, write: false },
        },
        '2': { // Limited Operator (2)
            datapoint: { read: true, write: true },
            dashboards: { read: true, write: false },
            trends: { view: true, enable: true, clear: true, add: false, edit: false, delete: false },
            alarms: { view: true, enable: true, ack: true, add: false, edit: false, delete: false },
            schedules: { view: true, enable: true, add: false, edit: false, delete: false },
            users: { read: false, write: false },
            roles: { read: false, write: false },
            audit: { read: false, write: false }, // future
            smtpSettings: { read: false, write: false }, // future
            dbSettings: { read: false, write: false }, // future
            editor: { read: false, write: false },
        },
        '3': { // Standard Operator (3)
            datapoint: { read: true, write: true },
            dashboards: { read: true, write: false },
            trends: { view: true, enable: true, clear: true, add: false, edit: true, delete: false },
            alarms: { view: true, enable: true, ack: true, add: false, edit: true, delete: false },
            schedules: { view: true, enable: true, add: false, edit: true, delete: false },
            users: { read: false, write: false },
            roles: { read: false, write: false },
            audit: { read: false, write: false }, // future
            smtpSettings: { read: false, write: false }, // future
            dbSettings: { read: false, write: false }, // future
            editor: { read: false, write: false },
        },
        '4': { // IT Operator (4)
            datapoint: { read: true, write: true },
            dashboards: { read: true, write: false },
            trends: { view: true, enable: true, clear: true, add: false, edit: true, delete: false },
            alarms: { view: true, enable: true, ack: true, add: false, edit: true, delete: false },
            schedules: { view: true, enable: true, add: false, edit: true, delete: false },
            users: { read: false, write: false },
            roles: { read: false, write: false },
            audit: { read: false, write: false }, // future
            smtpSettings: { read: true, write: true }, // future
            dbSettings: { read: true, write: true }, // future
            editor: { read: false, write: false },
        },
        '5': { // Security Operator (5)
            datapoint: { read: true, write: true },
            dashboards: { read: true, write: false },
            trends: { view: true, enable: true, clear: true, add: false, edit: true, delete: false },
            alarms: { view: true, enable: true, ack: true, add: false, edit: true, delete: false },
            schedules: { view: true, enable: true, add: false, edit: true, delete: false },
            users: { read: true, write: true },
            roles: { read: true, write: true },
            audit: { read: true, write: true }, // future
            smtpSettings: { read: false, write: false }, // future
            dbSettings: { read: false, write: false }, // future
            editor: { read: false, write: false },
        },
        '6': { // Reserved (6)
            datapoint: { read: true, write: true },
            dashboards: { read: true, write: false },
            trends: { view: true, enable: true, clear: true, add: false, edit: true, delete: false },
            alarms: { view: true, enable: true, ack: true, add: false, edit: true, delete: false },
            schedules: { view: true, enable: true, add: false, edit: true, delete: false },
            users: { read: true, write: true },
            roles: { read: true, write: true },
            audit: { read: true, write: true }, // future
            smtpSettings: { read: false, write: false }, // future
            dbSettings: { read: false, write: false }, // future
            editor: { read: false, write: false },
        },
        '7': { // Reserved (7)
            datapoint: { read: true, write: true },
            dashboards: { read: true, write: false },
            trends: { view: true, enable: true, clear: true, add: false, edit: true, delete: false },
            alarms: { view: true, enable: true, ack: true, add: false, edit: true, delete: false },
            schedules: { view: true, enable: true, add: false, edit: true, delete: false },
            users: { read: true, write: true },
            roles: { read: true, write: true },
            audit: { read: true, write: true }, // future
            smtpSettings: { read: false, write: false }, // future
            dbSettings: { read: false, write: false }, // future
            editor: { read: false, write: false },
        },
        '8': { // Reserved (8)
            datapoint: { read: true, write: true },
            dashboards: { read: true, write: false },
            trends: { view: true, enable: true, clear: true, add: false, edit: true, delete: false },
            alarms: { view: true, enable: true, ack: true, add: false, edit: true, delete: false },
            schedules: { view: true, enable: true, add: false, edit: true, delete: false },
            users: { read: true, write: true },
            roles: { read: true, write: true },
            audit: { read: true, write: true }, // future
            smtpSettings: { read: false, write: false }, // future
            dbSettings: { read: false, write: false }, // future
            editor: { read: false, write: false },
        },
        '9': { // Tech (9)
            datapoint: { read: true, write: true },
            dashboards: { read: true, write: true },
            trends: { view: true, enable: true, clear: true, add: true, edit: true, delete: true },
            alarms: { view: true, enable: true, ack: true, add: true, edit: true, delete: true },
            schedules: { view: true, enable: true, add: true, edit: true, delete: true },
            users: { read: false, write: false },
            roles: { read: false, write: false },
            audit: { read: false, write: false }, // future
            smtpSettings: { read: true, write: true }, // future
            dbSettings: { read: false, write: false }, // future
            editor: { read: true, write: true },
        },
        '10': { // Admin (10)
            datapoint: { read: true, write: true },
            dashboards: { read: true, write: true },
            trends: { view: true, enable: true, clear: true, add: true, edit: true, delete: true },
            alarms: { view: true, enable: true, ack: true, add: true, edit: true, delete: true },
            schedules: { view: true, enable: true, add: true, edit: true, delete: true },
            users: { read: true, write: true },
            roles: { read: true, write: true },
            audit: { read: true, write: true }, // future
            smtpSettings: { read: true, write: true }, // future
            dbSettings: { read: true, write: true }, // future
            editor: { read: true, write: true },
        },
    };

    constructor(private http: HttpClient) {
        this.getAll().pipe(first()).subscribe(roles => this.roles = roles);
    }

    getAll() {
        return this.http.get<[RoleName]>(`/api/roles`);
    }

    update(level: string, role: any) {
        return this.http.put<RoleName>(`/api/roles/${level}`, role);
    }

    getRoleAccess(aclkey: string, role: string) {
        return this.acl[role][aclkey];
    }

    overrideRoleAccess(aclkey: string, role: string, overrideAccess: string) {
        let userHasAccess = parseInt(role) >= parseInt(overrideAccess);
        let access = {};
        let defaultAccess = this.getRoleAccess(aclkey, role);
        for (let key in defaultAccess) {
            access[key] = userHasAccess;
        }
        return access;
    }
}
