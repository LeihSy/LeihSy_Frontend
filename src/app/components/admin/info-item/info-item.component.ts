import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface InfoItem {
  icon: string;
  iconColor?: string;
  label: string;
  value: string;
}

@Component({
  selector: 'app-info-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './info-item.component.html'
})
export class InfoItemComponent {
  @Input() icon: string = 'pi pi-info-circle';
  @Input() iconColor: string = 'text-[#000080]';
  @Input() label: string = '';
  @Input() value: string = '';
}

