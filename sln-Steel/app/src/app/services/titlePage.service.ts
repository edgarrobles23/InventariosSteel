import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PageTitleService {
  onPageTitle: BehaviorSubject<any>;

  constructor() {
    this.onPageTitle = new BehaviorSubject({});
  }
}
