import { Component } from '@angular/core';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  template: `
    <div class="p-8">
      <h1 class="text-3xl font-bold">Admin Dashboard</h1>
      <p class="text-muted-foreground">This page will show the admin (staff) dashboard.</p>
    </div>
  `,
})
export class AdminDashboardComponent {
  //  admin dashboard logik hier einfügen
}
