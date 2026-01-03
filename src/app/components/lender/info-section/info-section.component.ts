import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface InfoSectionItem {
  label: string;
  value: string | number | null | undefined;
  type?: 'text' | 'tag' | 'image' | 'currency';
  tagSeverity?: 'success' | 'danger' | 'warning' | 'info';
}

@Component({
  selector: 'app-info-section',
  standalone: true,
  imports: [
    CommonModule
  ],
  template: `
    <div class="bg-white border border-gray-200 rounded-lg p-6">
      <h2 class="text-xl font-semibold text-[#253359] mb-4">{{ header }}</h2>

      <div class="space-y-3">
        @for (item of items; track item.label) {
          <div class="flex items-start">
            <span class="w-40 text-gray-600 font-medium">{{ item.label }}:</span>

            @if (item.type === 'tag') {
              <span class="flex-1">
                <ng-content select="[tag]"></ng-content>
              </span>
            } @else if (item.type === 'image' && item.value) {
              <div class="flex-1">
                <img [src]="item.value" [alt]="header"
                     class="max-w-full h-auto rounded border border-gray-300">
              </div>
            } @else if (item.type === 'currency') {
              <span class="flex-1">{{ item.value | currency:'EUR' }}</span>
            } @else {
              <span class="flex-1" [class.font-mono]="isMonospace(item.label)" [class.font-semibold]="isBold(item.label)">
                {{ item.value || 'N/A' }}
              </span>
            }
          </div>
        }
      </div>

      <!-- Custom Content Slot -->
      <ng-content></ng-content>
    </div>
  `
})
export class InfoSectionComponent {
  @Input() header = '';
  @Input() items: InfoSectionItem[] = [];

  isMonospace(label: string): boolean {
    return label.toLowerCase().includes('inventarnummer');
  }

  isBold(label: string): boolean {
    return label.toLowerCase().includes('produkt') ||
           label.toLowerCase().includes('inventarnummer') ||
           label.toLowerCase().includes('preis');
  }
}

