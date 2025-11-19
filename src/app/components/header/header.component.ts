import { Component, Input, inject } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

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
  ],
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  @Input() cartCount: number = 0;

  authService = inject(AuthService);
  mobileMenuOpen = false;

  // Expose userRole for template
  userRole() {
    return this.authService.userRole();
  }

  // Get user-friendly role label
  getUserRoleLabel(): string {
    const role = this.authService.userRole();
    switch (role) {
      case 'admin':
        return 'Administrator';
      case 'lender':
        return 'Verleiher';
      case 'user':
        return 'Student';
      default:
        return 'Nutzer';
    }
  }

  onLogout() {
    this.authService.logout();
  }
}
