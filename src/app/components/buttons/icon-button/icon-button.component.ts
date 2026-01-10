import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-icon-button',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    TooltipModule
  ],
  template: `
    <button
      pButton
      type="button"
      [icon]="icon"
      [class]="buttonClass"
      [pTooltip]="tooltip"
      [disabled]="disabled"
      (click)="handleClick()">
    </button>
  `,
})
export class IconButtonComponent {
  @Input() icon = 'pi pi-plus';
  @Input() tooltip = '';
  @Input() disabled = false;
  @Input() color: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' = 'primary';
  @Output() buttonClick = new EventEmitter<void>();

  get buttonClass(): string {
    const baseClasses = 'p-button-outlined p-button-sm transition-all duration-200 hover:scale-105';

    switch (this.color) {
      case 'primary':
        return `${baseClasses} !border-[#253359] !text-[#253359] hover:!bg-[#253359]/10 hover:!border-[#1f2847]`;
      case 'secondary':
        return `${baseClasses} !border-gray-400 !text-gray-700 hover:!bg-gray-50 hover:!border-gray-500`;
      case 'success':
        return `${baseClasses} !border-green-500 !text-green-600 hover:!bg-green-50 hover:!border-green-600`;
      case 'danger':
        return `${baseClasses} !border-red-500 !text-red-600 hover:!bg-red-50 hover:!border-red-600`;
      case 'warning':
        return `${baseClasses} !border-yellow-500 !text-yellow-600 hover:!bg-yellow-50 hover:!border-yellow-600`;
      case 'info':
        return `${baseClasses} !border-blue-500 !text-blue-600 hover:!bg-blue-50 hover:!border-blue-600`;
      default:
        return `${baseClasses} !border-[#253359] !text-[#253359] hover:!bg-[#253359]/10 hover:!border-[#1f2847]`;
    }
  }

  handleClick(): void {
    this.buttonClick.emit();
  }
}

