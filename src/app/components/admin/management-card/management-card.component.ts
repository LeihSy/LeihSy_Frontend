import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { FilledButtonComponent } from '../../buttons/filled-button/filled-button.component';

@Component({
  selector: 'app-management-card',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    FilledButtonComponent
  ],
  template: `
    <p-card [header]="header">
      <div class="py-4">
        <div class="flex items-center gap-3 mb-4">
          <i [class]="'pi ' + icon + ' text-3xl text-primary'"></i>
          <p class="text-gray-600">{{ description }}</p>
        </div>

        <div class="flex flex-col gap-2">
          <app-filled-button
            [label]="buttonLabel"
            [icon]="buttonIcon"
            (buttonClick)="onButtonClick()"
            class="w-full">
          </app-filled-button>
        </div>
      </div>
    </p-card>
  `
})
export class ManagementCardComponent {
  @Input() header = '';
  @Input() icon = 'pi-tag';
  @Input() description = '';
  @Input() buttonLabel = '';
  @Input() buttonIcon = 'pi pi-plus-circle';
  @Output() buttonClick = new EventEmitter<void>();

  onButtonClick(): void {
    this.buttonClick.emit();
  }
}

