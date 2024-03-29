import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, concatMap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class NodeRedApiService {
    private httpAdminRoot = '/admin';
    private tokenSubject: BehaviorSubject<any>;
    public token: Observable<any>;

    constructor(private http: HttpClient) {
        this.tokenSubject = new BehaviorSubject<any>(JSON.parse(localStorage.getItem('auth-tokens')));
        this.token = this.tokenSubject.asObservable();
    }

    /*
    NODE-RED ADMIN API METHODS
    METHOD  END POINT               PERMISSION
    GET     /auth/login
    POST    /auth/token
    POST    /auth/revoke
    GET     /settings               settings.read
    GET     /flows                  flows.read
    POST    /flows                  flows.write
    POST    /flow                   flows.write
    GET     /flow/:id               flows.read
    PUT     /flow/:id               flows.write
    DELETE  /flow/:id               flows.write
    GET     /nodes                  nodes.read
    POST    /nodes                  nodes.write
    GET     /nodes/:module          nodes.read
    PUT     /nodes/:module          nodes.write
    DELETE  /nodes/:module          nodes.write
    GET     /nodes/:module/:set     nodes.read
    PUT     /nodes/:module/:set     nodes.write
    */

    login(username, password) {
        try {
            const headers = new HttpHeaders({
                'Node-RED-API-Version': 'v2',
                'Content-Type': 'application/x-www-form-urlencoded'
            });
            const body = new URLSearchParams();
            body.set('client_id', 'node-red-editor');
            body.set('grant_type', 'password');
            body.set('scope', '');
            body.set('username', username);
            body.set('password', password);
            return this.http.post<any>(this.httpAdminRoot + '/auth/token', body.toString(), { headers }).pipe(tap(response => {
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

    deployNodes(nodeIds: string[], replaceFunc: (node: any) => any ) {
        try {
            const headers = new HttpHeaders({
                'Node-RED-API-Version': 'v2',
                Authorization: `Bearer ${this.accessToken}`
            });
            return this.http.get(this.httpAdminRoot + '/flows', { headers }).pipe(concatMap((data: any) => {
                if (data.flows) {
                    // replace existing node with new node
                    data.flows = data.flows.map(existing => {
                        if (nodeIds.indexOf(existing.id) !== -1) {
                            return replaceFunc(existing);
                        }
                        return existing;
                    });
                    return this.http.post(this.httpAdminRoot + '/flows', data, { headers: new HttpHeaders({
                        'Node-RED-API-Version': 'v2',
                        'Node-RED-Deployment-Type': 'nodes', // important: tells node red only to update the changed nodes
                        Authorization: `Bearer ${this.accessToken}`
                    }) });
                }
            }));
        }
        catch (e) {
            console.error(e);
        }
    }

}