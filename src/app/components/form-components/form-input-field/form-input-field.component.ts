import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-form-input-field',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './form-input-field.component.html'
})
export class FormInputFieldComponent {
  @Input() label: string = '';
  @Input() required: boolean = false;
  @Input() fullWidth: boolean = false;
}
