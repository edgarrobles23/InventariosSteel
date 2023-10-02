/* eslint-disable arrow-parens */
import { Route } from '@angular/router';
import { AuthGuard } from 'app/core/auth/guards/auth.guard';
import { NoAuthGuard } from 'app/core/auth/guards/noAuth.guard';
import { LayoutComponent } from 'app/layout/layout.component';
import { HospitalesDataResolver, InitialDataResolver, UserDataResolver } from 'app/app.resolvers';

// @formatter:off
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
export const appRoutes: Route[] = [
  { path: '', pathMatch: 'full', redirectTo: 'sign-in' },

  { path: 'signed-in-redirect', pathMatch: 'full', redirectTo: 'sign-in' },

  // Auth routes for guests
  {
    path: 'sign-in',
    canActivate: [NoAuthGuard],
    canActivateChild: [NoAuthGuard],
    component: LayoutComponent,
    data: {
      layout: 'empty',
    },
    loadChildren: () => import('app/modules/auth/login/login.module').then((m) => m.AuthSignInModule),
  },
  {
    path: 'forgot-password',
    canActivate: [NoAuthGuard],
    canActivateChild: [NoAuthGuard],
    component: LayoutComponent,
    data: {
      layout: 'empty',
    },
    resolve: {
      hospitales: HospitalesDataResolver,
    },
    loadChildren: () =>
      import('app/modules/auth/forgot-password/forgot-password.module').then((m) => m.ForgotPasswordModule),
  },
  {
    path: 'reset-password',
    canActivate: [NoAuthGuard],
    canActivateChild: [NoAuthGuard],
    component: LayoutComponent,
    data: {
      layout: 'empty',
    },
    loadChildren: () =>
      import('app/modules/auth/reset-password/reset-password.module').then((m) => m.ResetPasswordModule),
  },
  // Auth routes for authenticated users
  {
    path: 'sign-out',
    canActivate: [NoAuthGuard],
    canActivateChild: [NoAuthGuard],
    component: LayoutComponent,
    data: {
      layout: 'empty',
    },
    loadChildren: () => import('app/modules/auth/logout/logout.module').then((m) => m.AuthSignOutModule),
  },

  // Admin routes
  {
    path: '',
    canActivate: [AuthGuard],
    component: LayoutComponent,
    resolve: {
      initialData: InitialDataResolver,
    },

    children: [
      {
        path: 'Home',
        resolve: {
          user: UserDataResolver,
        },
        // redirectTo: 'tienda',
        loadChildren: () => import('app/modules/home/home.module').then((m) => m.HomeModule),
      },
    ],
  },
  // perfil de usuario
  {
    path: 'profile',
    component: LayoutComponent,
    resolve: {
      initialData: InitialDataResolver,
    },
    children: [
      {
        path: '',
        loadChildren: () =>
          import('app/modules/perfil-usuario/perfil-usuario.module').then((m) => m.PerfilUsuarioModule),
      },
    ],
  },

  //inventario
  {
    path: 'Inventario',
    component: LayoutComponent,
    resolve: {
      initialData: InitialDataResolver,
    },
    children: [
      {
        path: '',
        loadChildren: () => import('app/modules/inventario/inventario.module').then((m) => m.InventarioModule),
      },
    ],
  },

  {
    path: '**',
    redirectTo: '',
  },
];
