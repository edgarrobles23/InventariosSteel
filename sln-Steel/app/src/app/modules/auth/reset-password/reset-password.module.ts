import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Route, RouterModule } from '@angular/router';
import { ComponentsModule } from 'app/components/components.module';
import { RouterBackModule } from 'app/components/router-back/router-back.module';
import { ResetPasswordComponent } from './reset-password.component';
import { AuthLoginInComponent } from '../login/login.component';
import { AuthGuard, AuthToken } from 'app/core/auth/guards/auth.guard';


const routes: Route[]=[
{
    path: ':Token',
    canActivate:[AuthToken],
    component: ResetPasswordComponent,
}
];

@NgModule({
  declarations: [ResetPasswordComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ComponentsModule,
    RouterBackModule
  ]
})
export class ResetPasswordModule {
}
