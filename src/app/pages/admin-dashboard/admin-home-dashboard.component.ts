import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { MenuCardComponent } from '../../components/menu-card/menu-card.component';
import { PageHeaderComponent } from '../../components/page-header/page-header.component';

@Component({
  selector: 'app-admin-home-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CardModule,
    ButtonModule,
    MenuCardComponent,
    PageHeaderComponent
  ],
  templateUrl: './admin-home-dashboard.component.html',
  styleUrls: ['./admin-home-dashboard.component.scss']
})
export class AdminHomeDashboardComponent {}
