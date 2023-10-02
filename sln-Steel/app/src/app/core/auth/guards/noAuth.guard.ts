/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/type-annotation-spacing */
/* eslint-disable eol-last */
/* eslint-disable curly */
/* eslint-disable @typescript-eslint/naming-convention */
import { ActivatedRouteSnapshot, CanActivateChild, CanLoad, Route, UrlSegment, UrlTree } from '@angular/router';
import { AuthService } from 'app/services/auth.service';
import { RouterStateSnapshot } from '@angular/router';
import { CanActivate } from '@angular/router';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { isNull } from 'lodash';
import { TokenService } from 'app/services/token.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NoAuthGuard implements CanActivate, CanActivateChild, CanLoad {
  constructor(private _tokenService: TokenService, private _router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return this.check(state.url);
  }
  /**
   * Can activate child
   *
   * @param childRoute
   * @param state
   */
  canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return this.check(state.url);
  }

  canLoad(route: Route, segments: UrlSegment[]): boolean {
    return true;
  }

  private check(url: string) {
    switch (url) {
      case '/':
        if (this._Check()) this._router.navigate(['Home']);
        else this._router.navigate(['sign-in']);
        break;
      case '/sign-in':
        if (this._Check()) this._router.navigate(['Home']);
        break;
      case '/sign-out':
      case '/sign-out':
        break;
    }
    return true;
  }

  private _Check(): boolean {
    const status = this._tokenService.statusToken();
    return status === 'Vigente' || status === 'Refresh';
  }
}
