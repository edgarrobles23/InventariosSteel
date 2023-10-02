import { Directive, HostListener } from '@angular/core';
@Directive({
    selector: '[keyE]',
})
export class KeyE_Directive {
    constructor() {}

    @HostListener('keydown', ['$event']) onKeyDown(e) {
        return e.keyCode !== 69;
    }
}
