import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-lender-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CardModule,
    ButtonModule
  ],
  templateUrl: './lender-dashboard.component.html',
  styleUrls: ['./lender-dashboard.component.scss']
})
export class LenderDashboardComponent {
  // Logic for managing requests will go here
}

