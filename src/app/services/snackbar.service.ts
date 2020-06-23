import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class SnackbarService {
    constructor(private snackbar: MatSnackBar) {}

    default(message: string, action = '', panelClass?) {
        this.snackbar.open(message, action, {
            duration: action ? null : 2000,
            verticalPosition: 'bottom',
            horizontalPosition: 'center',
            panelClass: panelClass,
        });
    }

    info(message: string, action = '') {
        this.default(message, action, 'snackbar-info');
    }

    success(message: string, action = '') {
        this.default(message, action, 'snackbar-success');
    }

    warning(message: string, action = '') {
        this.default(message, action, 'snackbar-warning');
    }

    error(message: string, action = '') {
        this.default(message, action, 'snackbar-danger');
    }
}
