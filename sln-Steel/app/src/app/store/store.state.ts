import { Usuario } from './models/store.user.model';

export interface UsuarioState {
    readonly user: Usuario;
}

export interface UrlState {
    readonly url: string;
}
