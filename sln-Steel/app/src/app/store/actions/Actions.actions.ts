/* eslint-disable quotes */
// eslint-disable-next-line quotes
import { Action } from '@ngrx/store';
import { ActionsModel } from '../models/Actions.model';

export const SET_USERACTIONS = 'Set User Actions';

export class SETUserActions implements Action {
    readonly type = SET_USERACTIONS;
    constructor(public payload: Array<ActionsModel>) {}
}

export type Actions = SETUserActions;
