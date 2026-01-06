import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface InfoFieldItem {
  label: string;
  value: string | number | null | undefined;
  type?: 'text' | 'currency' | 'date';
  fullWidth?: boolean;
  className?: string;
}

@Component({
  selector: 'app-info-field',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="item.fullWidth ? 'col-span-2' : ''">
      <p class="text-sm text-gray-500 mb-1">{{ item.label }}</p>
      @if (item.type === 'currency') {
        <p [class]="'font-medium ' + (item.className || '')">
          {{ item.value | currency:'EUR':'symbol':'1.2-2':'de' }}
        </p>
      } @else if (item.type === 'date') {
        <p class="font-medium">{{ item.value | date:'dd.MM.yyyy HH:mm' }}</p>
      } @else {
        <p class="font-medium">{{ item.value || 'Keine Angabe' }}</p>
      }
    </div>
  `
})
export class InfoFieldComponent {
  @Input() item!: InfoFieldItem;
}

