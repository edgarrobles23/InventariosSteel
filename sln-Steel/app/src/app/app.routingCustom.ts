/* eslint-disable arrow-parens */
import { Route } from '@angular/router';
import { LayoutComponent } from 'app/layout/layout.component';
import { InitialDataResolver } from './app.resolvers';

// @formatter:off
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/explicit-function-return-type */

export const appRoutesCustom: Route[] = [
  //ttest
  {
    path: 'test',
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
];
