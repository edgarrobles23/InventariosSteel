import { NgModule } from '@angular/core';
import { DatePickerComponent } from './date-picker/date-picker.component';
import { SharedModule } from 'app/shared/shared.module';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MAT_MOMENT_DATE_FORMATS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { LookupComponent } from './lookup/lookup.component';
import { NextControlModule } from 'app/directives/nextcontrol/nextcontrol.module';
import { PDFViewerComponent } from './pdf-viewer/pdf-viewer.component';
import { ImagePickerComponent } from './image-picker/image-picker.component';
import { ModoOscuroComponent } from './modo-oscuro/modo-oscuro.component';
import { NavComponent } from './nav/nav.component';
import { NavItemComponent } from './nav-item/nav-item.component';
import { RouterModule } from '@angular/router';
import { MapComponent } from './map/map.component';
import { AgmCoreModule } from '@agm/core';

@NgModule({
  declarations: [
    DatePickerComponent,
    LookupComponent,
    PDFViewerComponent,
    ImagePickerComponent,
    ModoOscuroComponent,
    NavComponent,
    NavItemComponent,
    MapComponent,
  ],
  imports: [
    SharedModule,
    MatDatepickerModule,
    NextControlModule,
    RouterModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyC3uZBjkbxM1IG9Qne0wnml3CJcrPi5A1g',
      libraries: ['places'],
    }),
  ],
  exports: [
    SharedModule,
    DatePickerComponent,
    NextControlModule,
    LookupComponent,
    ImagePickerComponent,
    ModoOscuroComponent,
    NavComponent,
    NavItemComponent,
    MapComponent,
  ],
  providers: [
    {
      provide: MAT_DATE_LOCALE,
      useValue: 'es-MX',
    },
    {
      provide: MAT_DATE_FORMATS,
      useValue: MAT_MOMENT_DATE_FORMATS,
    },
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE],
    },
  ],
})
export class ComponentsModule {}
