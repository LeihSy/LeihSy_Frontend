import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-item-header',
  standalone: true,
  imports: [
    CommonModule,
    TagModule
  ],
  template: `
    <div class="bg-white border border-gray-200 rounded-lg p-6">
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <h1 class="text-3xl font-bold text-[#253359] mb-2">
            {{ invNumber }}
          </h1>
          <p class="text-lg text-gray-600 mb-4">{{ productName }}</p>
          <div class="flex items-center gap-3">
            <p-tag
              [value]="statusLabel"
              [severity]="statusSeverity"
              class="text-base font-medium px-3 py-1.5">
            </p-tag>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ItemHeaderComponent {
  @Input() invNumber = '';
  @Input() productName = '';
  @Input() statusLabel = '';
  @Input() statusSeverity: 'success' | 'danger' | 'info' | 'secondary' | 'warn' | 'contrast' = 'info';
}

