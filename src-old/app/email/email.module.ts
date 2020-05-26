import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EmailRoutingModule } from './email-routing.module';
import { ComposeComponent } from './compose/compose.component';
import { InboxComponent } from './inbox/inbox.component';
import { ReadMailComponent } from './read-mail/read-mail.component';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@NgModule({
  declarations: [ComposeComponent, InboxComponent, ReadMailComponent],
  imports: [
    CommonModule,
    EmailRoutingModule,
    MatCheckboxModule,
    CKEditorModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule
  ]
})
export class EmailModule {}
