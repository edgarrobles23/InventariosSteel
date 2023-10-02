import { Action } from "@ngrx/store";
import { DataUserModel } from "../models/DataUser.model";

export const SET_DATAUSER = "Set datauser";

export class SETDataUser implements Action {
    readonly type = SET_DATAUSER;
    constructor(public payload: DataUserModel) {}
}

export type Actions = SETDataUser;
