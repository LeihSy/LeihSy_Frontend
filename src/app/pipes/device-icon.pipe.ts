import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'deviceIcon',
  standalone: true
})
export class DeviceIconPipe implements PipeTransform {
  transform(category: string | undefined | null): string {
    if (!category) return '📦'; // Fallback wenn category undefined/null ist

    const categoryLower = category.toLowerCase();

    if (categoryLower.includes('vr')) return '🥽';
    if (categoryLower.includes('foto') || categoryLower.includes('kamera')) return '📷';
    if (categoryLower.includes('it') || categoryLower.includes('computer')) return '💻';
    if (categoryLower.includes('audio') || categoryLower.includes('mikrofon')) return '🎤';

    return '📦'; // Default
  }
}
