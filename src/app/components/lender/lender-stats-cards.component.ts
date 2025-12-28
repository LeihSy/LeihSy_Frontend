import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface StatCard {
  label: string;
  value: number;
  icon: string;
  iconColor: string;
  valueColor: string;
}

@Component({
  selector: 'app-lender-stats-cards',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      @for (stat of stats; track stat.label) {
        <div class="bg-white border border-gray-200 rounded-lg p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">{{ stat.label }}</p>
              <p class="text-2xl font-bold" [ngClass]="stat.valueColor">{{ stat.value }}</p>
            </div>
            <i [class]="'pi ' + stat.icon + ' text-3xl opacity-20'" [ngClass]="stat.iconColor"></i>
          </div>
        </div>
      }
    </div>
  `
})
export class LenderStatsCardsComponent {
  @Input() stats: StatCard[] = [];
}

