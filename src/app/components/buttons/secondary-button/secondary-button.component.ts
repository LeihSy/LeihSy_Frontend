import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-secondary-button',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ButtonModule,
    TooltipModule
  ],
  template: `
    <button
      pButton
      [icon]="icon"
      [label]="label"
      [class]="buttonClass"
      [routerLink]="routerLink"
      [pTooltip]="tooltip"
      (click)="handleClick()">
    </button>
  `,
})
export class SecondaryButtonComponent {
  @Input() label = '';
  @Input() icon = '';
  @Input() tooltip = '';
  @Input() routerLink?: string | any[];
  @Input() color: 'gray' | 'blue' | 'green' | 'red' | 'yellow' | 'purple' = 'gray';
  @Output() buttonClick = new EventEmitter<void>();

  get buttonClass(): string {
    const baseClasses = 'p-button-outlined shadow-sm transition-all duration-200 hover:scale-105';

    switch (this.color) {
      case 'blue':
        return `${baseClasses} !border-blue-300 !text-blue-600 hover:!bg-blue-50 hover:!border-blue-400`;
      case 'green':
        return `${baseClasses} !border-green-300 !text-green-600 hover:!bg-green-50 hover:!border-green-400`;
      case 'red':
        return `${baseClasses} !border-red-300 !text-red-600 hover:!bg-red-50 hover:!border-red-400`;
      case 'yellow':
        return `${baseClasses} !border-yellow-300 !text-yellow-600 hover:!bg-yellow-50 hover:!border-yellow-400`;
      case 'purple':
        return `${baseClasses} !border-purple-300 !text-purple-600 hover:!bg-purple-50 hover:!border-purple-400`;
      case 'gray':
      default:
        return `${baseClasses} !border-gray-300 !text-gray-700 hover:!bg-gray-50 hover:!border-gray-400`;
    }
  }

  handleClick(): void {
    if (!this.routerLink) {
      this.buttonClick.emit();
    }
  }
}

