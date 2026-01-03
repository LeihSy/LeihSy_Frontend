import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-detail-card',
  standalone: true,
  imports: [
    CommonModule,
    CardModule
  ],
  template: `
    <p-card [header]="header" class="border border-gray-200">
      <ng-content></ng-content>
    </p-card>
  `
})
export class DetailCardComponent {
  @Input() header = '';
}

