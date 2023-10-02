/* eslint-disable no-trailing-spaces */
/* eslint-disable quote-props */
import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { finalize, Subject, takeUntil, takeWhile, tap, timer } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from 'app/services/auth.service';

@Component({
  selector: 'auth-sign-out',
  templateUrl: './sign-out.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class AuthSignOutComponent implements OnInit, OnDestroy {
  countdown: number = 3;
  countdownMapping: any = {
    '=1': '# second',
    other: '# seconds',
  };
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  /**
   * Constructor
   */
  constructor(private _authService: AuthService,
     private _router: Router) {}

  /**
   * On init
   */
  ngOnInit(): void {
    // Sign out
    this._authService.signOut().subscribe({
      next: () => {
        this._authService.cleanLocalStorage();
        // Redirect after the countdown
        timer(1000, 1000)
          .pipe(
            finalize(() => {
              this._router.navigate(['']);
            }),
            takeWhile(() => this.countdown > 0),
            takeUntil(this._unsubscribeAll),
            tap(() => this.countdown--)
          )
          .subscribe();
      },
      error: (err) => {
        this._authService.cleanLocalStorage();
        this._router.navigate(['']);
        console.log('Logout Error: ', err);
      },
    });
  }

  /**
   * On destroy
   */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }
}
