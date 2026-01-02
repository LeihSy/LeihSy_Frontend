import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RadioButtonModule } from 'primeng/radiobutton';

export interface RadioOption {
  label: string;
  value: any;
  id: string;
}

@Component({
  selector: 'app-radio-button-group',
  standalone: true,
  imports: [CommonModule, FormsModule, RadioButtonModule],
  templateUrl: './radio-button-group.component.html'
})
export class RadioButtonGroupComponent {
  @Input() label: string = '';
  @Input() required: boolean = false;
  @Input() options: RadioOption[] = [];
  @Input() name: string = 'radio-group';
  @Input() value: any;
  @Output() valueChange = new EventEmitter<any>();

  onRadioChange(newValue: any): void {
    this.value = newValue;
    this.valueChange.emit(newValue);
  }

  isSelected(optionValue: any): boolean {
    return this.value === optionValue;
  }
}

