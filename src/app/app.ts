// src/app/app.ts
import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})

export class App implements OnInit {
  title = 'LeihSy - Digitales Verleihsystem';
  isLoggedIn = false;
  username = '';
  userRoles: string[] = [];

  constructor(private authService: AuthService) {}

  async ngOnInit() {
    // Prüfe Login-Status
    this.isLoggedIn = await this.authService.isLoggedIn();

    if (this.isLoggedIn) {
      this.username = this.authService.getUsername();
      this.userRoles = this.authService.getRoles();

      console.log('User eingeloggt:', this.username);
      console.log('Rollen:', this.userRoles);
    }
  }

  login() {
    this.authService.login();
  }

  logout() {
    this.authService.logout();
  }

  isAdmin(): boolean {
    return this.authService.hasRole('admin');
  }

  isVerleiher(): boolean {
    return this.authService.hasAnyRole(['verleiher', 'admin']);
  }
}
