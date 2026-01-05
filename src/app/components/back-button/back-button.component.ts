import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-back-button',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule
  ],
  template: `
    <button
      pButton
      icon="pi pi-arrow-left"
      [label]="label"
      class="p-button-text mb-4 !text-[#000080] font-medium hover:!bg-[#000080]/[0.04] focus:!ring-2 focus:!ring-[#000080]/20 shadow-none"
      (click)="handleClick()">
    </button>
  `,
})
export class BackButtonComponent {
  @Input() label = 'Zurück zur Übersicht';
  @Input() routerLink?: string;
  @Output() backClick = new EventEmitter<void>();

  constructor(private readonly router: Router) {}

  handleClick(): void {
    if (this.routerLink) {
      this.router.navigate([this.routerLink]);
    } else {
      this.backClick.emit();
    }
  }
}

