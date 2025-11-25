import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="unauthorized-container">
      <div class="error-card">
        <div class="icon">🚫</div>
        <h2>Zugriff verweigert</h2>
        <p>Du hast keine Berechtigung, diese Seite zu sehen.</p>
        <p class="info">Diese Seite ist nur für Verleiher und Administratoren zugänglich.</p>
        <a routerLink="/" class="btn-home">Zurück zur Startseite</a>
      </div>
    </div>
  `,
  styles: [`
    .unauthorized-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 60vh;
      padding: 2rem;
    }

    .error-card {
      background: white;
      border-radius: 8px;
      padding: 3rem;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
      text-align: center;
      max-width: 500px;

      .icon {
        font-size: 4rem;
        margin-bottom: 1rem;
      }

      h2 {
        color: #C10007;
        margin: 0 0 1rem 0;
        font-size: 2rem;
      }

      p {
        color: #666;
        margin: 0.5rem 0;
        line-height: 1.6;
      }

      .info {
        background: #f8f9fa;
        padding: 1rem;
        border-radius: 4px;
        margin: 1.5rem 0;
      }

      .btn-home {
        display: inline-block;
        background: #012E58;
        color: white;
        text-decoration: none;
        padding: 0.75rem 1.5rem;
        border-radius: 4px;
        margin-top: 1.5rem;
        transition: all 0.3s ease;

        &:hover {
          background: #00A63E;
          transform: translateY(-2px);
        }
      }
    }
  `]
})
export class UnauthorizedComponent {}
