import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { first } from 'rxjs/operators';
import { InstallService } from '../services/install.service';
import { SnackbarService } from '../services';
import { InitialSetupConfirmation } from './initial-setup-confirmation.component';

@Component({
    selector: 'app-initial-setup',
    templateUrl: './initial-setup.component.html',
    styleUrls: ['./initial-setup.component.scss'],
})
export class InitialSetupComponent implements OnInit {
    isLinear = false;
    dbForm: FormGroup;
    jwtForm: FormGroup;
    smtpForm: FormGroup;
    nrForm: FormGroup;
    canInstall = false;
    dbConnectionOk = false;
    dbProgress = false;
    smtpServerOk = false;
    smtpProgress = false;
    urURL = window.location.protocol + '//' + window.location.host;
    nrURL = window.location.protocol + '//' + window.location.host + '/admin';

    constructor(
        private formBuilder: FormBuilder,
        private snackbar: SnackbarService,
        private installService: InstallService,
        public dialog: MatDialog
    ) {}

    ngOnInit() {
        this.dbForm = this.formBuilder.group({
            mongoConnection: ['mongodb://localhost:27017/unified-red', Validators.required],
        });
        this.jwtForm = this.formBuilder.group({
            jwtsecret: [this.generateKey(), Validators.required],
        });
        this.smtpForm = this.formBuilder.group({
            fromName: ['Unified', Validators.required],
            fromAddress: ['unified@your_email_server.com', Validators.required],
            host: ['your_email_server.com', Validators.required],
            port: ['587', Validators.required],
            ssl: ['false', Validators.required],
            user: [''],
            password: [''],
        });
        this.nrForm = this.formBuilder.group({
            adminAuthPath: [''],
            staticPath: [''],
        });
        this.installService.isInstalled().subscribe((result) => {
            this.canInstall = !result;
        });
    }

    install() {
        if (!this.canInstall) {
            return;
        }
        // stop here if form is invalid
        if (this.dbForm.invalid || this.jwtForm.invalid || this.smtpForm.invalid || this.nrForm.invalid) {
            return;
        }

        let mongoConnection = this.dbForm.controls.mongoConnection.value;
        let jwtsecret = this.jwtForm.controls.jwtsecret.value;
        let smtp = this.formSmtpObj();
        let adminAuthPath = this.nrForm.controls.adminAuthPath.value || undefined;
        let staticPath = this.nrForm.controls.staticPath.value || undefined;

        this.installService
            .install(mongoConnection, jwtsecret, smtp, adminAuthPath, staticPath)
            .pipe(first())
            .subscribe(
                (data) => {
                    if (data.result) {
                        this.snackbar.success(data.message, 'OK');
                    } else {
                        this.snackbar.error('Installation failed: ' + data.message, 'OK');
                    }
                },
                (error) => {
                    this.snackbar.error('Installation error: ' + error, 'OK');
                }
            );
    }

    private generateKey() {
        var buf = new Uint8Array(192); // 265 characters
        window.crypto.getRandomValues(buf);
        return btoa(String.fromCharCode.apply(null, buf));
    }

    newJwtSecret() {
        this.jwtForm.controls.jwtsecret.setValue(this.generateKey());
    }

    testDb() {
        this.dbConnectionOk = false;
        this.dbProgress = true;
        let mongoConnection = this.dbForm.controls.mongoConnection.value;
        this.installService.testDbConnection(mongoConnection).subscribe((resp) => {
            this.dbProgress = false;
            if (resp.result) {
                this.dbConnectionOk = resp.result;
            }
            if (resp.error) {
                this.snackbar.error('MongoDB connection failed: ' + resp.error, 'OK');
            }
        });
    }

    testSmtp() {
        this.smtpServerOk = false;
        this.smtpProgress = true;
        let smtp = this.formSmtpObj();
        this.installService.testSmtpServer(smtp).subscribe((resp) => {
            this.smtpProgress = false;
            if (resp.result) {
                this.smtpServerOk = resp.result;
            }
            if (resp.error) {
                this.snackbar.error('SMTP connection failed: ' + resp.error, 'OK');
            }
        });
    }

    formSmtpObj() {
        return {
            fromAddress: this.smtpForm.controls.fromName.value
                ? "'" + this.smtpForm.controls.fromName.value + "' <" + this.smtpForm.controls.fromAddress.value + '>'
                : this.smtpForm.controls.fromAddress.value,
            host: this.smtpForm.controls.host.value,
            port: this.smtpForm.controls.port.value,
            ssl: this.smtpForm.controls.ssl.value === 'true',
            user: this.smtpForm.controls.user.value,
            password: this.smtpForm.controls.password.value,
        };
    }

    openConfirmationDialog() {
        this.dialog.open(InitialSetupConfirmation).afterClosed().subscribe(result => {
            if (result) {
                this.install();
            }
        });
    }
}