import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { RouterModule } from '@angular/router';
import { filter, map, startWith, takeUntil } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';
import { Images } from '@fumes/constants';
import { BaseComponent } from '../base/base.component';
import { WINDOW } from '../../tokens/window.token';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule
  ],
  selector: 'app-header',
  templateUrl: './header.html',
  styleUrls: ['./header.scss'],
})
export class HeaderComponent extends BaseComponent implements OnInit {
  private readonly router = inject(Router);
  readonly window = inject(WINDOW);
  readonly platformId: Object = inject(PLATFORM_ID);

  public isOwnerView: boolean = true;
  public isRenterView: boolean = false;
  public isRegisterPage: boolean = false;
  public isTos: boolean = false;
  public isVanityPage: boolean = false;
  public scrolled = false;
  _isBrowser: boolean = isPlatformBrowser(this.platformId);
  _Images = Images;

  private readonly isMainPage$ = this.router.events.pipe(
    filter((event): event is NavigationEnd => event instanceof NavigationEnd),
    map((event: NavigationEnd) => event.url === '/'),
    startWith(true)
  );
  isMainPage = toSignal(this.isMainPage$);

  constructor(private activatedRoute: ActivatedRoute) {
    super();
  }

  override ngOnInit(): void {
    this.router.events
      .pipe(
        takeUntil(this.destroyed),
        filter((event) => event instanceof NavigationEnd)
      )
      .subscribe(() => {
        const currentUrl = this.router.url;
        // Set isOwnerView to true for the root path
        if (currentUrl === '/') {
          this.isOwnerView = true;
          this.isRenterView = false;
          this.isRegisterPage = false;
          this.isTos = false;
          this.isVanityPage = false;
          console.log('root');
        } else {
          // For other routes, check the route data if available
          this.activatedRoute.firstChild?.data
            .pipe(takeUntil(this.destroyed))
            .subscribe((data: any) => {
              const view = data?.view;
              if (view) {
                this.isOwnerView = view.includes('owner');
                this.isRenterView = view.includes('renter');
                this.isRegisterPage = view.includes('registration');
                this.isTos = view.includes('terms');
                this.isVanityPage =
                  !this.isOwnerView &&
                  !this.isRenterView &&
                  !this.isRegisterPage &&
                  !this.isTos;
              }
            });
        }
      });

    if (this._isBrowser) {
      this.attachScrollListener();
    }
  }

  switchApp(app: string) {
    if (this.window && this._isBrowser) {
      const isLocalhost = this.window.location.hostname === 'localhost';
      if (!isLocalhost) {
        this.window.location.href = 'https://owner.fumes.app';
      }
    }
  }
  attachScrollListener() {
    if (this.window && this._isBrowser) {
      this.window.addEventListener('scroll', this.onScrollWindow.bind(this));
    }
  }

  onScrollWindow(event: any) {
    this.scrolled = event.target.documentElement.scrollTop > 0;
  }
}