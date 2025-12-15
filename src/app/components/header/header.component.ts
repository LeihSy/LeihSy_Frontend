import { Component, Input, inject } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { AsyncPipe } from '@angular/common';

import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';
import { BadgeModule } from 'primeng/badge';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    NgClass,
    ButtonModule,
    DrawerModule,
    BadgeModule,
    AsyncPipe,
  ],
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  @Input() cartCount: number = 0;

  authService = inject(AuthService);
  cartService = inject(CartService);

  mobileMenuOpen = false;

  // Auto-Updatender Cart Count aus Service
  cartCount$ = this.cartService.itemCount$;

  // Expose userRole for template
  userRole() {
    return this.authService.userRole();
  }

  // Get user-friendly role label
  getUserRoleLabel(): string {
    if (this.authService.isAdmin()) {
      return 'Administrator';
    }
    if (this.authService.isLender()) {
      return 'Verleiher';
    }
    return 'Student';
  }

  onLogout() {
    this.authService.logout();
  }
}
