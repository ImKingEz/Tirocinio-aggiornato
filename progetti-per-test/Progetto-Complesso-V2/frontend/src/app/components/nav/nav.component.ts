import { Component, HostListener, ElementRef, ViewChild, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs/operators';
import { AuthComponent } from "./auth/auth.component";
import { SearchComponent } from './search/search.component';
import { AuthService } from '../../_services/auth/auth.service';

@Component({
  selector: 'app-nav',
  standalone: true,
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.scss',
  imports: [CommonModule, RouterModule, AuthComponent, SearchComponent]
})
export class NavComponent {
  authService = inject(AuthService);
  router = inject(Router);
  elementRef = inject(ElementRef);

  isLoginDropdownOpen = signal(false);

  @ViewChild('accountButton') accountButton!: ElementRef;
  @ViewChild('authDropdown') authDropdown!: ElementRef;

  private routerEvents = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    )
  );

  isSearchVisible = computed(() => {
    const navigationEndEvent = this.routerEvents();
    const currentUrl = navigationEndEvent?.urlAfterRedirects || this.router.url;
    return !currentUrl.startsWith('/daily');
  });


  onLogout() {
    this.authService.logout();
    this.router.navigateByUrl("/home");
    this.isLoginDropdownOpen.set(false);
  }

  toggleLoginDropdown() {
    if (!this.authService.isAuthenticated()) {
      this.isLoginDropdownOpen.set(!this.isLoginDropdownOpen());
    }
  }

  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent) {
    if (!this.isLoginDropdownOpen()) {
      return;
    }

    const clickedOnButton = this.accountButton && this.accountButton.nativeElement.contains(event.target as Node);
    const clickedInDropdown = this.authDropdown && this.authDropdown.nativeElement.contains(event.target as Node);
    if (!clickedOnButton && !clickedInDropdown) {
      this.isLoginDropdownOpen.set(false);
    }
  }

  ngOnInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.isLoginDropdownOpen.set(false);
    });
  }
}