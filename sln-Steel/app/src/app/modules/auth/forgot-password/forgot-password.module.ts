import { NgModule } from '@angular/core';
import { CommonModule, LocationStrategy, PathLocationStrategy } from '@angular/common';
import { Route, RouterModule } from '@angular/router';
import { ForgotPasswordComponent } from './forgot-password.component';
import { ComponentsModule } from 'app/components/components.module';
import { RouterBackModule } from 'app/components/router-back/router-back.module';

const routes: Route[] = [
  {
    path: '',
    component: ForgotPasswordComponent,
  },
];

@NgModule({
  declarations: [ForgotPasswordComponent],
  imports: [CommonModule, RouterModule.forChild(routes), ComponentsModule, RouterBackModule],
  providers: [{ provide: LocationStrategy, useClass: PathLocationStrategy }],
})
export class ForgotPasswordModule {}
