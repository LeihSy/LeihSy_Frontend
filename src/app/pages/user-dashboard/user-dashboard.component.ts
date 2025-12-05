import { Component } from '@angular/core';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  template: `
    <div class="p-8">
      <h1 class="text-3xl font-bold">User Dashboard</h1>
      <p class="text-muted-foreground">This page will show the user's dashboard.</p>
    </div>
  `,
})
export class UserDashboardComponent {
  // user dashboard logik hier einfügen
}
