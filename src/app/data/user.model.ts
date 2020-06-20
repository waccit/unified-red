/*
Credit to Jason Watmore (https://github.com/cornflourblue) for Angular Registration and Login example.
Source: https://github.com/cornflourblue/angular-8-registration-login-example
*/

export interface User {
    id: string;
    username: string;
    password: string;
    role: string;
    firstName: string;
    lastName: string;
    token?: string;
    enabled: boolean;
    email: string;
    expirationDate?: Date;
    createdDate?: Date;
    sessionExpiration?: number;
    sessionInactivity?: number;
}
