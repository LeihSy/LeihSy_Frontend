import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BackButtonComponent } from '../../buttons/back-button/back-button.component';
import { PageHeaderComponent } from '../../page-header/page-header.component';
import { SecondaryButtonComponent } from '../../buttons/secondary-button/secondary-button.component';

@Component({
  selector: 'app-bookings-header',
  standalone: true,
  imports: [CommonModule, RouterModule, BackButtonComponent, PageHeaderComponent, SecondaryButtonComponent],
  template: `
    <header class="space-y-4">
      <div class="flex items-center">
        <app-back-button routerLink="/admin" class="hover:translate-x-[-4px] transition-transform duration-200"></app-back-button>
      </div>

      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <app-page-header
          title="Alle Buchungen verwalten"
          subtitle="Übersicht über alle Buchungen und Ausleihen im System">
        </app-page-header>

        <div class="flex items-center gap-3">
          <app-secondary-button
            icon="pi pi-chart-bar"
            label="Statistiken"
            routerLink="/admin/bookings/statistics"
            tooltip="Zu den Statistiken"
            color="custom">
          </app-secondary-button>
          <app-secondary-button
            icon="pi pi-refresh"
            label="Aktualisieren"
            (buttonClick)="onRefresh()"
            tooltip="Daten neu laden"
            color="custom">
          </app-secondary-button>
        </div>
      </div>
    </header>
  `
})
export class BookingsHeaderComponent {
  @Output() refresh = new EventEmitter<void>();

  onRefresh(): void {
    this.refresh.emit();
  }
}

