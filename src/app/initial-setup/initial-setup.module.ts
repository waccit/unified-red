import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { MatExpansionModule } from '@angular/material/expansion';

import { InitialSetupComponent } from './initial-setup.component';
import { InitialSetupConfirmation } from './initial-setup-confirmation.component';

@NgModule({
    declarations: [InitialSetupComponent, InitialSetupConfirmation],
    imports: [
        RouterModule,
        BrowserModule,
        ReactiveFormsModule,
        FormsModule,
        MatStepperModule,
        MatButtonModule,
        MatProgressBarModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatSnackBarModule,
        MatSlideToggleModule,
        MatExpansionModule,
    ]
})
export class InitialSetupModule {}
