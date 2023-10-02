import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FuseLoadingBarModule } from '@fuse/components/loading-bar';
import { SharedModule } from 'app/shared/shared.module';
import { EmptyLayoutComponent } from 'app/layout/layouts/empty/empty.component';
import { NotifierModule } from 'angular-notifier';
import { notifierConfig } from '../../../configs/notifier.config';
import { BlockUIModule } from 'ng-block-ui';

@NgModule({
  declarations: [EmptyLayoutComponent],
  imports: [RouterModule, FuseLoadingBarModule, SharedModule, NotifierModule.withConfig(notifierConfig), BlockUIModule],
  exports: [EmptyLayoutComponent],
})
export class EmptyLayoutModule {}
