/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/type-annotation-spacing */
import { Injectable } from '@angular/core';
import { BaseService } from 'app/services/base.service';
import { HttpService } from 'app/services/http.service';

@Injectable({
  providedIn: 'root',
})
export class DashboardService extends BaseService<any> {
  private controller: string = 'Dashboard';
  constructor(public _httpService: HttpService) {
    super(_httpService, 'Dashboard');
  }

  async getData(params: any) {
    return await this._httpService.postFromBody(this.controller, 'GetData', params).toPromise();
  }
}
