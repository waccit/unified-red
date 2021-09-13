import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class InstallService {
    constructor(private http: HttpClient) { }

    isInstalled() {
        return this.http.get(`../api/install/`);
    }

    install(dbConnection, jwtsecret, smtp, adminAuthPath, staticPath) {
        return this.http.post<any>('../api/install/', { dbConnection, jwtsecret, smtp, adminAuthPath, staticPath });
    }

    testDbConnection(dbConnection) {
        return this.http.post<any>('../api/install/testdb/', { dbConnection });
    }

    testSmtpServer(smtp) {
        return this.http.post<any>('../api/install/testsmtp/', { smtp });
    }

}
