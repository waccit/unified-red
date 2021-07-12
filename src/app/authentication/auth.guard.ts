/*
Credit to Jason Watmore (https://github.com/cornflourblue) for Angular Registration and Login example.
Source: https://github.com/cornflourblue/angular-8-registration-login-example
*/

import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthenticationService } from '../services/';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
    constructor(private router: Router, private authenticationService: AuthenticationService) {}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        if (this.authenticationService.tokenValue) {
            const userRole = this.authenticationService.getUserRole();
            if (route.data.roles) {
                /*
                if route.data.roles contains a single role, then the user's role must be greater than or equal to
                route.data.roles to grant access. if route.data.roles contains an array of roles, then the user's
                role must be explicitly included in the array of roles to grant access.
                */
                let rolesArray = Array.isArray(route.data.roles);
                if ((!rolesArray && userRole < route.data.roles) || (rolesArray && !route.data.roles.includes(userRole))) {
                    // role not authorized so redirect to forbidden
                    this.router.navigate(['/403-forbidden']);
                    return false;
                }
            }
            return true; // authorized so return true
        }
        // not logged in so redirect to login page with the return url
        this.router.navigate(['/authentication/login'], {
            queryParams: { returnUrl: state.url },
        });
        return false;
    }
}
