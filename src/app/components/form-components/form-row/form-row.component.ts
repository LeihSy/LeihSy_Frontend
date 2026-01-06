import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-form-row',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="columns === 1 ? 'grid gap-4' : 'grid md:grid-cols-' + columns + ' gap-4'">
      <ng-content></ng-content>
    </div>
  `
})
export class FormRowComponent {
  @Input() columns: number = 2;
}

