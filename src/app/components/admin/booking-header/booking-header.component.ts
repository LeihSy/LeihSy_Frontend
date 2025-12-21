import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-booking-header',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    TagModule
  ],
  templateUrl: './booking-header.component.html',
  styleUrls: ['./booking-header.component.scss']
})
export class BookingHeaderComponent {
  @Input() bookingId!: number;
  @Input() productName!: string;
  @Input() itemInvNumber!: string;
  @Input() status!: string;
  @Input() statusLabel!: string;
  @Input() statusSeverity: 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' | null = 'info';
}

