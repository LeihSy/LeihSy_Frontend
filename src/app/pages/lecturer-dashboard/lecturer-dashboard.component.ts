import { Component } from '@angular/core';

@Component({
  selector: 'app-lecturer-dashboard',
  standalone: true,
  template: `
    <div class="p-8">
      <h1 class="text-3xl font-bold">Lecturer Dashboard</h1>
      <p class="text-muted-foreground">
        Here, lecturers can accept, deny, and manage requests.
      </p>
    </div>
  `,
})
export class LecturerDashboardComponent {
  // Logic for managing requests will go here
}
