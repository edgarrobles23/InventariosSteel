import { Route } from '@angular/router';
import { AuthSignOutComponent } from 'app/modules/auth/logout/sign-out.component';

export const authSignOutRoutes: Route[] = [
    {
        path     : '',
        component: AuthSignOutComponent
    }
];
