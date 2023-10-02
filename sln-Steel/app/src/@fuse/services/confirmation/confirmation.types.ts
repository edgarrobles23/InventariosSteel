/* eslint-disable @typescript-eslint/naming-convention */
export interface FuseConfirmationConfig extends BaseModel {
  title?: string;
  message?: string;
  autorization?: boolean;
  InputfileName?: boolean;
  FileName?: string;
  Extension?: string;
  icon?: {
    show?: boolean;
    name?: string;
    color?: 'primary' | 'accent' | 'warn' | 'basic' | 'info' | 'success' | 'warning' | 'error';
  };
  actions?: {
    confirm?: {
      show?: boolean;
      label?: string;
      color?: 'primary' | 'accent' | 'warn';
    };
    cancel?: {
      show?: boolean;
      label?: string;
    };
  };
  dismissible?: boolean;
}

export interface BaseModel {
  Activo?: boolean;
}
