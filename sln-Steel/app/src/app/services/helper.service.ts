/* eslint-disable prefer-arrow/prefer-arrow-functions */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable arrow-parens */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable curly */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AbstractControl, FormGroup, ValidationErrors } from '@angular/forms';
import { ModoOscuroService } from 'app/components/modo-oscuro/modo-oscuro.service';
import { isNull, isUndefined, orderBy } from 'lodash';
import { SystemService } from './system.service';

@Injectable({
  providedIn: 'root',
})
export class HelperService {
  constructor(private _notifyService: SystemService.Notify, private _modoOscuro: ModoOscuroService) {}
  get meses() {
    const mesesValidos: Array<{ numero: number; letra: string }> = [
      {
        letra: 'Enero',
        numero: 1,
      },
      {
        letra: 'Febrero',
        numero: 2,
      },
      {
        letra: 'Marzo',
        numero: 3,
      },
      {
        letra: 'Abril',
        numero: 4,
      },
      {
        letra: 'Mayo',
        numero: 5,
      },
      {
        letra: 'Junio',
        numero: 6,
      },
      {
        letra: 'Julio',
        numero: 7,
      },
      {
        letra: 'Agosto',
        numero: 8,
      },
      {
        letra: 'Septiembre',
        numero: 9,
      },
      {
        letra: 'Octubre',
        numero: 10,
      },
      {
        letra: 'Noviembre',
        numero: 11,
      },
      {
        letra: 'Diciembre',
        numero: 12,
      },
    ];
    return mesesValidos;
  }
  /**
   * @description Valida si alguno de los controles del FormGroup contiene errores
   * @param form FormGroup a validar
   * @param controlToValidate Nombre del control a validar
   * @param error Tipo de error a validar
   * @returns true si contiene errores, de lo contrario false
   */
  formControlHasError(form: FormGroup, controlToValidate: string, error?: string): boolean {
    const control = form.get(controlToValidate);
    if (control.touched) {
      if (isNull(error) || isUndefined(error)) {
        return Object.keys(control.errors || {}).length > 0;
      } else {
        return control.hasError(error);
      }
    }
    return false;
  }
  getFormValidationErrors(controls: FormGroupControls): any[] {
    let errors: any[] = [];
    Object.keys(controls).forEach((key) => {
      const control = controls[key];
      if (control instanceof FormGroup) {
        errors = errors.concat(this.getFormValidationErrors(control.controls));
      }
      const controlErrors: ValidationErrors = controls[key].errors;
      if (controlErrors !== null) {
        Object.keys(controlErrors).forEach((keyError) => {
          errors.push({
            control_name: key,
            error_name: getError({ control_name: key, error_name: keyError, error_value: controlErrors[keyError] }),
            error_value: controlErrors[keyError],
          });
        });
      }
    });

    function getError(error) {
      let text = '';
      switch (error.error_name) {
        case 'required':
          text = `${error.control_name} es requerido!`;
          break;
        case 'pattern':
          text = `${error.control_name} tiene un patron incorrecto!`;
          break;
        case 'email':
          text = `${error.control_name}  formato de email no valido!`;
          break;
        case 'minlength':
          text = `${error.control_name} minimo: ${error.error_value.requiredLength} caracteres`;
          break;
        case 'areEqual':
          text = `${error.control_name} no son iguales!`;
          break;
        default:
          text = `${error.control_name}: ${error.error_name}: ${error.error_value}`;
      }
      return text;
    }

    return errors;
  }

  getErrorInDontrol(objError: any) {
    if (objError.required) return 'Campo requerido';

    if (objError.minlength) return 'Debes escribir minimo ' + objError.minlength.requiredLength + ' caracteres';
  }

  numeroConComas(numero: number, simbolo?: string) {
    if (numero === null || numero === undefined) return;
    const nuevoNumero = numero.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ',');
    return `${simbolo ?? ''}${nuevoNumero}`;
  }

  isValidForm(form: any, showNotify: boolean = false) {
    const controls = form.controls;
    const keys = Object.keys(controls);
    let formisvalid = true;
    keys.forEach((key) => {
      const _control = controls[key];
      if (_control['status'] === 'INVALID') {
        const _errors = _control['errors'];
        if (_errors) {
          formisvalid = false;
          _control['touched'] = true;
          if (_errors['required']) {
            showNotify && this._notifyService.notifyError(`${key} es requerido.`);
          }
          if (_errors['max']) {
            const limiteMax = _errors['max'].max;
            showNotify && this._notifyService.notifyError(`${key} es no debe ser mayor a ${limiteMax}.`);
          }
          if (_errors['min']) {
            const limiteMin = _errors['min'].min;
            showNotify && this._notifyService.notifyError(`${key} es no debe ser menor a ${limiteMin}.`);
          }
        }
      }
    });
    return formisvalid;
  }

  /**
   * @description Valida si el FormGroup contiene errores
   * @param form FormGroup a validar
   * @returns true si al menos uno de los FormControl del formulario contiene errores, de lo contrario false
   */
  formHasError(form: FormGroup): boolean {
    const controls = Object.values(form.controls);
    return controls.some((x) => Object.values(x.errors || {})?.length > 0);
  }

  /**
   * @description Verifica si el objeto HttpErrorResponse contiene el objeto error mandado del Back End
   * @param error Objeto de error de la respuesta a la petición HTTP
   */
  contieneErrorBackEnd(error: HttpErrorResponse) {
    return Object.keys(error.error || {}).some((x) => x === 'error');
  }

  getBase64(file: File): Promise<string | ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
  getInfoImage(file: File): Promise<any | ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.src = reader.result.toString();
        img.onload = () => {
          const info = {
            width: img.width,
            height: img.height,
            base64: reader.result,
            name: file.name,
            size: file.size,
          };
          resolve(info);
        };
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  seleccionarInputTabla(idTabla: HTMLElement, indexCelda: number, scrollAInput: boolean = false) {
    const filaSeleccionada = Array.from(idTabla.getElementsByTagName('tr'))?.find((x) =>
      x.classList.contains('seleccionado')
    );
    if (filaSeleccionada) {
      const celdas = Array.from(filaSeleccionada.cells);
      const celda = Array.from(celdas[indexCelda]?.children);
      const input = celda.find((x) => x.localName.toLowerCase() === 'input');
      if (input instanceof HTMLInputElement) {
        input.select();
        if (scrollAInput) {
          input.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
          });
        }
      }
    }
  }

  navegarEnTabla(idTabla: HTMLElement) {
    const rowsTabla = Array.from(idTabla.getElementsByTagName('tr'));
    rowsTabla
      .find((x) => x.classList.contains('seleccionado'))
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  dataURLtoFile(dataurl: string, filename: string): File {
    //data:text/plain;base64,
    const arr = dataurl; //.split(','),
    const mime = 'data:text/plain;base64'; // arr[0].match(/:(.*?);/)[1],
    const bstr = atob(arr);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  }

  mesesEnLetra(meses: Array<number>) {
    const mesesEnLetra: Array<{ numero: number; letra: string }> = [];
    const mesesValidos: Array<{ numero: number; letra: string }> = [
      {
        letra: 'Enero',
        numero: 1,
      },
      {
        letra: 'Febrero',
        numero: 2,
      },
      {
        letra: 'Marzo',
        numero: 3,
      },
      {
        letra: 'Abril',
        numero: 4,
      },
      {
        letra: 'Mayo',
        numero: 5,
      },
      {
        letra: 'Junio',
        numero: 6,
      },
      {
        letra: 'Julio',
        numero: 7,
      },
      {
        letra: 'Agosto',
        numero: 8,
      },
      {
        letra: 'Septiembre',
        numero: 9,
      },
      {
        letra: 'Octubre',
        numero: 10,
      },
      {
        letra: 'Noviembre',
        numero: 11,
      },
      {
        letra: 'Diciembre',
        numero: 12,
      },
    ];
    orderBy(meses).forEach((mes) => {
      const mesValido = mesesValidos.find((x) => x.numero === mes);
      if (mesValido) {
        mesesEnLetra.push(mesValido);
      }
    });
    return mesesEnLetra;
  }

  colorHospital(hospital: string | number, conOpacidad: boolean = false): string {
    switch (hospital) {
      case 1:
      case 'OCA Hospital':
      case '1':
        return conOpacidad ? '#f483221a' : '#f48322';
      case 2:
      case '2':
      case 'Doctors Hospital':
        return conOpacidad ? '#00195f1a' : '#00195f';
      case 7:
      case '7':
      case 'Doctors Hospital East':
        return conOpacidad ? '#008ffb1a' : '#008ffb';
      case 8:
      case '8':
      case 'Doctors Hospital East':
        return conOpacidad ? '#008ffb1a' : '#008ffb';
      default:
        return conOpacidad ? '#008ffb1a' : '#008ffb';
    }
  }
}

export interface FormGroupControls {
  [key: string]: AbstractControl;
}
