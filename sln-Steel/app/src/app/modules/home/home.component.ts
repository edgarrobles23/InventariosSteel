/* eslint-disable curly */
/* eslint-disable @typescript-eslint/type-annotation-spacing */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { AfterViewInit, Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GeneralService } from 'app/services/general.service';
import { PageTitleService } from 'app/services/TitlePage.service';
import { PerfilUsuarioService } from '../perfil-usuario/perfil-usuario.service';
import { DashboardService } from './dashboard.service';
import { ApexOptions } from 'ng-apexcharts';
import { SystemService } from 'app/services/system.service';
import _ from 'lodash';
import { BaseCustomComponent } from 'app/components/core/base.custom.component';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { TableVirtualScrollDataSource } from 'ng-table-virtual-scroll';
import { MatSort } from '@angular/material/sort';

@Component({
  selector: 'home',
  templateUrl: './home.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class HomeComponent implements AfterViewInit {
  public user: any;

  constructor(
    private _PageTitle: PageTitleService,
    private _perfilUsuarioService: PerfilUsuarioService,
    private _loading: GeneralService.Loading,
    private _activedRoute: ActivatedRoute,
    private _notify: SystemService.Notify
  ) {}

  ngAfterViewInit(): void {
    this.getProfileUser();

    setTimeout(() => {
      this._PageTitle.onPageTitle.next('Inicio');
    }, 0);
  }

  getProfileUser() {
    const { IdUsuario } = this._activedRoute.snapshot.data.user;

    this._perfilUsuarioService.getProfile({ IdUsuario: IdUsuario }).subscribe({
      next: (respProfile: any) => {
        this.user = respProfile;
        this._loading.Stop();
      },
      error: (err) => {
        // Set the alert
        this._loading.Stop();
      },
    });
  }
}
