import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { FuseFullscreenModule } from '@fuse/components/fullscreen';
import { FuseLoadingBarModule } from '@fuse/components/loading-bar';
import { FuseNavigationModule } from '@fuse/components/navigation';

import { UserModule } from 'app/layout/common/user/user.module';
import { SharedModule } from 'app/shared/shared.module';
import { DenseLayoutComponent } from 'app/layout/layouts/dense/dense.component';

import { NotifierModule } from 'angular-notifier';
import { notifierConfig } from '../../../configs/notifier.config';
import { BlockUIModule } from 'ng-block-ui';
import { ComponentsModule } from 'app/components/components.module';
import { ReloginComponent } from 'app/modules/auth/relogin/relogin.component';

@NgModule({
  declarations: [DenseLayoutComponent, ReloginComponent],
  imports: [
    HttpClientModule,
    RouterModule,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    MatMenuModule,
    FuseFullscreenModule,
    FuseLoadingBarModule,
    FuseNavigationModule,
    UserModule,
    SharedModule,
    NotifierModule.withConfig(notifierConfig),
    BlockUIModule,
    ComponentsModule,
  ],
  exports: [DenseLayoutComponent],
})
export class DenseLayoutModule {}
