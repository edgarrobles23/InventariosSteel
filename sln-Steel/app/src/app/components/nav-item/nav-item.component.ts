import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-nav-item',
  styles: [
    `
      app-nav-item {
        border-top: 1px solid #e1e1e1 !important;
        border-left: 1px solid #e1e1e1 !important;
        border-right: 1px solid #e1e1e1 !important;
        margin-left: 2px;
        a {
          border-radius: 5px 5px 0px 0px !important;
        }
      }
    `,
  ],
  template: `
    <li>
      <a
        [routerLink]="href"
        class="block px-3 py-2 rounded-t-sm break-all  whitespace-pre-line"
        [ngClass]="isActive ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-gray-500'"
      >
        <ng-content></ng-content>
      </a>
    </li>
  `,
})
export class NavItemComponent {
  @Input() href!: string;
  @Input() isActive: boolean = false;

  constructor() {}
}
