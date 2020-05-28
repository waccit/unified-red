import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { UiRoutingModule } from './ui-routing.module';
import { AlertsComponent } from './alerts/alerts.component';
import { AnimationsComponent } from './animations/animations.component';
import { BadgeComponent } from './badge/badge.component';
import { ButtonsComponent } from './buttons/buttons.component';
import { CardsComponent } from './cards/cards.component';
import { DialogsComponent } from './dialogs/dialogs.component';
import { HelperClassesComponent } from './helper-classes/helper-classes.component';
import { LabelsComponent } from './labels/labels.component';
import { ListGroupComponent } from './list-group/list-group.component';
import { MediaObjectComponent } from './media-object/media-object.component';
import { ModalComponent } from './modal/modal.component';
import { PreloadersComponent } from './preloaders/preloaders.component';
import { ProgressbarsComponent } from './progressbars/progressbars.component';
import { TabsComponent } from './tabs/tabs.component';
import { TypographyComponent } from './typography/typography.component';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSliderModule } from '@angular/material/slider';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ChipsComponent } from './chips/chips.component';
import { BottomSheetComponent } from './bottom-sheet/bottom-sheet.component';
import { SnackbarComponent } from './snackbar/snackbar.component';
import { ExpansionPanelComponent } from './expansion-panel/expansion-panel.component';

@NgModule({
    declarations: [
        AlertsComponent,
        AnimationsComponent,
        BadgeComponent,
        ButtonsComponent,
        CardsComponent,
        DialogsComponent,
        HelperClassesComponent,
        LabelsComponent,
        ListGroupComponent,
        MediaObjectComponent,
        ModalComponent,
        PreloadersComponent,
        ProgressbarsComponent,
        TabsComponent,
        TypographyComponent,
        ChipsComponent,
        BottomSheetComponent,
        SnackbarComponent,
        ExpansionPanelComponent,
    ],
    imports: [
        CommonModule,
        UiRoutingModule,
        MatButtonModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        FormsModule,
        MatBadgeModule,
        MatChipsModule,
        MatAutocompleteModule,
        MatBottomSheetModule,
        MatListModule,
        MatSidenavModule,
        MatSnackBarModule,
        MatExpansionModule,
        MatDatepickerModule,
        MatCardModule,
        MatProgressSpinnerModule,
        MatProgressBarModule,
        MatSliderModule,
        MatTabsModule,
        MatCheckboxModule,
        ReactiveFormsModule,
    ],
})
export class UiModule {}
