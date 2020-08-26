import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, concatMap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class NodeRedApiService {
    private tokenSubject: BehaviorSubject<any>;
    public token: Observable<any>;

    constructor(private http: HttpClient) {
        this.tokenSubject = new BehaviorSubject<any>(JSON.parse(localStorage.getItem('auth-tokens')));
        this.token = this.tokenSubject.asObservable();
    }

    login(username, password) {
        try {
            let headers = new HttpHeaders({
                "Node-RED-API-Version": "v2",
                "Content-Type": "application/x-www-form-urlencoded"
            });
            let body = new URLSearchParams();
            body.set('client_id', 'node-red-editor');
            body.set('grant_type', 'password');
            body.set('scope', '');
            body.set('username', username);
            body.set('password', password);
            return this.http.post<any>('/auth/token', body.toString(), { headers }).pipe(tap(response => {
                localStorage.setItem('auth-tokens', JSON.stringify(response));
                this.tokenSubject.next(response);
            }));
        }
        catch (e) {
            console.error(e);
        }
    }

    logout() {
        // remove user from local storage and set token to null
        localStorage.removeItem('auth-tokens');
        this.tokenSubject.next(null);
    }

    public get accessToken(): any {
        return this.tokenSubject.value.access_token;
    }

    deployNodes(nodeIds: string[], replaceFunc: Function) {
        try {
            let headers = new HttpHeaders({
                "Node-RED-API-Version": "v2",
                "Authorization": `Bearer ${this.accessToken}`
            });
            return this.http.get('/flows', { headers }).pipe(concatMap((data: any) => {
                if (data.flows) {
                    // replace existing node with new node
                    data.flows = data.flows.map(existing => {
                        if (nodeIds.indexOf(existing.id) !== -1) {
                            return replaceFunc(existing);
                        }
                        return existing;
                    });
                    let headers = new HttpHeaders({
                        "Node-RED-API-Version": "v2",
                        "Node-RED-Deployment-Type": "nodes", // important: tells node red only to update the changed nodes
                        "Authorization": `Bearer ${this.accessToken}`
                    });
                    return this.http.post('/flows', data, { headers });
                }
            }));
        }
        catch (e) {
            console.error(e);
        }
    }

}