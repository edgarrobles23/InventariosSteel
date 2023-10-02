/* eslint-disable @typescript-eslint/naming-convention */
export interface Usuario {
    IdUsuario: number;
    Nombre: string;
    ApellidoPaterno: string;
    Email: string;
    IdPuesto: number;
    IdEmpresa: string;
    IdHospital: string;
    Empresa: string;
    InicialesEmpresa: string;
    FotoPerfil: string;

    /**
     * Id del token
     */
    jti?: string;
    nbf?: number;
    iss?: string;
    aud?: string;
    /**
     * Fecha expiración token
     */
    exp?: number;
}

export interface Empresa {
    idEmpresa: number;
    Empresa: string;
    DescCorta: string;
}
