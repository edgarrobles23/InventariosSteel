/* eslint-disable quotes */
/* eslint-disable @typescript-eslint/quotes */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/naming-convention */
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { Router } from '@angular/router';
import { PerfilUsuarioService } from 'app/modules/perfil-usuario/perfil-usuario.service';
import { TokenService } from 'app/services/token.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'user',
  templateUrl: './user.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  exportAs: 'user',
})
export class UserComponent implements OnInit, OnDestroy {
  @Input() showAvatar: boolean = true;
  Email: string;
  Nombre: string;
  Empresa: string;
  Avatar: string;

  private _unsubscribeAll: Subject<any> = new Subject<any>();

  constructor(
    private _router: Router,
    private _tokenService: TokenService,
    private _perfilUsuarioService: PerfilUsuarioService,
    private _changeDetectorRef: ChangeDetectorRef
  ) {
    this._perfilUsuarioService.listener().subscribe((resp: any) => {
      if (resp?.Type === 'UpdateAvatar') {
        this.Avatar = resp.Data;
        this._changeDetectorRef.markForCheck();
      }
    });
  }

  /**
   * On init
   */
  ngOnInit(): void {
    try {
      const decodeToken = this._tokenService.decodeToken();
      this.Email = decodeToken.User.Email;
      this.Nombre = decodeToken.User.Nombre;
      this.Empresa = decodeToken.User.InicialesEmpresa;

      this._perfilUsuarioService.getProfile({ IdUsuario: decodeToken.User.IdUsuario }).subscribe({
        next: (respProfile: any) => {
          this.Avatar = respProfile.Image;
          this._changeDetectorRef.markForCheck();
        },
        error: (err) => {
          // Set the alert
        },
      });
    } catch (error) {}
  }
  /**
   * On destroy
   */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  /**
   * Sign out
   */
  signOut(): void {
    this._router.navigate(['/sign-out']);
  }
  goProfile(): void {
    this._router.navigate(['/profile']);
  }
}
