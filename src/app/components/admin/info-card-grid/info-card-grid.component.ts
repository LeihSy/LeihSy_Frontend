import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { InfoFieldComponent, InfoFieldItem } from '../info-field/info-field.component';

@Component({
  selector: 'app-info-card-grid',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    InfoFieldComponent
  ],
  template: `
    <p-card [header]="header" class="mb-4">
      <div class="grid grid-cols-2 gap-4">
        @for (item of items; track item.label) {
          <app-info-field [item]="item"></app-info-field>
        }
      </div>
    </p-card>
  `
})
export class InfoCardGridComponent {
  @Input() header = '';
  @Input() items: InfoFieldItem[] = [];
}

