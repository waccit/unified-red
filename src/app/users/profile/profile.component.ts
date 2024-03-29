import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { first, map, startWith } from 'rxjs/operators';
import { AuthenticationService, SnackbarService, CurrentUserService, UserService } from '../../services';
import { MustMatch, PasswordStrengthValidator } from '../../authentication/register/password.validators';
import { User } from '../../data/';
import { MenuService } from '../../services/menu.service';
import { RouteInfo } from '../../layout/sidebar/sidebar.metadata';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
    settingsForm: FormGroup;
    usernameForm: FormGroup;
    passwordForm: FormGroup;
    hide = true;
    chide = true;
    private userId: string;
    private username: string;
    pages: string[] = [];
    filteredPages: Observable<string[]>;
    homepage = new FormControl();

    constructor(
        private formBuilder: FormBuilder,
        private userService: UserService,
        private currentUserService: CurrentUserService,
        private authenticationService: AuthenticationService,
        private snackbar: SnackbarService,
        private menuService: MenuService
    ) {}

    ngOnInit() {
        this.settingsForm = this.formBuilder.group({
            firstName: ['', Validators.required],
            lastName: ['', Validators.required],
            email: ['', [Validators.required, Validators.email, Validators.minLength(5)]],
            homepage: this.homepage,
        });
        this.usernameForm = this.formBuilder.group({
            username: ['', Validators.required],
            password: ['', Validators.required],
        });
        this.passwordForm = this.formBuilder.group(
            {
                password: ['', Validators.required],
                newPassword: ['', [Validators.required, Validators.minLength(8), PasswordStrengthValidator]],
                cNewPassword: ['', Validators.required],
            },
            {
                validator: MustMatch('newPassword', 'cNewPassword'),
            }
        );
        this.currentUserService.currentUser.subscribe((user: User) => {
            if (user) {
                this.userId = user._id;
                this.username = user.username;
                this.settingsForm.setValue({
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    homepage: user.homepage || '',
                });
                this.usernameForm.setValue({
                    username: user.username,
                    password: '',
                });
            }
        });
        this.menuService.menu.subscribe((menu) => {
            if (menu && menu.length) {
                for (let folder of menu) {
                    this.getPagePaths(folder);
                }
            }
        });
        this.filteredPages = this.homepage.valueChanges.pipe(
            startWith(''),
            map((value) => this._filter(value))
        );
    }

    get sf() {
        return this.settingsForm.controls;
    }

    get uf() {
        return this.usernameForm.controls;
    }

    get pf() {
        return this.passwordForm.controls;
    }

    onSettingsSubmit() {
        if (this.settingsForm.invalid) {
            return;
        }
        this.userService
            .update(this.userId, this.settingsForm.value)
            .pipe(first())
            .subscribe(
                () => {
                    // data: User
                    this.snackbar.success('Account settings successfully saved!');
                },
                (error) => {
                    this.snackbar.error(error);
                }
            );
    }

    onUsernameSubmit() {
        if (this.usernameForm.invalid) {
            return;
        }
        this.authenticationService
            .login(this.username, this.uf.password.value)
            .pipe(first())
            .subscribe(
                () => {
                    // data
                    this.userService
                        .update(this.userId, { username: this.uf.username.value })
                        .pipe(first())
                        .subscribe(
                            (user: User) => {
                                this.username = user.username;
                                this.snackbar.success('Username successfully changed!');
                            },
                            (error) => {
                                this.snackbar.error(error);
                            }
                        );
                },
                (error) => {
                    this.snackbar.error(error);
                }
            );
    }

    onPasswordSubmit() {
        if (this.passwordForm.invalid) {
            return;
        }
        this.authenticationService
            .login(this.username, this.pf.password.value)
            .pipe(first())
            .subscribe(
                () => {
                    // data
                    this.userService
                        .update(this.userId, { password: this.pf.newPassword.value })
                        .pipe(first())
                        .subscribe(
                            () => {
                                // data: User
                                this.snackbar.success('Password successfully changed!');
                            },
                            (error) => {
                                this.snackbar.error(error);
                            }
                        );
                },
                (error) => {
                    this.snackbar.error(error);
                }
            );
    }

    private getPagePaths(page: RouteInfo) {
        if (page.isPage) {
            this.pages.push(page.path);
        } else {
            for (let sub of page.submenu) {
                this.getPagePaths(sub);
            }
        }
    }

    private _filter(value: string): string[] {
        const filterValue = value.toLowerCase();
        return this.pages.filter((option) => option.toLowerCase().includes(filterValue));
    }
}
