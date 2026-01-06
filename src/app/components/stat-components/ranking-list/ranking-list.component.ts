import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ProductRanking {
  productId: number;
  productName: string;
  count: number;
}

@Component({
  selector: 'app-ranking-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ranking-list.component.html'
})
export class RankingListComponent {
  @Input() rankings: ProductRanking[] = [];
}
