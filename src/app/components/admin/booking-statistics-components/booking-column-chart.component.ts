import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { RankingListComponent, ProductRanking } from '../../stat-components/ranking-list/ranking-list.component';

@Component({
  selector: 'app-booking-column-chart',
  standalone: true,
  imports: [CommonModule, CardModule, ChartModule, RankingListComponent],
  template: `
    <p-card class="h-full shadow-sm border border-gray-100">
      <div class="flex items-center gap-3 mb-6">
        <i class="pi pi-star text-xl text-[#253359]"></i>
        <h2 class="text-xl font-bold text-gray-800">Top 10 Produkte</h2>
      </div>

      <div class="p-4 bg-gray-50 rounded-xl">
        <p-chart
          type="bar"
          [data]="chartData"
          [options]="chartOptions"
          [style]="{ height: '300px' }">
        </p-chart>
      </div>

      <div class="mt-6">
        <app-ranking-list [rankings]="topProducts"></app-ranking-list>
      </div>
    </p-card>
  `
})
export class BookingColumnChartComponent {
  @Input() chartData: any;
  @Input() chartOptions: any;
  @Input() topProducts: ProductRanking[] = [];
}

