import { Action } from '@ngrx/store';
import { User } from 'app/core/user/user.model';
import { Usuario } from '../models/store.user.model';

export const setUser = 'Set user';

export class SetUser implements Action {
    readonly type: string = setUser;
    /**
     *
     */
    constructor(public payload: Usuario) {}
}

export type Actions = SetUser;

export class RemoveUser implements Action {
    readonly type: string = 'Remove user';
    /**
     *
     */
    constructor(public payload: Usuario) {}
}

export type RemoveAction = RemoveUser;
