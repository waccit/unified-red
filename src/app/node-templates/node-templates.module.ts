import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UrTextComponent } from './ur-text/ur-text.component';
import { UrButtonComponent } from './ur-button/ur-button.component';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
    declarations: [UrTextComponent, UrButtonComponent],
    imports: [CommonModule, MatButtonModule],
})
export class NodeTemplatesModule {}
