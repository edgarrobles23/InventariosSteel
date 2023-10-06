/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable arrow-parens */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { forkJoin, Observable } from 'rxjs';
import { NavigationService } from 'app/core/navigation/navigation.service';
import { UserService } from 'app/core/user/user.service';
import { HttpService } from './services/http.service';
import { TokenService } from './services/token.service';
import _ from 'lodash';

@Injectable({
  providedIn: 'root',
})
export class InitialDataResolver implements Resolve<any> {
  constructor(private _navigationService: NavigationService, private _userService: UserService) {}
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    // Fork join multiple API endpoint calls to wait all of them to finish
    return forkJoin([this._navigationService.get(), this._userService.get()]);
  }
}

@Injectable({
  providedIn: 'root',
})
export class UserDataResolver implements Resolve<any> {
  constructor(private _tokenService: TokenService) {}
  async resolve(): Promise<any> {
    const data = this._tokenService.decodeToken().User;
    return data;
  }
}

@Injectable({
  providedIn: 'root',
})
export class UserDataResolver2 implements Resolve<any> {
  constructor(private _tokenService: TokenService) {}
  async resolve(): Promise<any> {
    const data = this._tokenService.decodeToken().User;
    return data;
  }
}

@Injectable({
  providedIn: 'root',
})
export class HospitalesDataResolver implements Resolve<any> {
  constructor(private _httpService: HttpService) {}

  async resolve(): Promise<any> {
    const data = await this._httpService.getFromQueryAsync('Catalogo', 'ListHospitales', {});
    return data;
  }
}

@Injectable({
  providedIn: 'root',
})
export class EmpresasUsuarioResolver implements Resolve<any> {
  constructor(private _httpService: HttpService) {}

  async resolve(): Promise<any> {
    const data = await (await this._httpService.postFromBodyAsync('Catalogo', 'EmpresasUsuario', {})).toPromise();
    return data;
  }
}
@Injectable({
  providedIn: 'root',
})
export class PermisosDataResolver implements Resolve<any> {
  constructor(private _httpService: HttpService) {}

  async resolve(route: ActivatedRouteSnapshot): Promise<any> {
    const { IdMenuSuperior } = route.data;
    let data: any = await (
      await this._httpService.postFromBody('Login', 'PermisosRoute', { IdMenuSuperior: IdMenuSuperior })
    ).toPromise();

    let permisos = {};
    _.each(data, (it: any) => {
      permisos[it.Permiso] = true;
    });

    return permisos;
  }
}
