import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { NextControl } from "./nextcontrol.directive";

@NgModule({
    declarations: [NextControl],
    imports: [CommonModule],
    exports: [NextControl],
})
export class NextControlModule {}
