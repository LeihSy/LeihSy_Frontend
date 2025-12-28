import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';

export interface InfoItem {
  icon: string;
  label: string;
  value: string;
}

@Component({
  selector: 'app-info-card',
  standalone: true,
  imports: [
    CommonModule,
    CardModule
  ],
  templateUrl: './info-card.component.html',
  styleUrls: ['./info-card.component.scss']
})
export class InfoCardComponent {
  @Input() header = '';
  @Input() items: InfoItem[] = [];
}

