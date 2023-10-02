/* eslint-disable @typescript-eslint/naming-convention */
import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { isNull } from 'lodash';
import { SystemService } from 'app/services/system.service';
import { catchError } from 'rxjs/operators';
import { AuthService } from 'app/services/auth.service';

@Injectable()
export class HttpRequestInterceptor implements HttpInterceptor {
  constructor(private _router: Router, private _auth: AuthService, private _loading: SystemService.Loading) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let req;
    if (
      !this._router.url.startsWith('/sign-in') &&
      !this._router.url.startsWith('/forgot-password') &&
      !this._router.url.startsWith('/reset-password') &&
      !this._router.url.startsWith('/new-account')
    ) {
      if (!isNull(this._auth.token) && !isNull(this._auth.refreshToken)) {
        req = request.clone({
          headers: req.headers
            .set('Authorization', 'Bearer ' + this._auth.token)
            .set('RefreshToken', this._auth.refreshtoken),
        });
      } 
    }
    return next.handle(req || request).pipe(
      catchError((err: HttpErrorResponse) => { 
        this._loading.stop();
        return throwError(err);
      })
    );
  }
}
