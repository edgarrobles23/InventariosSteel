/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable quotes */
/* eslint-disable @typescript-eslint/quotes */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/type-annotation-spacing */
import { BehaviorSubject } from 'rxjs';
import { HttpService } from './http.service';

export enum TypeInActions {
  'update',
  'delete',
  'create',
}

export abstract class BaseService<T> {
  //T representa un tipo de dato para definir todos los items
  //Example: items:Book[]=[]
  private items: T[];
  private items$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  protected constructor(protected _http: HttpService, protected _controlName: string) {}

  //Medotos del emmiter
  emmiter(
    ParamItem: any,
    Type: 'update' | 'delete' | 'create' | 'Update' | 'Delete' | 'Get' | 'UpdateAvatar' | 'UpdateProfile'
  ) {
    this.items$.next({ Type: Type, Data: ParamItem });
  }
  listener() {
    return this.items$.asObservable();
  }
  //   protected abstract requestItemsList(data?: any): Observable<T[]>;

  listInterno(data: any = {}) {
    return this._http.postFromBody(this._controlName, 'ListInterno', data).toPromise();
  }
  listExterno(data: any = {}) {
    return this._http.postFromBody(this._controlName, 'ListExterno', data).toPromise();
  }
  create(data: any = {}) {
    return this._http.postFromBody(this._controlName, 'Create', data).toPromise();
  }
  update(data: any = {}) {
    return this._http.postFromBody(this._controlName, 'Update', data).toPromise();
  }
  delete(data: any = {}) {
    return this._http.postFromBody(this._controlName, 'Delete', data).toPromise();
  }
  detail(data: any = {}) {
    return this._http.postFromBody(this._controlName, 'Detail', data).toPromise();
  }
  download(data: any) {
    return this._http.postFromBody(this._controlName, 'Download', data).toPromise();
  }
  GetBase64(data: any) {
    return this._http.getFromQuery(this._controlName, 'GEtBase64', data).toPromise();
  }
  GetXml(data: any) {
    return this._http.getFromQuery(this._controlName, 'GetXml', data).toPromise();
  }
}
