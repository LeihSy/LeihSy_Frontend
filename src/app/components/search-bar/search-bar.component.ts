import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    ButtonModule
  ],
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss']
})
export class SearchBarComponent {
  @Input() placeholder = 'Suche...';
  @Input() value = '';
  @Input() showClearButton = true;

  @Output() valueChange = new EventEmitter<string>();
  @Output() search = new EventEmitter<string>();

  onInputChange(value: string): void {
    this.valueChange.emit(value);
  }

  onClear(): void {
    this.valueChange.emit('');
  }

  onSearch(): void {
    this.search.emit(this.value);
  }
}

