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
      class="p-button-text mb-4"
      (click)="handleClick()">
    </button>
  `,
  styles: [`
    :host {
      ::ng-deep .p-button-text {
        color: #000080 !important;
        font-weight: 500;

        &:hover {
          background-color: rgba(0, 0, 128, 0.04) !important;
        }

        &:focus {
          box-shadow: 0 0 0 0.2rem rgba(0, 0, 128, 0.2) !important;
        }
      }
    }
  `]
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

