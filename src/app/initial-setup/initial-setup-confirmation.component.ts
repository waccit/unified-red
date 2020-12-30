import { Component } from '@angular/core';

@Component({
    selector: 'app-initial-setup-confirmation',
    templateUrl: './initial-setup-confirmation.component.html',
    styleUrls: ['./initial-setup-confirmation.component.scss'],
})
export class InitialSetupConfirmation {
    urURL = window.location.protocol + '//' + window.location.host;
    nrURL = window.location.protocol + '//' + window.location.host + '/admin';
}
