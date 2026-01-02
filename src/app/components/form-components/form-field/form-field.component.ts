import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-form-field',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="containerClass">
      <ng-content></ng-content>
    </div>
  `
})
export class FormFieldComponent {
  @Input() containerClass: string = '';
}
