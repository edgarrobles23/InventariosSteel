/* eslint-disable no-trailing-spaces */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PerfilUsuarioComponent } from './perfil-usuario.component';
import { Route, RouterModule } from '@angular/router';
import { SharedModule } from 'app/shared/shared.module';
import { ComponentsModule } from 'app/components/components.module';
import { UserDataResolver } from 'app/app.resolvers';
import { InformacionPersonalComponent } from './informacion-personal/informacion-personal.component';
import { AuthGuard } from 'app/core/auth/guards/auth.guard';

const routes: Route[] = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'InformacionPersonal',
  },
  {
    path: '',
    component: PerfilUsuarioComponent,
    children: [
      {
        canActivate: [AuthGuard],
        path: 'InformacionPersonal',
        component: InformacionPersonalComponent,
        resolve: {
          user: UserDataResolver,
        },
      },
    ],
  },
];

@NgModule({
  declarations: [PerfilUsuarioComponent, InformacionPersonalComponent],
  imports: [CommonModule, RouterModule.forChild(routes), SharedModule, ComponentsModule],
})
export class PerfilUsuarioModule {}
