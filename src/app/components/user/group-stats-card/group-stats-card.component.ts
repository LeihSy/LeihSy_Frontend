import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';

export interface StatItem {
  icon: string;
  label: string;
  value: string | number;
  colorClass: string;
}

@Component({
  selector: 'app-group-stats-card',
  standalone: true,
  imports: [CommonModule, CardModule],
  template: `
    <p-card [header]="header">
      <div class="space-y-4">
        @for (stat of stats; track stat.label) {
          <div class="flex items-center justify-between p-4 rounded-lg" [ngClass]="{
            'bg-blue-50': stat.colorClass === 'bg-blue',
            'bg-green-50': stat.colorClass === 'bg-green',
            'bg-purple-50': stat.colorClass === 'bg-purple',
            'bg-red-50': stat.colorClass === 'bg-red',
            'bg-yellow-50': stat.colorClass === 'bg-yellow'
          }">
            <div class="flex items-center gap-3">
              <i [class]="'pi ' + stat.icon + ' text-2xl'" [ngClass]="{
                'text-blue-600': stat.colorClass === 'bg-blue',
                'text-green-600': stat.colorClass === 'bg-green',
                'text-purple-600': stat.colorClass === 'bg-purple',
                'text-red-600': stat.colorClass === 'bg-red',
                'text-yellow-600': stat.colorClass === 'bg-yellow'
              }"></i>
              <div>
                <p class="text-sm text-gray-600">{{ stat.label }}</p>
                <p class="text-2xl font-bold" [ngClass]="{
                  'text-blue-600': stat.colorClass === 'bg-blue',
                  'text-green-600': stat.colorClass === 'bg-green',
                  'text-purple-600': stat.colorClass === 'bg-purple',
                  'text-red-600': stat.colorClass === 'bg-red',
                  'text-yellow-600': stat.colorClass === 'bg-yellow'
                }">{{ stat.value }}</p>
              </div>
            </div>
          </div>
        }
      </div>
    </p-card>
  `
})
export class GroupStatsCardComponent {
  @Input() header = 'Statistiken';
  @Input() stats: StatItem[] = [];
}

