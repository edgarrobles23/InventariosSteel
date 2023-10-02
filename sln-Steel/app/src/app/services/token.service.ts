/* eslint-disable eol-last */
/* eslint-disable @angular-eslint/contextual-lifecycle */
/* eslint-disable eqeqeq */
/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable quotes */
/* eslint-disable @typescript-eslint/quotes */
/* eslint-disable curly */
/* eslint-disable one-var */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/naming-convention */
import { Injectable } from '@angular/core';
import { ActionsModel } from 'app/store/models/Actions.model';
import JWTDecode from 'jwt-decode';
import { TokenModel } from 'app/store/models/Token.model.';
import { globalConst } from 'app/app.config';
import { isNull } from 'lodash';
import moment from 'moment';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ReloginComponent } from 'app/modules/auth/relogin/relogin.component';
import { HttpClient } from '@angular/common/http';
import { UserState } from '../app.state';
import { UserActionsState } from '../app.state';
import { Store } from '@ngrx/store';
import * as Userinfo from '../store/actions/DataUser.actions';
import * as DataUser from '../store/actions/Actions.actions';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  ProcessId = setTimeout(() => {}, 0);
  constructor(
    private _router: Router,
    private _matDialog: MatDialog,
    private _httpClient: HttpClient,
    private UserStore: Store<UserState>,
    private UserActionsStore: Store<UserActionsState>
  ) {
    console.log(this._router.url);
    if (
      !this._router.url.startsWith('/sign-in') &&
      location.pathname != '/' &&
      !this._router.url.startsWith('/forgot-password') &&
      !this._router.url.indexOf('/reset-password') &&
      !this._router.url.startsWith('/new-account')
    )
      if (localStorage['ResponseServer']) this.initCheckStatusToken();
      else this._router.navigateByUrl('sign-in');
  }

  decodeToken(): TokenModel {
    if (localStorage['ResponseServer']) {
      const { Token, RefreshToken, Opciones } = JSON.parse(localStorage['ResponseServer']);
      if (Token && RefreshToken) {
        const decodetoken: any = JWTDecode(Token);
        const Actions: Array<ActionsModel> = Opciones;
        return {
          User: decodetoken,
          Actions: Actions,
        };
      }
    }
    return null;
  }
  checkStatusToken() {
    if (localStorage['ResponseServer']) {
      const { Token } = JSON.parse(localStorage['ResponseServer']);
      if (Token) {
        const Status = this.statusToken();
        if (Status === 'Expirado' || Status == null) {
          //open modal para loguearse
          if (location.pathname.indexOf('sign-in') == -1 && location.pathname != '/') this.reLogin();
        } else if (Status === 'Refresh') this.refreshToken();
      } else {
        //salir del sistema a login
        this.cleanLocalStorage(true);
      }
    }
  }
  initCheckStatusToken() {
    const decodeToken = this.decodeToken();
    if (decodeToken) {
      const expToken = moment(new Date(decodeToken.User.exp * 1000)),
        now = moment(new Date(Date.now())),
        seconds = expToken.diff(now, 'seconds');

      console.log('%c Expiracion de Token ' + expToken.format('HH:mm:ss'), 'background: #222; color: red');
      //si ya vencio o 5 segundos antes que venza se manda llamar a aque el usuario vuelva a loguearse
      this.ProcessId = setTimeout(() => {
        console.table({ 'Token Expirado': expToken.format('HH:mm:ss'), Ejecucion: moment().format('HH:mm:ss') });
        this.reLogin();
      }, 1000 * seconds);
    }
  }
  statusToken(): 'Vigente' | 'Refresh' | 'Expirado' {
    const TokenModel: TokenModel = this.decodeToken();
    if (!isNull(TokenModel)) {
      const dateToken = moment(new Date(TokenModel.User.exp * 1000)),
        now = moment(new Date(Date.now())),
        expiration = dateToken.diff(now, 'seconds');
      if (expiration <= 0) return 'Expirado';
      else return 'Vigente';
    } else return 'Expirado';
  }

  reLogin() {
    try {
      //Si no hay modal activa se reactiva para pedir las credenciales
      if (document.getElementById('Relogin')) return 0;
      const add = this._matDialog.open(ReloginComponent, {
        disableClose: true,
        width: '300px',
        data: { Usuario: this.decodeToken().User },
      });
      add.afterClosed().subscribe((response: any) => {
        if (response) {
          this.setToken(response);
          this.initCheckStatusToken();
        } else {
          this.cleanLocalStorage(false);
          this._router.navigateByUrl('sign-in');
        }
      });
    } catch (error) {}
  }
  refreshToken() {
    const relativeUrl = globalConst.urlApi + 'Login' + '/' + 'RefreshToken';
    const data = this.decodeToken().User;
    const Usuario = {
      Usuario: data?.IdUsuario,
      IdUsuario: data?.IdUsuario,
      IdHospital: data?.IdEmpresa,
      IdEmpresa: data?.IdEmpresa,
      Empresa: data?.Empresa,
      InicialesEmpresa: data?.InicialesEmpresa,
    };
    this._httpClient.post(relativeUrl, Usuario).subscribe({
      next: (data: any) => {
        this.setToken(data);
      },
      error: (err) => {
        console.log('Refresh_Token Error: ', err.error?.Error);
        this.cleanLocalStorage(true);
      },
    });
  }
  LogOut() {
    const relativeUrl = globalConst.urlApi + 'Login' + '/' + 'Logout';
    const { Token } = JSON.parse(localStorage['ResponseServer']);
    this._httpClient.post(relativeUrl, { Token: Token }).subscribe({
      next: (data: any) => {},
      error: (err) => {
        console.log('Logout Error: ', err.error?.Error);
      },
    });
  }

  setToken(responseToken: any): void {
    const { Token, RefreshToken } = responseToken;
    let ResponseServer = JSON.parse(localStorage['ResponseServer']);
    ResponseServer.Token = Token;
    ResponseServer.RefreshToken = RefreshToken;
    localStorage['ResponseServer'] = JSON.stringify(ResponseServer);
  }

  cleanLocalStorage(redirect: boolean = false): void {
    // Set
    try {
      this.LogOut();
    } catch (error) {}
    localStorage.removeItem('ResponseServer');
    if (redirect) this._router.navigateByUrl('sign-in');
  }

  // Set Store User Info
  SETStore_User(User: any): void {
    this.UserStore.dispatch(new Userinfo.SETDataUser(User));
  }

  // Set Store UserActions
  SETStore_UserActions(Actions: Array<ActionsModel>): void {
    this.UserActionsStore.dispatch(new DataUser.SETUserActions(Actions));
  }
}
