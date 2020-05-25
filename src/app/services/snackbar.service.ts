import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class SnackbarService {

    constructor(private snackbar: MatSnackBar) {}

    info(message: string) {
        this.snackbar.open(message, '', { duration: 2000, verticalPosition: 'bottom', horizontalPosition: 'center', panelClass: 'snackbar-info' });
    }

    success(message: string) {
        this.snackbar.open(message, '', { duration: 2000, verticalPosition: 'bottom', horizontalPosition: 'center', panelClass: 'snackbar-success' });
    }

    warning(message: string) {
        this.snackbar.open(message, '', { duration: 2000, verticalPosition: 'bottom', horizontalPosition: 'center', panelClass: 'snackbar-warning' });
    }

    error(message: string) {
        this.snackbar.open(message, '', { duration: 2000, verticalPosition: 'bottom', horizontalPosition: 'center', panelClass: 'snackbar-danger' });
    }

}