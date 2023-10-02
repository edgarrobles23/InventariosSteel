import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { UpperCaseDirective } from "./uppercase.directive";

@NgModule({
    declarations: [UpperCaseDirective],
    imports: [CommonModule],
    exports: [UpperCaseDirective],
})
export class UpperCase {}
