import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccessControl_Directive } from './access-control.directive';

@NgModule({
    declarations: [AccessControl_Directive],
    imports: [CommonModule],
    exports: [AccessControl_Directive],
})
export class AccessControl {}
