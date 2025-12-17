import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface UserStatCard {
  label: string;
  value: number;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-user-stats-cards',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      @for (stat of stats; track stat.label) {
        <div class="bg-white border border-gray-200 rounded-lg p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 mb-1">{{ stat.label }}</p>
              <p class="text-3xl font-bold" [ngClass]="stat.color">{{ stat.value }}</p>
            </div>
            <i [class]="'pi ' + stat.icon + ' text-4xl opacity-20'" [ngClass]="stat.color"></i>
          </div>
        </div>
      }
    </div>
  `
})
export class UserStatsCardsComponent {
  @Input() stats: UserStatCard[] = [];
}

