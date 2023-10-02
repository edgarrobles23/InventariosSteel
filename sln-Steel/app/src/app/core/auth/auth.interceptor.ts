/* eslint-disable arrow-body-style */
/* eslint-disable quotes */
/* eslint-disable @typescript-eslint/quotes */
/* eslint-disable curly */
/* eslint-disable @typescript-eslint/naming-convention */
import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { EMPTY, Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from 'app/services/auth.service';
import { Router } from '@angular/router';
import { TokenService } from 'app/services/token.service';
import { globalConst } from 'app/app.config';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private _authService: AuthService, private _router: Router,private _tokenService: TokenService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Clone the request object
    let newReq = req.clone();

    // Request
    //
    // If the access token didn't expire, add the Authorization header.
    // We won't add the Authorization header if the access token expired.
    // This will force the server to return a "401 Unauthorized" response
    // for the protected API routes which our response interceptor will
    // catch and delete the access token from the local storage while logging
    // the user out from the app.
    if (
      !this._router.url.startsWith('/sign-in') &&
      !this._router.url.startsWith('/forgot-password') &&
      !this._router.url.startsWith('/reset-password') &&
      !this._router.url.startsWith('/new-account')
    )
      if( req.url.indexOf('ValidateTokenRecovery')>-1)
      {
        //no se valida y continua
      }
      else
      if (this._authService?.token) {
          const Status=this._tokenService.statusToken();
          if(Status==="Expirado" && req.url.indexOf(globalConst.urlApi)!==-1 && req.url.indexOf('api/Login/SignIn')===-1 && req.url.indexOf('api/Login/Logout')===-1)
          {
              this._tokenService.reLogin();
              return EMPTY;
         }

        newReq = req.clone({
          headers: req.headers
            .set('Authorization', 'Bearer ' + this._authService.token)
            .set('RefreshToken', this._authService.refreshtoken),
        });
      }


    // Response
    return next.handle(newReq).pipe(
      catchError((error) => {
        return throwError(error);
      })
    );
  }
}
