/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/naming-convention */
import { Idle, DEFAULT_INTERRUPTSOURCES } from '@ng-idle/core';
import { Keepalive } from '@ng-idle/keepalive';
import { Injectable } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class IdleService {
  idleState = 'Not started.';
  timedOut = false;
  lastPing?: Date = null;

  constructor(
    private idle: Idle,
    private keepalive: Keepalive,
    // private _AuthService: AuthService,
    private _Router: Router
  ) {
    sessionStorage.setItem('IDLE_Interval', 'false');

    this._Router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        if (event.url !== '/login') {
          const IDLE_Interval = sessionStorage.getItem('IDLE_Interval');
          if (IDLE_Interval === 'false') {
            idle.setIdle(1);
            idle.setTimeout(1800);

            idle.setInterrupts(DEFAULT_INTERRUPTSOURCES);

            idle.onTimeout.subscribe(() => {
              if (localStorage.getItem('ReLogin') !== 'true') {
                localStorage.setItem('ReLogin', 'true');
                // this._AuthService.ReLogin();
              }
              this.timedOut = true;
              sessionStorage.setItem('IDLE_Interval', 'false');
            });

            // Eventos
            // idle.onIdleStart.subscribe(() =>
            //     console.log("Idle Iniciado...")
            // );

            // idle.onTimeoutWarning.subscribe((countdown) =>
            //     console.log(
            //         "¡Se agotará el tiempo en " +
            //             countdown +
            //             " segundos!"
            //     )
            // );

            // idle.onIdleEnd.subscribe(() =>
            //     console.log("Idle Reset...")
            // );

            this.Reset();
          }
        }
      }
    });
  }

  Reset() {
    this.idle.watch();
    this.idleState = 'Started.';
    this.timedOut = false;
    sessionStorage.setItem('IDLE_Interval', 'true');
  }
}
