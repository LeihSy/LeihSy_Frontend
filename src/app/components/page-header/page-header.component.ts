import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilledButtonComponent } from '../buttons/filled-button/filled-button.component';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule, FilledButtonComponent],
  templateUrl: './page-header.component.html'
})
export class PageHeaderComponent {
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() buttonLabel: string = '';
  @Input() buttonIcon: string = 'pi pi-plus';
  @Input() showButton: boolean = true;
  @Output() buttonClick = new EventEmitter<void>();

  onButtonClick(): void {
    this.buttonClick.emit();
  }
}
