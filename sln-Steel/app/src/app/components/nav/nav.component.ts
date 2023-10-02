import { Component } from '@angular/core';

@Component({
  selector: 'app-nav',
  template: `
    <nav class="text-sm font-medium">
      <ul class="flex space-x-1 w-full">
        <ng-content></ng-content>
      </ul>
    </nav>
  `,
})
export class NavComponent {}
