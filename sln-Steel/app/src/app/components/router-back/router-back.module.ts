import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterBackComponent } from './router-back.component';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';



@NgModule({
  declarations: [RouterBackComponent],
  imports: [
    MatIconModule,
    MatTooltipModule
  ],exports:[
    RouterBackComponent
  ]
})
export class RouterBackModule { }
