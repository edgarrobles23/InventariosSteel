import { Injectable } from '@angular/core';
import { BaseService } from 'app/services/base.service';
import { HttpService } from 'app/services/http.service';

import * as JSZip from 'jszip';

import { saveAs } from '@progress/kendo-file-saver';
import _ from 'lodash';

@Injectable({
  providedIn: 'root',
})
export class InventarioService extends BaseService<any> {
  controller: string = 'Inventario';
  constructor(public _http: HttpService) {
    super(_http, 'Inventario');
  }
  getInventario(data: any) {
    return this._http.postFromBody(this.controller, 'GetInventario', data).toPromise();
  }
}
