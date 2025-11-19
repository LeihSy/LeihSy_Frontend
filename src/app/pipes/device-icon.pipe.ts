import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'deviceIcon',
  standalone: true,
})
export class DeviceIconPipe implements PipeTransform {
  transform(category: string | undefined | null): string {
    if (!category) return '📦';

    switch (category.toLowerCase()) {
      case 'vr-geräte':
      case 'vr geräte':
        return '🥽';
      case 'kameras':
        return '📷';
      case 'audio-equipment':
      case 'audio equipment':
        return '🎙️';
      case 'licht-equipment':
      case 'lichtset equipment':
        return '💡';
      case 'kamera-zubehör':
      case 'kamera zubehör':
        return '🎥';
      default:
        return '📦';
    }
  }
}
