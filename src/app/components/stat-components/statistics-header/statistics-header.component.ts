import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-statistics-header',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './statistics-header.component.html'
})
export class StatisticsHeaderComponent {
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() showRefreshButton: boolean = true;
  @Input() onRefresh: () => void = () => {};
}
