/* eslint-disable curly */
/* eslint-disable arrow-parens */
/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { NotifierService } from 'angular-notifier';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { globalConst } from 'app/app.config';
import { from } from 'rxjs';
import _ from 'lodash';

// eslint-disable-next-line @typescript-eslint/prefer-namespace-keyword
export module GeneralService {
  @Injectable({
    providedIn: 'any',
  })
  export class Notify {
    constructor(private _notifier: NotifierService) {}

    /**
     * @description Muestra una notificación con el tipo default
     * @param message Mensaje que se mostrará en la notificación
     */
    Default(message: string) {
      this._notifier.notify('default', message);
    }

    /**
     * @description Muestra una notificación con el tipo info
     * @param message Mensaje que se mostrará en la notificación
     */
    Info(message: string) {
      this._notifier.notify('info', message);
    }

    /**
     * @description Muestra una notificación con el tipo success
     * @param message Mensaje que se mostrará en la notificación
     */
    Success(message: string) {
      this._notifier.notify('success', message);
    }

    /**
     * @description Muestra una notificación con el tipo warning
     * @param message Mensaje que se mostrará en la notificación
     */
    Warning(message: string) {
      this._notifier.notify('warning', message);
    }

    /**
     * @description Muestra una notificación con el tipo error
     * @param message Mensaje que se mostrará en la notificación
     */
    Error(message) {
      this._notifier.notify('error', message);
    }
  }

  @Injectable({
    providedIn: 'any',
  })
  export class Loading {
    constructor() {}

    @BlockUI() blockUI: NgBlockUI;

    /**
     * Devuelve si está activa una pantalla de carga
     */
    public get isActive(): boolean {
      return this.blockUI.isActive;
    }

    /**
     * @description Muestra una pantalla de carga con un mensaje
     * @param message Mensaje a mostrar en la pantalla de carga
     */
    Show(message?: string) {
      this.blockUI.start(message);
    }

    Stop() {
      this.blockUI.stop();
    }
  }

  @Injectable({
    providedIn: 'any',
  })
  export class InitApp {
    public async initializeUrl() {
      const response = await this.getConfigJSON();
      globalConst.urlApi = response.urlApi + '/api/';
      globalConst.IdAplicacion = response.IdAplicacion;
      globalConst.Production = response.Production;
      if (!response.Production) console.table({ urlApi: globalConst.urlApi, AppName: globalConst.AppName });
    }
    private async getConfigJSON() {
      return from(fetch('./assets/data/config.json').then((response) => response.json()))
        .pipe(map((config) => config))
        .toPromise();
    }
  }
}
