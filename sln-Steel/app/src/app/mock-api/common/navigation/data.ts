/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* tslint:disable:max-line-length */
import { FuseNavigationItem } from '@fuse/components/navigation';

export const defaultNavigation: FuseNavigationItem[] = [
  //   {
  //     id: 'home',
  //     title: 'Pagina Principal',
  //     // subtitle: 'Dashboard',
  //     // tooltip: 'Dashboard',
  //     type: 'basic',
  //     icon: 'heroicons_outline:home',
  //     link: '/Home',
  //   },
  //   {
  //     id: 'tienda',
  //     title: 'Tienda en Línea',
  //     type: 'basic',
  //     icon: 'storefront',
  //     link: '/tienda',
  //   },
  //   {
  //     id: 'encuesta',
  //     title: 'Encuesta',
  //     type: 'collapsable',
  //     icon: 'heroicons_outline:document',
  //     children: [
  //       {
  //         id: 'nuevo',
  //         type: 'basic',
  //         title: 'Capturar Encuesta',
  //         icon: 'heroicons_outline:document-add',
  //         link: '/encuesta/nuevo',
  //       },
  //       {
  //         id: 'reporte',
  //         type: 'basic',
  //         title: 'Reporte de Encuestas',
  //         icon: 'heroicons_outline:document-text',
  //         link: '/encuesta/reporte',
  //       },
  //     ],
  //   },

  //   {
  //     id: 'profile',
  //     title: 'Perfil de Usuario',
  //     type: 'basic',
  //     icon: 'heroicons_outline:user-circle',
  //     link: '/profile',
  //   },
  {
    id: '0',
    title: 'Cerrar Sesión',
    type: 'basic',
    icon: 'heroicons_outline:logout',
    subtitle: '',
    link: '/sign-out',
  },
];
