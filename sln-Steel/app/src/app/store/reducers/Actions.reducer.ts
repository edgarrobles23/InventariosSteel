import { ActionsModel } from "../models/Actions.model";
import * as User from "../actions/Actions.actions";

export function ActionsReducer(
    state: Array<ActionsModel>,
    action: User.Actions
) {
    switch (action.type) {
        case User.SET_USERACTIONS:
            return action.payload;

        default:
            return state;
    }
}
