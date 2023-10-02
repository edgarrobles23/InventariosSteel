export interface ActionsModel {
    IdOpcion: number;
    Opcion: string;
    IdMenuSuperior: number;
    Estatus: string;
    Permisos: {
        Insertar: boolean;
        Borrar: boolean;
        Modificar: boolean;
        Imprimir: boolean;
    };
}
