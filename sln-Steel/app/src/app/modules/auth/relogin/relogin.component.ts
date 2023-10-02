/* eslint-disable quotes */
/* eslint-disable @typescript-eslint/quotes */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/naming-convention */
import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { globalConst } from 'app/app.config';
import { SystemService } from 'app/services/system.service';
import { WebhookService } from 'app/services/webhook.service';

@Component({
  selector: 'app-relogin',
  templateUrl: './relogin.component.html',
  styleUrls: ['./relogin.component.scss'],
})
export class ReloginComponent implements OnInit {
  isLoading: boolean = false;
  public Usuario: any = { Usuario: null, Password: null, IdHospital: null };
  constructor(
    public _matDialogRef: MatDialogRef<ReloginComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _loading: SystemService.Loading,
    private _httpClient: HttpClient,
    private _notify: SystemService.Notify,
    private _wh: WebhookService
  ) {
    this.Usuario.Usuario = data?.Usuario.Usuario;
    this.Usuario.IdHospital = data?.Usuario.IdEmpresa;
    this.Usuario.IdEmpresa = data?.Usuario.IdEmpresa;
    this.Usuario.Empresa = data?.Usuario.Empresa;
    this.Usuario.InicialesEmpresa = data?.Usuario.InicialesEmpresa;
  }

  ngOnInit(): void {}
  cancelar() {
    this._matDialogRef.close();
  }
  relogin() {
    try {
      this._loading.show('Actualizando tus credenciales');
      const relativeUrl = globalConst.urlApi + 'Login' + '/' + 'SignIn';
      this._httpClient.post(relativeUrl, this.Usuario).subscribe({
        next: async (dataUser: any) => {
          // Fill Form
          this._notify.notifySuccess('Credenciales actualizadas.');
          this._matDialogRef.close(dataUser);
          this._loading.stop();

          //webhook
          //   await this._wh.init();
          //   this._wh.initBosadcast();
          //   await this._wh.start();
        },
        error: (err) => {
          this._notify.notifyError(err.error.Error || err.message);
          this._loading.stop();
        },
      });
    } catch (error) {
      this._loading.stop();
    }
  }
}
