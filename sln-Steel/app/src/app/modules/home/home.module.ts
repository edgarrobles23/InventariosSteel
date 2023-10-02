import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { HomeComponent } from 'app/modules/home/home.component';
import { MatIconModule } from '@angular/material/icon';
import { NgApexchartsModule } from 'ng-apexcharts';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { CapitalizePipe } from 'app/pipes/capitalize.pipe';
import { SharedModule } from 'app/shared/shared.module';
import { ComponentsModule } from 'app/components/components.module';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { AuthGuard } from 'app/core/auth/guards/auth.guard';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatRippleModule } from '@angular/material/core';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';

const exampleRoutes: Route[] = [
  {
    path: '',
    canActivate: [AuthGuard],
    component: HomeComponent,
  },
];

@NgModule({
  declarations: [HomeComponent, CapitalizePipe],
  imports: [
    RouterModule.forChild(exampleRoutes),
    MatIconModule,
    NgApexchartsModule,
    MatTabsModule,
    MatButtonModule,
    SharedModule,
    ComponentsModule,
    MatMenuModule,
    MatButtonToggleModule,

    MatDividerModule,
    MatProgressBarModule,
    MatRippleModule,
    MatSortModule,
    MatTableModule,
  ],
})
export class HomeModule {}
