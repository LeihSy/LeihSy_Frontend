import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-export-buttons',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    TooltipModule
  ],
  templateUrl: './export-buttons.component.html',
  styleUrl: './export-buttons.component.scss'
})
export class ExportButtonsComponent {
  @Input() isLoading = false;

  @Output() exportPdf = new EventEmitter<void>();
  @Output() exportHtml = new EventEmitter<void>();
  @Output() refresh = new EventEmitter<void>();

  onExportPdf(): void {
    this.exportPdf.emit();
  }

  onExportHtml(): void {
    this.exportHtml.emit();
  }

  onRefresh(): void {
    this.refresh.emit();
  }
}

