import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-validation-message',
  standalone: true,
  imports: [CommonModule],
  template: `
    <small [class]="getClasses()" class="mt-1 block">
      @if (isLoading) {
        <i class="pi pi-spin pi-spinner mr-1"></i>{{ loadingText || 'Lädt...' }}
      } @else if (isSuccess) {
        <i class="pi pi-check mr-1"></i>{{ message }}
      } @else if (isError) {
        <i class="pi pi-times mr-1"></i>{{ message }}
      } @else {
        {{ message }}
      }
    </small>
  `
})
export class ValidationMessageComponent {
  @Input() message: string = '';
  @Input() isLoading: boolean = false;
  @Input() isSuccess: boolean = false;
  @Input() isError: boolean = false;
  @Input() loadingText: string = 'Lädt...';

  getClasses(): string {
    if (this.isLoading) return 'text-gray-400';
    if (this.isSuccess) return 'text-green-600';
    if (this.isError) return 'text-red-600';
    return 'text-gray-600';
  }
}

