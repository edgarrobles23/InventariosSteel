/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/member-ordering */
import { Component, OnInit } from '@angular/core';
import { FuseConfigService } from '@fuse/services/config';
import { Scheme } from 'app/core/config/app.config';
import { PerfilUsuarioService } from 'app/modules/perfil-usuario/perfil-usuario.service';
import { SystemService } from 'app/services/system.service';
import { isNull, isUndefined } from 'lodash';
import { ModoOscuroService } from './modo-oscuro.service';

@Component({
    selector: 'modo-oscuro',
    templateUrl: './modo-oscuro.component.html',
    styleUrls: ['./modo-oscuro.component.scss'],
})
export class ModoOscuroComponent implements OnInit {
    constructor(
        private _fuseConfigService: FuseConfigService,
        private _modoOscuroService: ModoOscuroService,
        private _notifyService: SystemService.Notify,
        private _perfilUsuario: PerfilUsuarioService
    ) {}

    ngOnInit(): void {
        if (isNull(this.esquemaActual) || isUndefined(this.esquemaActual)) {
            this.configurarEsquema('light');
        } else {
            this.configurarEsquema(this.esquemaActual);
        }
    }

    get esquemaActual(): Scheme {
        if(localStorage['ResponseServer'])
        {const esquema = JSON.parse(localStorage['ResponseServer'])?.Esquema as Scheme;
        return esquema;
    }
    }
    configurarEsquema(scheme: Scheme) {
        this._modoOscuroService.configurarEsquema(scheme);
    }

    configurarEsquemaBD(scheme: Scheme) {
        this._modoOscuroService.configurarEsquemaBD(scheme).subscribe({
            next: (res) => {
                this._notifyService.notifySuccess('Configuración guardada');
                this._modoOscuroService.configurarEsquema(scheme);
                this._perfilUsuario.emmiter({scheme:scheme},
                    'UpdateProfile');
            },
            error: (err) => {},
        });
    }
}
