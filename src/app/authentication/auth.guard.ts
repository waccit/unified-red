/*
Credit to Jason Watmore (https://github.com/cornflourblue) for Angular Registration and Login example.
Source: https://github.com/cornflourblue/angular-8-registration-login-example
*/

import { Injectable } from '@angular/core';
import { first } from 'rxjs/operators';
import {
    Router,
    CanActivate,
    ActivatedRouteSnapshot,
    RouterStateSnapshot,
} from '@angular/router';
import { AuthenticationService } from '../services/';
import { Role } from '../data';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
    constructor(
        private router: Router,
        private authenticationService: AuthenticationService
    ) {}
    private _userRole: Role;

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        if (this.authenticationService.tokenValue) {
            this.authenticationService.userValue().pipe(first())
            .subscribe(
                (user) => {
                    this._userRole = user.role;
                    // console.log("auth guard route.data.roles", route.data.roles, "auth guard userRole", this._userRole);
                    if (route.data.roles && (this._userRole < route.data.roles)) {
                        console.log("auth guard forbidden");
                        // role not authorised so redirect to forbidden
                        this.router.navigate(['/403-forbidden']);
                        return false;
                    }
                },
                (error) => {
                    console.log(error);
                }
            );
            return true; // authorized so return true
        }
        // not logged in so redirect to login page with the return url
        this.router.navigate(['/authentication/login'], {
            queryParams: { returnUrl: state.url },
        });
        return false;
    }
}
