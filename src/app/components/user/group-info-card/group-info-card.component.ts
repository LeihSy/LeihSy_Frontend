import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';

export interface GroupInfoItem {
  label: string;
  value: string | number | null | undefined;
}

@Component({
  selector: 'app-group-info-card',
  standalone: true,
  imports: [CommonModule, CardModule],
  template: `
    <p-card [header]="header">
      <div class="space-y-4">
        @for (item of items; track item.label) {
          <div>
            <p class="text-sm text-gray-500 mb-1">{{ item.label }}</p>
            <p class="font-medium">{{ item.value }}</p>
          </div>
        }
      </div>
    </p-card>
  `
})
export class GroupInfoCardComponent {
  @Input() header = '';
  @Input() items: GroupInfoItem[] = [];
}

