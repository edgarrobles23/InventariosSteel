/* eslint-disable quotes */
/* eslint-disable arrow-parens */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable curly */
/* eslint-disable no-trailing-spaces */
/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable @typescript-eslint/naming-convention */
import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

declare global {
  interface Window {
    dynamic: string;
    siteMode: string;
    siteModeBva: string;
  }
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  /**
   * Constructor
   */

  constructor(private router: Router) {
    window.dynamic = 'component';

    const navEndEvent$ = this.router.events.pipe(filter((e) => e instanceof NavigationEnd));
    navEndEvent$.subscribe((e: NavigationEnd) => {});
  }
}
