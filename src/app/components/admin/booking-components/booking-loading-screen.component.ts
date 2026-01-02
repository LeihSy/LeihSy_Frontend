import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-booking-loading-screen',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col items-center justify-center py-32 bg-white rounded-2xl shadow-sm border border-gray-100">
      <div class="relative flex items-center justify-center">
        <i class="pi pi-spin pi-spinner text-5xl text-blue-700 opacity-25"></i>
        <i class="pi pi-spin pi-spinner-dotted text-5xl text-blue-700 absolute"></i>
      </div>
      <p class="mt-6 text-gray-500 font-medium animate-pulse">Lade Buchungsdetails...</p>
    </div>
  `
})
export class BookingLoadingScreenComponent {}
