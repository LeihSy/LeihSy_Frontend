import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface StatusStat {
  statusName: string;
  count: number;
  color: string;
}

@Component({
  selector: 'app-stats-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stats-table.component.html'
})
export class StatsTableComponent {
  @Input() stats: StatusStat[] = [];
  @Input() totalCount: number = 0;
}
