import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingTimelineComponent, TimelineEvent } from '../../booking-components/booking-timeline/booking-timeline.component';

@Component({
  selector: 'app-booking-progress',
  standalone: true,
  imports: [CommonModule, BookingTimelineComponent],
  template: `
    <aside class="lg:col-span-1 mt-4">
      <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden sticky top-6">
        <div class="p-4 border-b border-gray-100 bg-gray-50/50">
          <h3 class="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
            <i class="pi pi-history text-[#253359]"></i>
            Buchungsverlauf
          </h3>
        </div>

        <div class="p-6">
          <app-booking-timeline
            [events]="timelineEvents"
            [formatDateTime]="formatDateTime">
          </app-booking-timeline>
        </div>
      </div>
    </aside>
  `
})
export class BookingProgressComponent {
  @Input({ required: true }) timelineEvents!: TimelineEvent[];
  @Input({ required: true }) formatDateTime!: (date: Date | string | null) => string;
}

