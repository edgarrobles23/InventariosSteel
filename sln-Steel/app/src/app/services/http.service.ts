/* eslint-disable prefer-const */
/* eslint-disable curly */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable arrow-parens */
/* eslint-disable @typescript-eslint/naming-convention */
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { globalConst } from 'app/app.config';
import { TokenService } from './token.service';
import { TokenModel } from 'app/store/models/Token.model.';
import { ActionsModel } from 'app/store/models/Actions.model';
import jwtDecode from 'jwt-decode';
import _ from 'lodash';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  private User: any;
  constructor(private _httpClient: HttpClient) {
    this.User = this.decodeToken()?.User;
  }
  decodeToken(): TokenModel {
    if (localStorage['ResponseServer']) {
      const { Token, RefreshToken, Opciones } = JSON.parse(localStorage['ResponseServer']);
      if (Token && RefreshToken) {
        const decodetoken: any = jwtDecode(Token);
        const Actions: Array<ActionsModel> = Opciones;
        return {
          User: decodetoken,
          Actions: Actions,
        };
      }
    }
    return null;
  }

  /**
   * Consulta el susuario que esta loggeado para mandarlo como parametro adicional
   */
  private getParamsAditional(queryParamsIn: any): any {
    let queryParams = _.clone(queryParamsIn);
    this.User = this.decodeToken()?.User;
    const user = queryParams.IdUsuario !== undefined ? queryParams.IdUsuario : this.User?.IdUsuario || null;
    const idempresa = queryParams.IdEmpresa !== undefined ? queryParams.IdEmpresa : this.User?.IdEmpresa || null;

    if (user) Object.assign(queryParams || {}, { IdUsuario: user });
    if (idempresa) Object.assign(queryParams || {}, { IdEmpresa: idempresa });

    return this.toString(queryParams);
  }

  toString(o: any) {
    Object.keys(o).forEach((k) => {
      if (o[k] == null) o[k] = o[k];
      else if (typeof o[k] === 'object') {
        return this.toString(o[k]);
      }

      o[k] = '' + o[k];
    });

    return o;
  }
  /**
   * @description Transforma el objeto en parámetros que serán utilizados en los URL
   * @param queryParams Objeto que contiene los parámetros que serán convertidos en query params para las URL
   */
  private queryParams(queryParams: {}): string {
    return Object.keys(queryParams)
      .map((k) => encodeURIComponent(k) + '=' + encodeURIComponent(queryParams[k]))
      .join('&');
  }
  /**
   * @description Construye una petición GET que devuelve cualquier contenido de la respuesta
   * @param method Define el nombre del método donde se obentrá el recurso
   * @param queryParams Parámetros adicionales para la petición
   */
  getFromQuery<T>(controller: string, method: string, queryParams: {}): Observable<T> {
    let relativeUrl = `${globalConst.urlApi}${controller}/${method}`;
    relativeUrl = relativeUrl + `?${this.queryParams(this.getParamsAditional(queryParams))}`;
    return this._httpClient.get<T>(relativeUrl);
  }
  async getFromQueryAsync<T>(controller: string, method: string, queryParams: {}) {
    let relativeUrl = `${globalConst.urlApi}${controller}/${method}`;
    relativeUrl = relativeUrl + `?${this.queryParams(this.getParamsAditional(queryParams))}`;
    return await this._httpClient.get<T>(relativeUrl).toPromise();
  }
  /**
   * @description Construye una petición GET que devuelve cualquier contenido de la respuesta
   * @param method Define el nombre del método donde se obentrá el recurso
   * @param queryParams Parámetros adicionales para la petición
   */
  get<T>(controller: string, method: string): Observable<T> {
    const relativeUrl = `${globalConst.urlApi}${controller}/${method}`;
    return this._httpClient.get<T>(relativeUrl);
  }

  /**
   * @description Construye una petición POST que puede devolver cualquier contenido de la respuesta
   * @param controller Define el nombre del controlador
   * @param method Define el nombre del método donde se obtendrá el recurso
   * @param data Define el tipo de dato a enviar en la petición
   */
  postFromBody<T>(controller: string, method: string, data: any): Observable<T>;
  postFromBody(controller: string, method: string, data: any) {
    const relativeUrl = globalConst.urlApi + controller + '/' + method;
    return this._httpClient.post(relativeUrl, this.getParamsAditional(data));
  }

  async postFromBodyAsync(controller: string, method: string, data: any) {
    const relativeUrl = globalConst.urlApi + controller + '/' + method;
    return this._httpClient.post(relativeUrl, this.getParamsAditional(data));
  }
  async postFromBodyAsyncPromise<T>(controller: string, method: string, data: any) {
    const relativeUrl = `${globalConst.urlApi}${controller}/${method}`;
    return await this._httpClient.post<T>(relativeUrl, this.getParamsAditional(data)).toPromise();
  }
  /**
   * @description Construye una petición POST que puede devolver cualquier contenido de la respuesta
   * @param controller Define el nombre del controlador
   * @param method Define el nombre del método donde se obtendrá el recurso
   * @param data Define el tipo de dato a enviar en la petición
   */
  post(controller: string, method: string, data: any): any {
    const relativeUrl = globalConst.urlApi + controller + '/' + method;
    const httpParams = new HttpParams({
      fromObject: this.getParamsAditional(data),
    });

    return this._httpClient.post(relativeUrl, this.getParamsAditional(data), {
      params: httpParams,
      observe: 'response',
    });
  }

  postFromBodyOutside<T>(controller: string, method: string, data: any): Observable<T>;
  postFromBodyOutside(controller: string, method: string, data: any) {
    const relativeUrl = globalConst.urlApi + controller + '/' + method;
    return this._httpClient.post(relativeUrl, this.getParamsAditional(data));
  }

  /**
   *
   * @param controller Define el nombre del controlador
   * @param method Define el nombre del método donde se obtendrá el recurso
   * @param data Define el tipo de dato a enviar en la petición
   */
  putFromBody(controller: string, method: string, data: any) {
    const relativeUrl = globalConst.urlApi + controller + '/' + method;
    return this._httpClient.put(relativeUrl, this.getParamsAditional(data));
  }

  /**
   * @description Handle Http operation that failed.
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  public handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // TODO: better job of transforming error for user consumption

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }
}
