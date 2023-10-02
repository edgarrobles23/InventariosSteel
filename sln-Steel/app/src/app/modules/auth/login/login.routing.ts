import { Route } from '@angular/router';
import { AuthLoginInComponent } from 'app/modules/auth/login/login.component';

export const authSignInRoutes: Route[] = [
    {
        path     : '',
        component: AuthLoginInComponent
    }
];
