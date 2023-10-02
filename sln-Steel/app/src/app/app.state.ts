import { ActionsModel } from './store/models/Actions.model';
import { DataUserModel } from './store/models/DataUser.model';

export interface UserState {
    readonly DataUser: DataUserModel;
}

export interface UserActionsState {
    readonly UserActions: ActionsModel;
}
