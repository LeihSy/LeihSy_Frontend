import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-filled-button',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule
  ],
  template: `
    <button
      pButton
      [icon]="icon"
      [label]="label"
      [class]="buttonClass"
      (click)="handleClick()">
    </button>
  `,
})
export class FilledButtonComponent {
  @Input() label = 'Button';
  @Input() icon = '';
  @Input() color: 'primary' | 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'gray' = 'primary';
  @Output() buttonClick = new EventEmitter<void>();

  get buttonClass(): string {
    const baseClasses = 'font-semibold shadow-sm transition-all duration-200 hover:scale-102';

    switch (this.color) {
      case 'blue':
        return `${baseClasses} bg-blue-600 hover:bg-blue-700 text-white border-blue-600 hover:border-blue-700`;
      case 'green':
        return `${baseClasses} bg-green-600 hover:bg-green-700 text-white border-green-600 hover:border-green-700`;
      case 'red':
        return `${baseClasses} bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700`;
      case 'yellow':
        return `${baseClasses} bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-500 hover:border-yellow-600`;
      case 'purple':
        return `${baseClasses} bg-purple-600 hover:bg-purple-700 text-white border-purple-600 hover:border-purple-700`;
      case 'gray':
        return `${baseClasses} bg-gray-600 hover:bg-gray-700 text-white border-gray-600 hover:border-gray-700`;
      case 'primary':
      default:
        return `${baseClasses} bg-[#253359] hover:bg-[#000066] text-white border-[#253359] hover:border-[#000066]`;
    }
  }

  handleClick(): void {
    this.buttonClick.emit();
  }
}

