import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UrTextComponent } from './ur-text/ur-text.component';
import { UrButtonComponent } from './ur-button/ur-button.component';
import { MatButtonModule } from '@angular/material/button';
import { UrTextInputComponent } from './ur-text-input/ur-text-input.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@NgModule({
    declarations: [UrTextComponent, UrButtonComponent, UrTextInputComponent],
    imports: [CommonModule, MatButtonModule, MatFormFieldModule, MatInputModule],
})
export class NodeTemplatesModule {}
