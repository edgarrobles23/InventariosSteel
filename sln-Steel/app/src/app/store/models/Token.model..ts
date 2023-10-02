/* eslint-disable @typescript-eslint/naming-convention */
import { ActionsModel } from './Actions.model';

export interface TokenModel {
  Actions: Array<ActionsModel>;
  User: UserModel;
}

export interface UserModel {
  ApellidoPaterno: string;
  Email: string;
  Empresa: string;
  IdEmpresa: string;
  IdHospital: string;
  IdUsuario: string;
  InicialesEmpresa: string;
  Role: Array<any>;
  Nombre: string;
  Usuario: string;
  FotoPerfil: string;
  aud: string;
  exp: number;
  idArea: string;
  iss: string;
  jti: string;
  nbf: number;
}
