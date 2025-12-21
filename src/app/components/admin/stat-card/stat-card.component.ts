import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule, CardModule],
  templateUrl: './stat-card.component.html'
})
export class StatCardComponent {
  @Input() icon: string = 'pi pi-info-circle';
  @Input() iconColor: string = 'text-blue-500';
  @Input() value: number = 0;
  @Input() label: string = '';
  @Input() isActive: boolean = false;
  @Output() cardClick = new EventEmitter<void>();

  onClick(): void {
    this.cardClick.emit();
  }
}
