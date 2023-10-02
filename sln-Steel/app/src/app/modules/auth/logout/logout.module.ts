import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { FuseCardModule } from '@fuse/components/card';
import { SharedModule } from 'app/shared/shared.module';
import { AuthLogoutComponent } from 'app/modules/auth/logout/logout.component';
import { authSignOutRoutes } from 'app/modules/auth/logout/logout-out.routing';

@NgModule({
    declarations: [
        AuthLogoutComponent
    ],
    imports     : [
        RouterModule.forChild(authSignOutRoutes),
        MatButtonModule,
        FuseCardModule,
        SharedModule
    ]
})
export class AuthSignOutModule
{
}
