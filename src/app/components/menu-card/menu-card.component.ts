import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-menu-card',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CardModule,
    ButtonModule
  ],
  templateUrl: './menu-card.component.html',
  styleUrls: ['./menu-card.component.scss']
})
export class MenuCardComponent {
  @Input() header = '';
  @Input() description = '';
  @Input() buttonLabel = '';
  @Input() routerLink?: string;
  @Input() disabled = false;
  @Input() icon?: string; // Optional: PrimeNG Icon
  @Input() iconClass?: string; // Optional: Custom Icon Classes
}

