/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/member-ordering */
import { Injectable } from '@angular/core';
import { BaseService } from 'app/services/base.service';
import { HttpService } from 'app/services/http.service';
import { TokenService } from 'app/services/token.service';
import { Usuario } from 'app/store/models/store.user.model';

@Injectable({
  providedIn: 'root',
})
export class PerfilUsuarioService extends BaseService<any> {
  constructor(public _http: HttpService, private _tokenService: TokenService) {
    super(_http, 'Profile');
  }
  private usuario: Usuario;
  private _controller: string = 'Profile';

  modificarImagenPerfil(imagenBase64: string) {
    return this.modificarPerfil({ imagen: imagenBase64 });
  }
  modificarModoOscuro(Modo: string) {
    const { IdUsuario } = this._tokenService.decodeToken().User;
    return this.updateProfile({ Modo: Modo, IdMedico: IdUsuario });
  }
  modificarTema(tema: string) {
    return this.modificarPerfil({ tema: tema });
  }
  public getProfile(data: any) {
    return this._http.postFromBody(this._controller, 'Get', data);
  }
  getDireccionesFiscales(data: any) {
    return this._http.postFromBody(this._controller, 'GetDireccionesFiscales', data);
  }
  addDireccionFiscal(data: any) {
    return this._http.postFromBody(this._controller, 'CreateDireccionFiscal', data);
  }
  getDireccionFiscal(data: any) {
    return this._http.postFromBody(this._controller, 'GetDireccionFiscal', data).toPromise();
  }
  updateDireccionFiscal(data: any) {
    return this._http.postFromBody(this._controller, 'UpdateDireccionFiscal', data);
  }

  updateProfile(data: any) {
    return this._http.postFromBody(this._controller, 'UpdateProfile', data);
  }

  private modificarPerfil(perfil: { imagen?: string; esquema?: string; tema?: string }) {
    return this._http.postFromBody(this._controller, 'ModificarPerfil', {
      IdUsuario: this.usuario.IdUsuario,
      Imagen: perfil?.imagen ?? null,
      Esquema: perfil?.esquema ?? false,
      Tema: perfil?.tema ?? null,
    });
  }
}
