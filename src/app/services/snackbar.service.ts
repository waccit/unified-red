import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class SnackbarService {
    constructor(private snackbar: MatSnackBar) {}

    default(message: string, action = '', panelClass?, duration = 2000) {
        this.snackbar.open(message, action, {
            duration: action ? null : duration,
            verticalPosition: 'bottom',
            horizontalPosition: 'center',
            panelClass: panelClass,
        });
    }

    info(message: string, action = '', duration = 2000) {
        this.default(message, action, 'snackbar-info', duration);
    }

    success(message: string, action = '', duration = 2000) {
        this.default(message, action, 'snackbar-success', duration);
    }

    warning(message: string, action = '', duration = 2000) {
        this.default(message, action, 'snackbar-warning', duration);
    }

    error(message: string, action = '', duration = 2000) {
        this.default(message, action, 'snackbar-danger', duration);
    }
}
