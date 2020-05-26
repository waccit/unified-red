import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { InboxComponent } from './inbox/inbox.component';
import { ComposeComponent } from './compose/compose.component';
import { ReadMailComponent } from './read-mail/read-mail.component';

const routes: Routes = [
  {
    path: 'inbox',
    component: InboxComponent
  },
  {
    path: 'compose',
    component: ComposeComponent
  },
  {
    path: 'read-mail',
    component: ReadMailComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmailRoutingModule {}
