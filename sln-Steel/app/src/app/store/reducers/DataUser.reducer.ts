import { DataUserModel } from '../models/DataUser.model';
import * as DataUser from '../actions/DataUser.actions';

export function DataUserReducer(state: DataUserModel, action: DataUser.Actions) {
  switch (action.type) {
    case DataUser.SET_DATAUSER:
      return action.payload;

    default:
      return state;
  }
}
