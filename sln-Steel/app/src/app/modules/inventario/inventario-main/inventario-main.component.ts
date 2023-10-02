/* eslint-disable curly */
/* eslint-disable prefer-const */
/* eslint-disable arrow-parens */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable no-trailing-spaces */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/member-ordering */
import {
  Component,
  OnInit,
  ViewChild,
  ChangeDetectorRef,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  AfterViewInit,
  ElementRef,
} from '@angular/core';
import { FormBuilder, FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { MatSort } from '@angular/material/sort';
import { fuseAnimations } from '@fuse/animations';
import { SystemService } from 'app/services/system.service';
import { PageTitleService } from 'app/services/TitlePage.service';
import { BaseCustomComponent } from 'app/components/core/base.custom.component';
import { InventarioService } from '../inventario.service';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { ActivatedRoute } from '@angular/router';
import { MatSliderChange } from '@angular/material/slider';

@Component({
  selector: 'app-inventario-main',
  templateUrl: './inventario-main.component.html',
  styleUrls: ['./inventario-main.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: fuseAnimations,
})
export class InventarioMainComponent extends BaseCustomComponent implements OnInit, AfterViewInit {
  init(): boolean {
    throw new Error('Method not implemented.');
  }
  grid: any = null;
  isLoading: boolean = false;
  @ViewChild('virtualScroll') virtualScroll: CdkVirtualScrollViewport;
  @ViewChild(MatSort) sort: MatSort;
  searchInputControl: FormControl = new FormControl();
  Usuario: any;
  FilterParamsFg: FormGroup;
  panelOpenState: boolean = true;

  Permisos: any = {};

  //Dimensiones de Pantalla
  @ViewChild('filterParamsNg') filterParamsNg: NgForm;
  @ViewChild('Module') private Module: ElementRef | any;
  @ViewChild('FilterParamsDiv') private FilterParamsDiv: ElementRef | any;
  @ViewChild('FilterParamsDiv2') private FilterParamsDiv2: ElementRef | any;

  @ViewChild('ActionsButtonsDiv') private ActionsButtonsDiv: ElementRef | any;
  BodyHeight: any = {
    Container: '',
    Table: '',
  };

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _loading: SystemService.Loading,
    private _notify: SystemService.Notify,
    private _service: InventarioService,
    private _formBuilder: FormBuilder,
    private _pageTitle: PageTitleService,
    public _styleService: SystemService.Style,
    private _activatedRoute: ActivatedRoute
  ) {
    super();
    this.FilterParamsFg = this._formBuilder.group({
      MilMin: [0, [Validators.min(0)]],
      MilMax: [100, [Validators.min(0)]],
      MedidaMin: [null, [Validators.min(0)]],
      MedidaMax: [null, [Validators.min(0)]],
      KilosMin: [null, [Validators.min(0)]],
      KilosMax: [null, [Validators.min(0)]],
      DurezaMin: [null, [Validators.min(0)]],
      DurezaMax: [null, [Validators.min(0)]],
      Observaciones: new FormControl(null),
    });
    super.initTable(
      [
        'IdInventario',
        'FechaEntrada',
        'Bodega',
        'Producto',
        'Referencia',
        'NumeroRollo',
        'Calibre',
        'Mil',
        'Medida',
        'Largo',
        'Dureza',
        'Libras',
        'Kilos',
        'Paquete',
        'Piezas',
        'Observaciones',
        'Proveedor',
        // 'Finalizar',
      ],
      'TableVirtualScrollDataSource'
    );
    //inicalizacion de los forms
    this.searchInputControl = new FormControl();
    this.Permisos = this._activatedRoute.snapshot.data.permisos;
  }
  async onInputChange(event: MatSliderChange) {
    console.log(event.value);
  }

  async ngOnInit() {
    //Opcional para agregar el titulo a la pagina
    setTimeout(() => {
      this._pageTitle.onPageTitle.next('Inventario');
    }, 0);
    setTimeout(() => {
      /*Alto de la tabla de informacion*/
      const hModule = this.Module.nativeElement.offsetHeight;
      const hFilterParams = 56; //this.FilterParamsDiv.nativeElement.offsetHeight;
      const hFilterParams2 = this.FilterParamsDiv2.nativeElement.offsetHeight;
      const hActionsButtons = this.ActionsButtonsDiv.nativeElement.offsetHeight;
      this.BodyHeight = {
        Container: `height: ${window.innerHeight || hModule}px`,
        Table: `height: ${hModule - (hFilterParams + hFilterParams2 + hActionsButtons + 42)}px`,
      };
      this._changeDetectorRef.markForCheck();
    }, 100);

    this._changeDetectorRef.markForCheck();
  }

  async getInfo(removeLoadings: boolean = false) {
    try {
      if (this.FilterParamsFg.invalid) {
        this._notify.notifyError('Filtros no validos');
        return;
      }
      super.setInfoInTable([]);
      if (!removeLoadings) this._loading.show('Consultando..');
      /*Filtros */
      const data = await this._service.getInventario(this.FilterParamsFg.value);
      super.setInfoInTable(data);
      this.virtualScroll.checkViewportSize();

      // Mark for check
      this._loading.stop();
      this._changeDetectorRef.markForCheck();
    } catch (error) {
      // Set the alert
      this._loading.stop();
      this._notify.notifyError(error.error.Error || error.error || error.message);
    }
  }
}
