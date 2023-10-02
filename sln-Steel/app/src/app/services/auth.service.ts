/* eslint-disable @typescript-eslint/member-delimiter-style */
/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable @typescript-eslint/type-annotation-spacing */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable curly */
/* eslint-disable prefer-const */
/* eslint-disable one-var */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-trailing-spaces */
/* eslint-disable arrow-body-style */
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of, switchMap, throwError } from 'rxjs';
import { Injectable } from '@angular/core';
import JWTDecode from 'jwt-decode';
import { Usuario, Empresa } from 'app/store/models/store.user.model';
import { HttpService } from './http.service';
import { globalConst } from 'app/app.config';
import { UserService } from 'app/core/user/user.service';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { Router } from '@angular/router';
import { TokenModel } from 'app/store/models/Token.model.';
import { isNull } from 'lodash';
import { TokenService } from './token.service';
import moment from 'moment';

@Injectable()
export class AuthService {
  private _authenticated: boolean = false;
  private idAplicacion: string = globalConst.IdAplicacion;

  /**
   * Constructor
   */
  constructor(
    private _httpClient: HttpClient,
    private _userService: UserService,
    private _httpService: HttpService,
    private _router: Router,
    private _TokenService: TokenService
  ) {}

  // -----------------------------------------------------------------------------------------------------
  // @ Accessors
  // -----------------------------------------------------------------------------------------------------
  get accessToken(): string {
    const { Token } = JSON.parse(localStorage['ResponseServer']);
    return Token ?? '';
  }

  get empresas(): Observable<Array<Empresa>> {
    return this._httpService.get('Seguridad', 'Empresas');
  }

  get usuario(): Usuario {
    const Token = this.accessToken;
    if (Token) {
      return JWTDecode(Token);
    } else {
      return null;
    }
  }
  get token(): string {
    const Token = this.accessToken;
    if (Token) {
      return Token;
    }
    return null;
  }

  get imagenPerfil(): string {
    const { FotoPerfil } = JSON.parse(localStorage['ResponseServer']);
    if (FotoPerfil) return FotoPerfil;
  }

  get refreshtoken(): string {
    const { RefreshToken } = JSON.parse(localStorage['ResponseServer']);
    if (RefreshToken) return RefreshToken;
    return null;
  }

  get menu(): Array<any> {
    const { Menu } = JSON.parse(localStorage['ResponseServer']);
    if (Menu) return Menu;
    return null;
  }

  signIn(credentials: any): Observable<any> {
    if (this._authenticated) {
      return throwError('User is already logged in.');
    }
    return this._httpService.postFromBody('Login', 'SignIn', credentials);
  }
  ConfirmedDelete(credentials: any): Observable<any> {
    if (this._authenticated) {
      return throwError('User is already logged in.');
    }
    return this._httpService.postFromBody('Login', 'ConfirmedDelete', credentials);
  }
  recoveryPassword(data: any): Observable<any> {
    return this._httpService.postFromBody('Login', 'RecoveryPassword', data);
  }
  resetPassword(data: any): Observable<any> {
    return this._httpService.postFromBody('Login', 'ResetPassword', data);
  }
  signInUsingToken(): Observable<any> {
    // Renew token
    return this._httpClient
      .post('api/auth/refresh-access-token', {
        access_token: this.accessToken,
      })
      .pipe(
        catchError(() => {
          // Return false
          return of(false);
        }),
        switchMap((response: any) => {
          // Store the access token in the local storage
          // this.accessToken = response.access_token;

          // Set the authenticated flag to true
          this._authenticated = true;

          // Store the user on the user service
          this._userService.user = response.user;

          // Return true
          return of(true);
        })
      );
  }

  /**
   * Sign out
   */
  signOut(): Observable<any> {
    const { Token } = JSON.parse(localStorage['ResponseServer']);
    return this._httpService.postFromBody('Login', 'Logout', { Token: Token });
  }

  /**
   * Lanza modal para reiniciar sesión.
   */
  reLogin(credentials: any) {
    return this._httpService.postFromBody('Login', 'SignIn', credentials);
  }

  /**
   * Limpia  el Storage del Browser
   */
  cleanLocalStorage(): void {
    // Set
    localStorage.removeItem('ResponseServer');
    sessionStorage.removeItem('RT_Interval');
    sessionStorage.removeItem('firstRoute');

    this._router.navigate(['']);
  }

  setLocalstorage(data: any): void {
    console.log(data);
    localStorage['ResponseServer'] = JSON.stringify(data);
  }
  /**
   * Sign up
   */
  signUp(user: { name: string; email: string; password: string; company: string }): Observable<any> {
    return this._httpClient.post('api/auth/sign-up', user);
  }

  /**
   * Unlock session
   *
   * @param credentials
   */
  unlockSession(credentials: { email: string; password: string }): Observable<any> {
    return this._httpClient.post('api/auth/unlock-session', credentials);
  }

  /**
   * Check the authentication status
   */
  check(): Observable<boolean> {
    // Check if the user is logged in
    // if (this._authenticated) {
    //     return of(true);
    // }

    // Check the access token availability
    if (!this.accessToken) {
      return of(false);
    }

    // Check the access token expire date
    if (AuthUtils.isTokenExpired(this.accessToken)) {
      return of(false);
    }

    // If the access token exists and it didn't expire, sign in using it
    return this.signInUsingToken();
  }
  refreshToken(): void {
    this._httpService
      .postFromBody('Login', 'RefreshToken', {
        IdAplicacion: this.idAplicacion,
      })
      .subscribe({
        next: (data: any) => {
          //Update Localstorage
          const { token, refreshToken } = data;
          let ResponseServer = JSON.parse(localStorage['ResponseServer']);
          ResponseServer.Token = token;
          ResponseServer.RefreshToken = refreshToken;

          localStorage['ResponseServer'] = JSON.stringify(ResponseServer);
        },
        error: (err) => {
          console.log('Refresh_Token Error: ', err);
          this.cleanLocalStorage();
        },
      });
  }
  GetMenu(params: any = {}) {
    let usuario = this.usuario;
    let params_ = { IDUsuario: usuario?.IdUsuario, IDAplicacion: this.idAplicacion || 106 };
    return this._httpService.postFromBody('Login', 'GetMenu', params_).toPromise();
  }
  async FindRoute(route: string) {
    let result;
    let TokenData: TokenModel = JWTDecode(this.token);
    const data: any = await this.GetMenu(TokenData.User);
    data.menuUsuario.forEach((it) => {
      if (it?.link == route || route.indexOf(it?.link) > -1) {
        result = it?.link;
      }

      if (it.children) {
        if (!result) result = it.children.find((itt) => itt.link == route || route.indexOf(itt?.link) > -1)?.link;
      }
    });

    return result;
  }

  async FirstRoute() {
    let result;
    let TokenData: TokenModel = JWTDecode(this.token);
    const data: any = await this.GetMenu(TokenData.User);

    data.menuUsuario.forEach((it) => {
      if (it.link && !result) return (result = it?.link);

      if (it.children) {
        if (!result) result = it.children.find((itt) => itt.link)?.link;
      }
    });

    return result;
  }
  /**
   * Verifica la expiración del Token
   */
  Expiracion_Token(): 'Vigente' | 'Refresh' | 'Expirado' {
    if (!isNull(this._TokenService.decodeToken())) {
      var Token: TokenModel = this._TokenService.decodeToken();
      var Date_Token = moment(new Date(Token.User.exp * 1000));
      var Date_Actual = moment(new Date(Date.now()));
      var Expiracion = Date_Token.diff(Date_Actual, 'minutes');

      // this.TablaExpiracionToken(Date_Token, Date_Actual, Expiracion);

      if (Expiracion > 5) {
        return 'Vigente';
      } else if (Expiracion > 0 && Expiracion < 5) {
        return 'Refresh';
      } else if (Expiracion <= 0) {
        return 'Expirado';
      }
    } else {
      return null;
    }
  }
}
