import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class InstallService {
    constructor(private http: HttpClient) {}

    isInstalled() {
        return this.http.get(`/api/install/`);
    }
    
    install(mongoConnection, jwtsecret, smtp, adminAuthPath, staticPath) {
        return this.http.post<any>('/api/install/', { mongoConnection, jwtsecret, smtp, adminAuthPath, staticPath });
    }

    testDbConnection(mongoConnection) {
        return this.http.post<any>('/api/install/testdb/', { mongoConnection });
    }

    testSmtpServer(smtp) {
        return this.http.post<any>('/api/install/testsmtp/', { smtp });
    }

}
