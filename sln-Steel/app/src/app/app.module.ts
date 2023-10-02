/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/type-annotation-spacing */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable no-debugger */
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ExtraOptions, PreloadAllModules, RouterModule } from '@angular/router';
import { MarkdownModule } from 'ngx-markdown';
import { FuseModule } from '@fuse';
import { FuseConfigModule } from '@fuse/services/config';
import { FuseMockApiModule } from '@fuse/lib/mock-api';
import { CoreModule } from 'app/core/core.module';
import { appConfig } from 'app/core/config/app.config';
import { mockApiServices } from 'app/mock-api';
import { LayoutModule } from 'app/layout/layout.module';
import { AppComponent } from 'app/app.component';
import { appRoutes } from 'app/app.routing';
import { appRoutesCustom } from 'app/app.routingCustom';

import { NgIdleKeepaliveModule } from '@ng-idle/keepalive';

// Store
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { DataUserReducer } from './store/reducers/DataUser.reducer';
import { ActionsReducer } from './store/reducers/Actions.reducer';
// Notify - Loading
import { NotifierModule } from 'angular-notifier';
import { notifierConfig } from './configs/notifier.config';
import { BlockUIModule } from 'ng-block-ui';
import { GeneralService } from './services/general.service';
import { globalConst } from './app.config';

import { registerLocaleData } from '@angular/common';
import localeEsMx from '@angular/common/locales/es-MX';
registerLocaleData(localeEsMx, 'es-Mx');

const routerConfig: ExtraOptions = {
  preloadingStrategy: PreloadAllModules,
  scrollPositionRestoration: 'enabled',
};

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(appRoutes.concat(appRoutesCustom), routerConfig),
    NgIdleKeepaliveModule.forRoot(),

    // Fuse, FuseConfig & FuseMockAPI
    FuseModule,
    FuseConfigModule.forRoot(appConfig),
    FuseMockApiModule.forRoot(mockApiServices),

    // Core module of your application
    CoreModule,

    // Layout module of your application
    LayoutModule,

    // 3rd party modules that require global configuration via forRoot
    MarkdownModule.forRoot({}),

    // Store - Almacenamiento Global
    StoreModule.forRoot({
      DataUser: DataUserReducer,
      Actions: ActionsReducer,
    }),
    StoreDevtoolsModule.instrument({
      maxAge: 25, // Retains last 25 states
      logOnly: globalConst.Production, // Restrict extension to log-only mode
    }),

    // General Components
    NotifierModule.withConfig(notifierConfig),
    BlockUIModule.forRoot(),
  ],
  bootstrap: [AppComponent],
  providers: [
    GeneralService.InitApp,
    {
      provide: APP_INITIALIZER,
      useFactory: (ds: GeneralService.InitApp) => () => {
        ds.initializeUrl();
      },
      deps: [GeneralService.InitApp],
      multi: true,
    },
  ],
})
export class AppModule {}
