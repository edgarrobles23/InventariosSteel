/* eslint-disable @angular-eslint/no-output-rename */
/* eslint-disable @angular-eslint/no-input-rename */
/* eslint-disable curly */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable @typescript-eslint/naming-convention */
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ControlValueAccessor, FormBuilder, FormControl, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';
import { GeneralService } from 'app/services/general.service';
import { HttpService } from 'app/services/http.service';
import { isNull, isUndefined } from 'lodash';

@Component({
  selector: 'lookup',
  templateUrl: './lookup.component.html',
  styleUrls: ['./lookup.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: LookupComponent,
    },
  ],
})
export class LookupComponent implements OnInit, ControlValueAccessor {
  constructor(
    private _httpService: HttpService,
    private _formBuilder: FormBuilder,
    private _notify: GeneralService.Notify
  ) {}
  @Input('labelId') labelId: string;
  @Input('labelDesc') labelDesc: string = 'Descripción';
  @Input('controller') controller: string;
  @Input('method') method: string;
  @Input('type') type: string = 'GET';
  @Input('hideDesc') hideDesc: boolean = false;
  @Input('withFormField') withFormField: boolean = true;
  @Input('nextCtrl') nextCtrl: string;
  @Input('idNextControl') idNextControl: string;
  @Output('outputData') outputData: EventEmitter<any> = new EventEmitter<any>();

  formLookup: FormGroup = this._formBuilder.group({
    Id: new FormControl(null),
    Descripcion: new FormControl({
      value: null,
      disabled: true,
    }),
  });

  writeValue(obj: any): void {
    console.log(obj);
    this.formLookup.patchValue({
      Id: obj,
      Descripcion: null,
    });
    // this.get();
  }
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    // throw new Error('Method not implemented.');
  }
  setDisabledState?(isDisabled: boolean): void {
    throw new Error('Method not implemented.');
  }

  ngOnInit(): void {}
  onChange = (id: string) => {};

  keydown(evt: KeyboardEvent) {
    if (evt.key === 'Backspace') {
      this.formLookup.patchValue({
        Descripcion: null,
      });
      this.onChange(null);
    } else if (evt.key === 'Enter') {
      this.get();
    }
  }

  get() {
    const id: string = this.formLookup.get('Id').value;
    if (isNull(id) || isUndefined(id)) {
      this._notify.Warning('Ingresar un ID');
      return;
    }
    if (
      (isNull(this.controller) || isUndefined(this.controller)) &&
      (isNull(this.method) || isUndefined(this.method))
    ) {
      this._notify.Error('El lookup no está configurado correctamente');
      return;
    }
    if (this.type.toLocaleUpperCase() === 'POST')
      this._httpService
        .postFromBody(this.controller, this.method, {
          Id: id,
        })
        .subscribe({
          next: (res: Array<any>) => {
            if (res.length === 0) {
              this._notify.Warning('No se encontraron datos del ID: ' + id);
              this.onChange(null);
              return;
            }
            this.formLookup.patchValue({
              Descripcion: res[0].Descripcion,
            });
            this.onChange(res[0].Id);
            this.outputData.next(res);
          },
        });
    else
      this._httpService
        .getFromQuery(this.controller, this.method, {
          ID: id,
        })
        .subscribe({
          next: (res: Array<any>) => {
            if (res.length === 0) {
              this._notify.Warning('No se encontraron datos del ID: ' + id);
              this.onChange(null);
              return;
            }
            this.formLookup.patchValue({
              Descripcion: res[0].Descripcion,
            });
            this.onChange(res[0].Id);
            this.outputData.next(res);
          },
        });
  }
}
