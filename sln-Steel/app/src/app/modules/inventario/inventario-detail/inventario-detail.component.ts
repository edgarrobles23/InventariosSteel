/* eslint-disable curly */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/naming-convention */
import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { SystemService } from 'app/services/system.service';
import { InventarioService } from '../inventario.service';

@Component({
  selector: 'app-inventario-detail',
  templateUrl: './inventario-detail.component.html',
  styleUrls: ['./inventario-detail.component.scss'],
})
export class InventarioDetailComponent implements OnInit {
  @Input() ParamItem: any;
  grid: any = null;

  isLoading: boolean = false;
  constructor(
    private _service: InventarioService,
    private _loading: SystemService.Loading,
    private _notify: SystemService.Notify,
    private _changeDetectorRef: ChangeDetectorRef
  ) {
    this.grid = {
      data: { data: [] },
      dataRaw: [],
      columns: [
        'IdFacturaDet',
        'Concepto',
        'Cantidad',
        'Precio',
        'Subtotal',
        'ImporteDescuento',
        'ImporteIva',
        'Total',
      ],
      rowSelected: null,
      totalRows: 0,
    };
  }

  ngOnInit(): void {
    if (this.ParamItem.IdPago) this.getInfoDetail();
  }

  async getInfoDetail() {
    try {
      this._loading.show('Consultando..');
      /*Filtros */

      // Mark for check
      this._changeDetectorRef.markForCheck();
      this._loading.stop();
    } catch (error) {
      // Set the alert
      this._notify.notifyError(error.error || error.message);
      this._loading.stop();
    }
  }
}
