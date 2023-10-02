import { Action } from '@ngrx/store';
export const setUrl = 'Set url';

export class SetUrl implements Action {
    readonly type: string = setUrl;
    /**
     *
     */
    constructor(public payload: string) {}
}

export type Actions = SetUrl;

export class RemoveUrl implements Action {
    readonly type: string = 'Remove url';
    /**
     *
     */
    constructor(public payload: string) {}
}

export type RemoveAction = RemoveUrl;
