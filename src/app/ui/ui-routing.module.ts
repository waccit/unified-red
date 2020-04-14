import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CardsComponent } from './cards/cards.component';
import { DialogsComponent } from './dialogs/dialogs.component';
import { LabelsComponent } from './labels/labels.component';
import { ListGroupComponent } from './list-group/list-group.component';
import { MediaObjectComponent } from './media-object/media-object.component';
import { PreloadersComponent } from './preloaders/preloaders.component';
import { TabsComponent } from './tabs/tabs.component';
import { TypographyComponent } from './typography/typography.component';
import { HelperClassesComponent } from './helper-classes/helper-classes.component';
import { AlertsComponent } from './alerts/alerts.component';
import { AnimationsComponent } from './animations/animations.component';
import { BadgeComponent } from './badge/badge.component';
import { ButtonsComponent } from './buttons/buttons.component';
import { ProgressbarsComponent } from './progressbars/progressbars.component';
import { ModalComponent } from './modal/modal.component';
import { ChipsComponent } from './chips/chips.component';
import { BottomSheetComponent } from './bottom-sheet/bottom-sheet.component';
import { SnackbarComponent } from './snackbar/snackbar.component';
import { ExpansionPanelComponent } from './expansion-panel/expansion-panel.component';

const routes: Routes = [
  {
    path: 'alerts',
    component: AlertsComponent
  },
  {
    path: 'animations',
    component: AnimationsComponent
  },
  {
    path: 'badges',
    component: BadgeComponent
  },
  {
    path: 'chips',
    component: ChipsComponent
  },
  {
    path: 'buttons',
    component: ButtonsComponent
  },
  {
    path: 'cards',
    component: CardsComponent
  },
  {
    path: 'expansion-panel',
    component: ExpansionPanelComponent
  },
  {
    path: 'bottom-sheet',
    component: BottomSheetComponent
  },
  {
    path: 'dialogs',
    component: DialogsComponent
  },
  {
    path: 'labels',
    component: LabelsComponent
  },
  {
    path: 'list-group',
    component: ListGroupComponent
  },
  {
    path: 'media-object',
    component: MediaObjectComponent
  },
  {
    path: 'modal',
    component: ModalComponent
  },
  {
    path: 'snackbar',
    component: SnackbarComponent
  },
  {
    path: 'preloaders',
    component: PreloadersComponent
  },
  {
    path: 'progressbars',
    component: ProgressbarsComponent
  },
  {
    path: 'tabs',
    component: TabsComponent
  },
  {
    path: 'typography',
    component: TypographyComponent
  },
  {
    path: 'helper-classes',
    component: HelperClassesComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UiRoutingModule {}
