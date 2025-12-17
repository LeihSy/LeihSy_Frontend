import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DeviceIconPipe } from '../../pipes/device-icon.pipe';

export interface Device {
  id: number;
  name: string;
  category: string;
  description: string;
  availability: {
    available: number;
    total: number;
  };
  loanConditions: {
    loanPeriod: string;
  };
  location: string;
  availableItems: number;
  imageUrl: string | null;
}

@Component({
  selector: 'app-device-card',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    TagModule,
    DeviceIconPipe
  ],
  templateUrl: './device-card.component.html',
  styleUrls: ['./device-card.component.scss']
})
export class DeviceCardComponent {
  @Input() device!: Device;
  @Input() imageUrl: string | null = null;

  @Output() viewDevice = new EventEmitter<number>();
  @Output() imageError = new EventEmitter<{event: Event, device: Device}>();

  onViewDevice(): void {
    this.viewDevice.emit(this.device.id);
  }

  onImageError(event: Event): void {
    this.imageError.emit({ event, device: this.device });
  }
}

