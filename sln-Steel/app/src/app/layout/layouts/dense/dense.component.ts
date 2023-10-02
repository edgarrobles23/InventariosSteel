/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable curly */
import { FuseNavigationService, FuseVerticalNavigationComponent } from '@fuse/components/navigation';
import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { NavigationService } from 'app/core/navigation/navigation.service';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { Navigation } from 'app/core/navigation/navigation.types';
import { Subject, takeUntil } from 'rxjs';
import { PageTitleService } from 'app/services/TitlePage.service';
import { UserState } from 'app/app.state';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { AuthService } from 'app/services/auth.service';

@Component({
  selector: 'dense-layout',
  templateUrl: './dense.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class DenseLayoutComponent implements OnInit, OnDestroy {
  /**
   * Constructor
   */

  constructor(
    private _navigationService: NavigationService,
    private _fuseMediaWatcherService: FuseMediaWatcherService,
    private _fuseNavigationService: FuseNavigationService,
    // private _wh: WebhookService,
    private _pageTitle: PageTitleService,
    private _usuario: Store<UserState>,
    private _router: Router,
    private _AuthService: AuthService
  ) {
    //Armado de menu desde Base de datos
    const u = this._AuthService.usuario;
    if (!u) this._router.navigate(['sign-in']);
    else this.armarMenu(u);

    this._pageTitle.onPageTitle.subscribe((selected) => {
      this.Title = selected;
    });
  }
  async armarMenu(userInfo: any) {
    const data: any = await this._AuthService.GetMenu(userInfo);
    // this.NavigationData = data.menuUsuario; // DefaultNavigation;
    this.navigation['default'] = data.menuUsuario;
    this.navigation['default'].push({
      id: '0',
      title: 'Cerrar Sesión',
      type: 'basic',
      icon: 'heroicons_outline:logout',
      subtitle: '',
      link: '/sign-out',
    });
  }

  isScreenSmall: boolean;
  navigation: Navigation;
  navigationAppearance: 'default' | 'dense' = 'dense';
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  Title: string = '';

  // -----------------------------------------------------------------------------------------------------
  // @ Accessors
  // -----------------------------------------------------------------------------------------------------

  /**
   * Getter for current year
   */
  get currentYear(): number {
    return new Date().getFullYear();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  async ngOnInit() {
    // Subscribe to navigation data
    this._navigationService.navigation$.pipe(takeUntil(this._unsubscribeAll)).subscribe((navigation: Navigation) => {
      this.navigation = navigation;
    });

    // Subscribe to media changes
    this._fuseMediaWatcherService.onMediaChange$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(({ matchingAliases }) => {
        // Check if the screen is small
        this.isScreenSmall = !matchingAliases.includes('md');
      });

    //webhook
    // await this._wh.init();
    // this._wh.initBosadcast();
    // await this._wh.start();
  }

  /**
   * On destroy
   */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Toggle navigation
   *
   * @param name
   */
  toggleNavigation(name: string): void {
    // Get the navigation
    const navigation = this._fuseNavigationService.getComponent<FuseVerticalNavigationComponent>(name);

    if (navigation) {
      // Toggle the opened status
      navigation.toggle();
    }
  }

  /**
   * Toggle the navigation appearance
   */
  toggleNavigationAppearance(): void {
    this.navigationAppearance = this.navigationAppearance === 'default' ? 'dense' : 'default';
  }
}
