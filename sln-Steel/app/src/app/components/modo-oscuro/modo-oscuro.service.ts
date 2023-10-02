/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/member-ordering */
import { Injectable } from '@angular/core';
import { FuseConfigService } from '@fuse/services/config';
import { Scheme } from 'app/core/config/app.config';
import { PerfilUsuarioService } from 'app/modules/perfil-usuario/perfil-usuario.service';
import { SystemService } from 'app/services/system.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ModoOscuroService {
    constructor(
        private _fuseConfigService: FuseConfigService,
        private _perfilUsuarioService: PerfilUsuarioService,
        private _notify: SystemService.Notify
    ) {}

    get esquemaActual(): Scheme {
        const esquema = JSON.parse(localStorage['ResponseServer'])?.Esquema as Scheme;
        return esquema || 'light';
    }

    esquemaActual$: BehaviorSubject<Scheme> = new BehaviorSubject<Scheme>(
        'light'
    );

    configurarEsquema(scheme: Scheme) {
        if(localStorage['ResponseServer'])
        {
            let ResponseServer=JSON.parse(localStorage['ResponseServer']);
            ResponseServer.Esquema=scheme;
            localStorage.setItem('ResponseServer', JSON.stringify(ResponseServer));
            this._fuseConfigService.config = { scheme };
            this.esquemaActual$.next(scheme);
    }
    }

    configurarEsquemaBD(scheme: Scheme) {
        return this._perfilUsuarioService.modificarModoOscuro(scheme);
    }
}
