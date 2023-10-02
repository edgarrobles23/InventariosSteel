/* eslint-disable @angular-eslint/use-lifecycle-interface */
/* eslint-disable curly */
/* eslint-disable no-trailing-spaces */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/type-annotation-spacing */
/* eslint-disable @typescript-eslint/naming-convention */
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PageTitleService } from 'app/services/TitlePage.service';

@Component({
  selector: 'app-perfil-usuario',
  templateUrl: './perfil-usuario.component.html',
  styleUrls: ['./perfil-usuario.component.scss'],
  animations: [],
})
export class PerfilUsuarioComponent implements OnInit, AfterViewInit {
  tabActive: number = 0;
  constructor(private router: Router, private _PageTitle: PageTitleService) {
    if (this.router.url.indexOf('/profile/InformacionPersonal') !== -1) this.tabActive = 0;
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    setTimeout(() => {
      this._PageTitle.onPageTitle.next('Perfil de Usuario');
    }, 0);
  }
}
