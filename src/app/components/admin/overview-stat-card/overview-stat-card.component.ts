import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-overview-stat-card',
  standalone: true,
  imports: [CommonModule, CardModule],
  templateUrl: './overview-stat-card.component.html'
})
export class OverviewStatCardComponent {
  @Input() icon: string = 'pi pi-chart-bar';
  @Input() iconColor: string = '#000080';
  @Input() value: number = 0;
  @Input() label: string = '';
}
