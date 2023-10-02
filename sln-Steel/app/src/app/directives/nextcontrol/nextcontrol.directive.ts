import { MatSelect } from '@angular/material/select';
import { HostListener } from '@angular/core';
import { ElementRef } from '@angular/core';
import { Directive } from '@angular/core';
import { OnInit } from '@angular/core';
import { Input } from '@angular/core';
import { NgSelectComponent } from '@ng-select/ng-select';

@Directive({
  selector: '[nextControl]',
})
export class NextControl implements OnInit {
  @Input('next') nextControl: any;
  @HostListener('keydown', ['$event'])
  onInput(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      if (this.nextControl) {
        this.next(this.nextControl);
      }
    }
  }
  constructor(el: ElementRef) {}

  ngOnInit() {}

  private next(element: any) {
    if (this.nextControl instanceof MatSelect) {
      this.nextControl.focus();
      this.nextControl.toggle();
    } else if (element instanceof NgSelectComponent) {
      element.focus();
      element.open();
    } else {
      setTimeout(() => {
        document.getElementById(element).focus();
      }, 500);
    }
  }
}
