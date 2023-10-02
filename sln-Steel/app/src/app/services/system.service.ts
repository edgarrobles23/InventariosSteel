/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/prefer-namespace-keyword */
import { Injectable } from '@angular/core';
import { NotifierService } from 'angular-notifier';
import { BlockUI, NgBlockUI } from 'ng-block-ui';

export module SystemService {
  @Injectable({
    providedIn: 'any',
  })
  export class Notify {
    constructor(private _notifier: NotifierService) {}
    /**
     * Muestra una notificación
     * @param type Tipo de notificación a mostrar
     * @param message Mensaje que se mostrará en la notificación
     */
    notify(type: 'default' | 'info' | 'success' | 'warning' | 'error', message: string) {
      this._notifier.show({
        type: type,
        message: message,
      });
    }

    /**
     * Muestra una notificación con el tipo default
     * @param message Mensaje que se mostrará en la notificación
     */
    notifyDefault(message: string) {
      this._notifier.notify('default', message);
    }

    /**
     * Muestra una notificación con el tipo info
     * @param message Mensaje que se mostrará en la notificación
     */
    notifyInfo(message: string) {
      this._notifier.notify('info', message);
    }

    /**
     * Muestra una notificación con el tipo success
     * @param message Mensaje que se mostrará en la notificación
     */
    notifySuccess(message: string) {
      this._notifier.notify('success', message);
    }

    /**
     * Muestra una notificación con el tipo warning
     * @param message Mensaje que se mostrará en la notificación
     */
    notifyWarning(message: string) {
      this._notifier.notify('warning', message);
    }

    /**
     * Muestra una notificación con el tipo error
     * @param message Mensaje que se mostrará en la notificación
     */
    notifyError(message) {
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
     * Muestra una pantalla de carga con un mensaje
     * @param message Mensaje a mostrar en la pantalla de carga
     */
    show(message?: string) {
      this.blockUI.start(message);
    }

    /**
     * Oculta la pantalla de carga activa
     */
    stop() {
      this.blockUI.stop();
    }
  }

  @Injectable({
    providedIn: 'any',
  })
  export class Style {
    constructor() {}
    get(IdEstatus: number) {
      let cssClass: string = '';
      switch (IdEstatus) {
        case 1:
        case 2:
          cssClass = 'bg-blue-300 text-blue-800 dark:bg-blue-600 dark:text-blue-50';
          break;
        case 3:
          cssClass = 'bg-green-200 text-green-800 dark:bg-green-600 dark:text-green-50';
          break;
        case 4:
          cssClass = 'bg-blue-200 text-blue-800 dark:bg-blue-600 dark:text-blue-50';
          break;
        case 5:
          cssClass = 'bg-green-200 text-green-800 dark:bg-green-600 dark:text-green-50';
          break;
        case 7:
        case 9:
        case 0:
          cssClass = 'bg-red-200 text-red-800 dark:bg-red-600 dark:text-red-50';
          break;
        default:
          cssClass = 'bg-blue-300 text-blue-800 dark:bg-blue-600 dark:text-blue-50';
          break;
      }
      return cssClass;
    }

    getTipoDocumento(IdTipoDocumento: number) {
      let cssClass: string = '';
      switch (IdTipoDocumento) {
        case 1:
        case 6:
          cssClass = 'bg-blue-300 text-blue-800 dark:bg-blue-600 dark:text-blue-50';
          break;
        case 2:
        case 7:
          cssClass = 'bg-green-200 text-green-800 dark:bg-green-600 dark:text-green-50';
          break;
        case 3:
        case 8:
          cssClass = 'bg-blue-200 text-blue-800 dark:bg-blue-600 dark:text-blue-50';
          break;
        case 4:
        case 9:
          cssClass = 'bg-green-200 text-green-800 dark:bg-green-600 dark:text-green-50';
          break;
        case 5:
        case 10:
          cssClass = 'bg-red-200 text-red-800 dark:bg-red-600 dark:text-red-50';
          break;
        default:
          cssClass = 'bg-blue-300 text-blue-800 dark:bg-blue-600 dark:text-blue-50';
          break;
      }
      return cssClass;
    }
  }
}
