import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimelineModule } from 'primeng/timeline';
import { CardModule } from 'primeng/card';

export interface TimelineEvent {
  status: string;
  description: string;
  date: string;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-booking-timeline',
  standalone: true,
  imports: [CommonModule, TimelineModule, CardModule],
  templateUrl: './booking-timeline.component.html'
})
export class BookingTimelineComponent {
  @Input() events: TimelineEvent[] = [];
  @Input() formatDateTime!: (date: string) => string;
}
