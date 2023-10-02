import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FuseCardModule } from '@fuse/components/card';
import { FuseAlertModule } from '@fuse/components/alert';
import { SharedModule } from 'app/shared/shared.module';
import { AuthLoginInComponent } from 'app/modules/auth/login/login.component';
import { MatSelectModule } from '@angular/material/select';

export const authSignInRoutes: Route[] = [
    {
        path     : '',
        component: AuthLoginInComponent
    }
];

@NgModule({
  declarations: [AuthLoginInComponent],
  imports: [
    RouterModule.forChild(authSignInRoutes),
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    FuseCardModule,
    FuseAlertModule,
    SharedModule,
  ],
})
export class AuthSignInModule {}
