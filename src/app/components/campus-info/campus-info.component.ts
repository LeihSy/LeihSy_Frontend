import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Device } from '../../interfaces/device.model';

// type von device.model.ts bekommen
type CampusData = Device['campusAvailability'][0];

@Component({
  selector: 'app-campus-info',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="campusData" class="bg-gray-50 rounded-lg p-3 sm:p-4">
      <div class="flex items-start gap-2">
                    <i class="pi pi-map-marker w-4 h-4 mt-0.5 text-muted-foreground shrink-0 "></i>
        <div class="text-xs sm:text-sm">
          <p class="text-muted-foreground text-[#253359]">Standort:</p>
          <p class="wrap-break-words text-slate-800">{{ campusData.location }}</p>
        </div>
      </div>
    </div>
  `,
})
export class CampusInfoComponent {
  @Input({ required: true }) campusData!: CampusData;
}
