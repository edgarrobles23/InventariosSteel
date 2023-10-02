import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { KeyE_Directive } from "./keyE.directive";

@NgModule({
    declarations: [KeyE_Directive],
    imports: [CommonModule],
    exports: [KeyE_Directive],
})
export class KeyE {}
