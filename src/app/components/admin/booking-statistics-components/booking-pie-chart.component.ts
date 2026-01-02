import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';

interface StatusStat {
  statusName: string;
  count: number;
  color: string;
}

@Component({
  selector: 'app-booking-pie-chart',
  standalone: true,
  imports: [CommonModule, CardModule, ChartModule],
  template: `
    <p-card class="h-full shadow-sm border border-gray-100">
      <div class="flex items-center gap-3 mb-6">
        <i class="pi pi-chart-pie text-xl text-[#253359]"></i>
        <h2 class="text-xl font-bold text-gray-800">Buchungen nach Status</h2>
      </div>

      <div class="chart-container flex justify-center">
        <p-chart
          type="doughnut"
          [data]="chartData"
          [options]="chartOptions"
          [style]="{ width: '100%', maxWidth: '300px' }">
        </p-chart>
      </div>

      <div class="mt-8 border-t pt-4">
        <table class="w-full text-sm">
          <thead class="text-gray-400 text-left">
          <tr>
            <th class="pb-2 font-medium">Status</th>
            <th class="pb-2 text-center font-medium">Anzahl</th>
            <th class="pb-2 text-right font-medium">Anteil</th>
          </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            @for (stat of statusStats; track stat.statusName) {
              <tr>
                <td class="py-2 flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full" [style.background-color]="stat.color"></span>
                  {{ stat.statusName }}
                </td>
                <td class="py-2 text-center text-gray-600">{{ stat.count }}</td>
                <td class="py-2 text-right font-semibold">
                  {{ ((stat.count / totalBookings) * 100).toFixed(1) }}%
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </p-card>
  `
})
export class BookingPieChartComponent {
  @Input() chartData: any;
  @Input() chartOptions: any;
  @Input() statusStats: StatusStat[] = [];
  @Input() totalBookings: number = 1;
}

