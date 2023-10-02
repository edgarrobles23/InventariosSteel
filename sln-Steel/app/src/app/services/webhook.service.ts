/* eslint-disable quotes */
/* eslint-disable arrow-body-style */
/* eslint-disable no-debugger */
/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/naming-convention */
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { HubConnection, HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';
import { globalConst } from 'app/app.config';
import { TokenService } from 'app/services/token.service';
import { SystemService } from './system.service';

@Injectable({
  providedIn: 'root',
})
export class WebhookService {
  private username: any;
  private connection: HubConnection;
  constructor(private _tokenService: TokenService, private _notify: SystemService.Notify) {}

  private subject$: Subject<any> = new Subject<any>();

  //metodos de Emiter
  emmiter(
    ParamItem: any,
    Type: 'pagoRealizado' | 'connected' | 'disconnected' | 'closed' | 'UpdateProgramaEstudioMedico'
  ) {
    this.subject$.next({ Type: Type, Data: ParamItem });
  }
  listener() {
    return this.subject$.asObservable();
  }
  async init() {
    this.username = this._tokenService.decodeToken().User?.IdUsuario;
    this.connection = new HubConnectionBuilder()
      .withUrl(`${globalConst.urlApi}hub/conektaHub?username=${this.username}`)
      .build();
  }

  async start() {
    try {
      if (this.connection.state === HubConnectionState.Disconnected) {
        await this.connection.start();
        this.connection.on('Connected', (data: any) => {
          this.emmiter(data, 'connected');
        });
      }

      if (this.connection.state === HubConnectionState.Connected) {
        console.log('init Broadcast');
        console.log('SignalR Connected.');
      }
    } catch (error) {
      console.assert(this.connection.state === HubConnectionState.Disconnected);
      console.log(error);
      setTimeout(this.start, 5000);
    }
  }
  initBosadcast() {
    this.connection.on('PaymentRegistrer', (data: any) => {
      console.log('PaymentRegistrer');
      try {
        if (data.detalle[0][0]['idMedico'] == this.username) {
          this._notify.notifyInfo('Se ha realizado un pago.');
          this.emmiter(data, 'pagoRealizado');
        }
      } catch (e) {}
    });

    this.connection.on('UpdateProgramaEstudioMedico', (data: any) => {
      console.log('UpdateProgramaEstudioMedico');
      try {
        if (data[0].idMedico == this.username) {
          this.emmiter(data, 'UpdateProgramaEstudioMedico');
        }
      } catch (e) {}
    });

    this.connection.on('UserRegistrer', (data: any) => {
      console.log(data);
      this.emmiter(data, 'connected');
    });

    this.connection.on('Disconnected', (data: any) => {
      this.emmiter(data, 'disconnected');
    });
    this.connection.onclose(async () => {
      console.log(`Connection close`);
      this.emmiter({}, 'closed');
      await this.connection.start();
    });
    this.connection.onreconnecting((error: any) => {
      console.assert(this.connection.state === HubConnectionState.Reconnecting);
      console.log(`Connection lost due to error "${error}". Reconnecting.`);
    });
  }
  exit() {
    try {
      this.connection.stop().then(() => {
        console.log(`Connection close`);
      });
    } catch (error) {}
  }
}
