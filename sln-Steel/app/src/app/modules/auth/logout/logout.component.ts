/* eslint-disable no-trailing-spaces */
/* eslint-disable quote-props */
import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { finalize, Subject, takeUntil, takeWhile, tap, timer } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from 'app/services/auth.service';
import { WebhookService } from 'app/services/webhook.service';

@Component({
  selector: 'auth-logout',
  templateUrl: './logout.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class AuthLogoutComponent implements OnInit, OnDestroy {
  countdown: number = 3;
  countdownMapping: any = {
    '=1': '# second',
    other: '# seconds',
  };
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  /**
   * Constructor
   */
  constructor(private _authService: AuthService, private _router: Router, private _webhookService: WebhookService) {}

  /**
   * On init
   */
  ngOnInit(): void {
    // Sign out
    this._authService.signOut().subscribe({
      next: () => {
        this._authService.cleanLocalStorage();

        // this._webhookService.exit();
        // Redirect after the countdown
        timer(1000, 1000)
          .pipe(
            finalize(() => {
              this._router.navigate(['sign-in']);
            }),
            takeWhile(() => this.countdown > 0),
            takeUntil(this._unsubscribeAll),
            tap(() => this.countdown--)
          )
          .subscribe();
      },
      error: (err) => {
        this._authService.cleanLocalStorage();
        this._router.navigate(['sign-in']);
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
