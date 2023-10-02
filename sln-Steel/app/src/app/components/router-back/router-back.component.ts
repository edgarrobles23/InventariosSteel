/* eslint-disable @angular-eslint/no-input-rename */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable quotes */
/* eslint-disable @typescript-eslint/quotes */
/* eslint-disable @typescript-eslint/member-ordering */
import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'router-back',
  templateUrl: './router-back.component.html',
  styleUrls: ['./router-back.component.scss']
})
export class RouterBackComponent implements OnInit {

  constructor(private _router: Router) { }
  @Input("tooltip") tooltip: string;
  @Input("route") route: string;
  @Input("label") label: string;
  @Input("replace") replace: boolean;
  ngOnInit(): void {
  }

  navigateTo(route: string){
    route = route || this.route;
    const withReplace = this.replace || false;
    this._router.navigate([route], {replaceUrl: withReplace});
  }

}
