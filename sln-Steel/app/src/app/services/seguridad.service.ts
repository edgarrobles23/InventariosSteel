/* eslint-disable @typescript-eslint/naming-convention */
import { Injectable } from '@angular/core';
import { ActionsModel } from 'app/store/models/Actions.model';
import { TokenService } from './token.service';

@Injectable({
    providedIn: 'root',
})
export class SeguridadService {
    private _actions: any;

    constructor(
        private _tokenService: TokenService
        ) {
        this._actions=this._tokenService.decodeToken().Actions;
    }


    public existeAccion(
        IdOpcion: number,
        Tipo?: 'Insertar' | 'Borrar' | 'Modificar' | 'Imprimir'
    ): boolean {
        const Acciones: Array<ActionsModel> = Array.from(this._actions);
        const Accion = Acciones.find((x: any) => x.IdOpcion === IdOpcion);
        if (Accion?.Estatus === 'H') {
            if (Tipo) {
                return Accion.Permisos[Tipo];
            } else {
                return true;
            }
        }
        return false;
    }
}
