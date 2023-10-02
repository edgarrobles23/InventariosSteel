/* eslint-disable no-trailing-spaces */
/* eslint-disable quotes */
/* eslint-disable @typescript-eslint/quotes */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'app/shared/shared.module';
import { ComponentsModule } from 'app/components/components.module';
import { MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { Route, RouterModule } from '@angular/router';
import { InventarioMainComponent } from './inventario-main/inventario-main.component';
import { InventarioDetailComponent } from './inventario-detail/inventario-detail.component';

import { PermisosDataResolver, UserDataResolver } from 'app/app.resolvers';
import { AuthGuard } from 'app/core/auth/guards/auth.guard';
import { QuillModule } from 'ngx-quill';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatSliderModule } from '@angular/material/slider';
const routes: Route[] = [
  {
    path: '',
    canActivate: [AuthGuard],
    resolve: {
      user: UserDataResolver,
      permisos: PermisosDataResolver,
    },
    data: {
      IdMenuSuperior: 3732, //menu de la base de datos
    },
    component: InventarioMainComponent,
  },
  {
    path: '**',
    redirectTo: '',
  },
];

@NgModule({
  declarations: [InventarioMainComponent, InventarioDetailComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule,
    ComponentsModule,
    QuillModule.forRoot(),
    MatCheckboxModule,
    DragDropModule,
    MatSliderModule,
  ],
  providers: [
    {
      provide: MAT_DATE_LOCALE,
      useValue: 'es-MX',
    },
    {
      provide: MAT_DATE_FORMATS,
      useValue: {
        parse: {
          dateInput: 'DD-MM-YYYY',
        },
        display: {
          dateInput: 'DD-MM-YYYY',
          monthYearLabel: 'MMM YYYY',
          dateA11yLabel: 'DD-MM-YYYY',
          monthYearA11yLabel: 'MMMM YYYY',
        },
      },
    },
  ],
})
export class InventarioModule {}
