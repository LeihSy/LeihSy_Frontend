import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-lender-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="lender-container">
      <div class="header">
        <h2>Verleiher-Dashboard</h2>
        <p class="subtitle">Nur sichtbar für Verleiher und Administratoren</p>
      </div>

      <div class="info-card success">
        <h3>Authentifizierung erfolgreich!</h3>
        <p>Du bist als <strong>{{ username }}</strong> eingeloggt.</p>
        <p>Deine Rollen: <strong>{{ userRoles.join(', ') }}</strong></p>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-content">
            <h3>Offene Anfragen</h3>
            <p class="stat-number">{{ openRequests }}</p>
            <p class="stat-label">Warten auf Bestätigung</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-content">
            <h3>Aktive Ausleihen</h3>
            <p class="stat-number">{{ activeRentals }}</p>
            <p class="stat-label">Aktuell ausgeliehen</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-content">
            <h3>Fällig heute</h3>
            <p class="stat-number">{{ dueTodayCount }}</p>
            <p class="stat-label">Rückgabe heute</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-content">
            <h3>Überfällig</h3>
            <p class="stat-number warning">{{ overdueCount }}</p>
            <p class="stat-label">Nicht zurückgegeben</p>
          </div>
        </div>
      </div>

      <div class="section">
        <h3>Deine Berechtigungen</h3>
        <div class="permissions-grid">
          <div class="permission-card" [class.active]="canManageItems">
            <span class="icon">{{ canManageItems ? '✅' : '❌' }}</span>
            <span>Gegenstände verwalten</span>
          </div>
          <div class="permission-card" [class.active]="canApproveRequests">
            <span class="icon">{{ canApproveRequests ? '✅' : '❌' }}</span>
            <span>Anfragen bestätigen/ablehnen</span>
          </div>
          <div class="permission-card" [class.active]="canViewAllRentals">
            <span class="icon">{{ canViewAllRentals ? '✅' : '❌' }}</span>
            <span>Alle Ausleihen einsehen</span>
          </div>
          <div class="permission-card" [class.active]="isAdmin">
            <span class="icon">{{ isAdmin ? '✅' : '❌' }}</span>
            <span>Admin-Funktionen</span>
          </div>
        </div>
      </div>

      <div class="section">
        <h3>Keycloak Token Info</h3>
        <div class="info-card">
          <pre>{{ tokenInfo }}</pre>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .lender-container {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .header {
      margin-bottom: 2rem;

      h2 {
        color: #012E58;
        margin: 0 0 0.5rem 0;
        font-size: 2rem;
      }

      .subtitle {
        color: #666;
        margin: 0;
        font-size: 1.1rem;
      }
    }

    .info-card {
      padding: 1.5rem;
      border-radius: 8px;
      margin-bottom: 2rem;
      border-left: 4px solid;

      h3 {
        margin: 0 0 1rem 0;
      }

      p {
        margin: 0.5rem 0;
        line-height: 1.6;
      }

      strong {
        color: #012E58;
      }

      code {
        background: rgba(0, 0, 0, 0.05);
        padding: 0.2rem 0.4rem;
        border-radius: 3px;
        font-family: monospace;
      }

      pre {
        background: rgba(0, 0, 0, 0.05);
        padding: 1rem;
        border-radius: 4px;
        overflow-x: auto;
        font-size: 0.875rem;
        line-height: 1.4;
      }

      &.success {
        background: #d4edda;
        border-color: #00A63E;

        h3 {
          color: #00A63E;
        }
      }

      &.info {
        background: #d1ecf1;
        border-color: #0c5460;

        h3 {
          color: #0c5460;
        }
      }
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: white;
      border-radius: 8px;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      display: flex;
      gap: 1rem;
      transition: transform 0.3s ease, box-shadow 0.3s ease;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      }

      .stat-icon {
        font-size: 2.5rem;
      }

      .stat-content {
        flex: 1;

        h3 {
          margin: 0 0 0.5rem 0;
          font-size: 1rem;
          color: #666;
        }

        .stat-number {
          font-size: 2rem;
          font-weight: bold;
          color: #012E58;
          margin: 0.5rem 0;

          &.warning {
            color: #C10007;
          }
        }

        .stat-label {
          margin: 0;
          font-size: 0.875rem;
          color: #999;
        }
      }
    }

    .section {
      margin-bottom: 2rem;

      h3 {
        color: #012E58;
        margin-bottom: 1rem;
      }
    }

    .permissions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
    }

    .permission-card {
      background: white;
      border: 2px solid #ddd;
      border-radius: 8px;
      padding: 1rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      transition: all 0.3s ease;

      .icon {
        font-size: 1.5rem;
      }

      span:not(.icon) {
        flex: 1;
        font-weight: 500;
        color: #666;
      }

      &.active {
        border-color: #00A63E;
        background: #f0fdf4;

        span:not(.icon) {
          color: #00A63E;
        }
      }
    }
  `]
})
export class LenderDashboardComponent implements OnInit {
  username = '';
  userRoles: string[] = [];
  tokenInfo = '';

  // Mock-Daten für Demo
  openRequests = 5;
  activeRentals = 12;
  dueTodayCount = 3;
  overdueCount = 2;

  // Berechtigungen
  canManageItems = false;
  canApproveRequests = false;
  canViewAllRentals = false;
  isAdmin = false;

  constructor(private authService: AuthService) {}

  async ngOnInit() {
    this.username = this.authService.getUsername();
    this.userRoles = this.authService.getRoles();

    // Berechtigungen setzen basierend auf Rollen
    this.canManageItems = this.authService.hasAnyRole(['lender', 'admin']);
    this.canApproveRequests = this.authService.hasAnyRole(['lender', 'admin']);
    this.canViewAllRentals = this.authService.hasAnyRole(['lender', 'admin']);
    this.isAdmin = this.authService.hasRole('admin');

    // Token Info für Debug
    this.tokenInfo = JSON.stringify({
      username: this.username,
      roles: this.userRoles,
      timestamp: new Date().toISOString()
    }, null, 2);

    console.log('Lender Dashboard geladen');
    console.log('User:', this.username);
    console.log('Rollen:', this.userRoles);
  }
}
