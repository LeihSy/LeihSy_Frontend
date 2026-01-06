import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-booking-message',
  standalone: true,
  imports: [CommonModule, CardModule],
  template: `
    @if (message) {
      <p-card
        header="Nachricht"
        class="shadow-sm border border-gray-200 overflow-hidden mt-4"
        [pt]="{
          header: { class: 'bg-gradient-to-br from-gray-50 to-gray-100 border-b-2 border-gray-200 font-semibold text-[#253359] p-4' }
        }">
        <div class="flex gap-4 p-4 bg-[#253359]/10 border-l-4 border-[#253359] rounded-r-lg">
          <i class="pi pi-comment text-[#253359]/60 mt-1 text-lg"></i>
          <p class="text-[#253359] text-sm leading-relaxed m-0 italic">
            "{{ message }}"
          </p>
        </div>
      </p-card>
    }
  `
})
export class BookingMessageComponent {
  @Input() message?: string;
}

