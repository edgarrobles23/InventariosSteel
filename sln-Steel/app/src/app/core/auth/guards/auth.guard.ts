/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable quotes */
/* eslint-disable @typescript-eslint/quotes */
/* eslint-disable curly */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/member-ordering */
import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  CanDeactivate,
  CanLoad,
  Route,
  Router,
  RouterStateSnapshot,
  UrlSegment,
  UrlTree,
} from '@angular/router';
import { LayoutComponent } from 'app/layout/layout.component';
import { AuthService } from 'app/services/auth.service';
import { HttpService } from 'app/services/http.service';
import { SystemService } from 'app/services/system.service';
import { TokenService } from 'app/services/token.service';
import { Observable, of } from 'rxjs';
import { GeneralService } from 'app/services/general.service';
import { TokenModel } from 'app/store/models/Token.model.';
import { isNull } from 'lodash';
import { globalConst } from 'app/app.config';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate, CanLoad {
  route: any;
  state: any;
  constructor(
    private _AuthService: AuthService,
    private _TokenService: TokenService,
    private _Router: Router,
    private _notify: GeneralService.Notify
  ) {}
  canLoad(
    route: Route,
    segments: UrlSegment[]
  ): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    this.route = route;
    if (!this._Check()) {
      this._Router.navigate(['sign-in']);
      return of(false);
    } else return of(true);
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    this.route = route;
    this.state = state;

    if (!this._Check()) {
      this._Router.navigate(['sign-in']);
      return of(false);
    } else return of(true);
  }

  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    this.state = state;
    if (!this._Check()) {
      this._Router.navigate(['sign-in']);
      return of(false);
    } else return of(true);
  }

  private async _Check(): Promise<boolean> {
    let Expiracion_Token = this._AuthService.Expiracion_Token();
    if (!isNull(Expiracion_Token)) {
      //Se decodifica el token y seteamos la data de usuario y acciones
      let TokenData: TokenModel = this._TokenService.decodeToken();
      this._TokenService.SETStore_User(TokenData.User);

      // Revisamos Expiración
      if (Expiracion_Token == 'Vigente') {
        /*ACZ01:INICIO Proteccion de Rutas escitas en la url*/

        if (this.state.url == '/') {
          this._Router.navigateByUrl(localStorage['firstRoute']);
          return false;
        }

        let findRoute = await this._AuthService.FindRoute(this.state.url);
        let firstRoute = await this._AuthService.FirstRoute();
        if (!findRoute) {
          // si no exite la rita redireccionalo a la primer link que existe
          if (!firstRoute) {
            this._notify.Error('El usuario no tiene ningún permiso para la aplicación de Encuestas..');
            this._AuthService.cleanLocalStorage();
            this._Router.navigate(['sign-in']);
          }
          localStorage['firstRoute'] = firstRoute;
          this._Router.navigateByUrl(firstRoute);
        }
        /*ACZ01:FIN Proteccion de Rutas escitas en la url*/

        return true;
      } else if (Expiracion_Token == 'Refresh') {
        this._AuthService.refreshToken();
        return true;
      } else if (Expiracion_Token == 'Expirado') {
        this._AuthService.cleanLocalStorage();
        return false;
      }
    } else {
      this._AuthService.cleanLocalStorage();
      return false;
    }
  }
}

@Injectable({
  providedIn: 'root',
})
export class AuthToken implements CanActivate {
  /**
   * Constructor
   */
  constructor(
    private _httpService: HttpService,
    private _router: Router,
    private _notifyService: SystemService.Notify
  ) {}

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<any> {
    const { Token } = route.params;
    let error = null;
    if (!Token) error = 'El Token no existe en la ruta';
    const data = await this._httpService.postFromBodyAsyncPromise('Login', 'ValidateTokenRecovery', { Token: Token });

    if (data['error']) error = data['error'];

    if (error) {
      this._router.navigate(['/sign-in']);
      // return of(null);
      setTimeout(() => {
        this._notifyService.notifyError(error);
      }, 1000);
    }

    return true;
  }
}

@Injectable({ providedIn: 'root' })
export class CanDeactivateGuard implements CanDeactivate<LayoutComponent> {
  canDeactivate(
    component: LayoutComponent,
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | boolean {
    // you can just return true or false synchronously
    return true;
  }
}
