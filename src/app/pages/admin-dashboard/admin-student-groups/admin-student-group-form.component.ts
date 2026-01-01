import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { GroupService } from '../../../services/group.service';
import { GroupCreateDTO } from '../../../models/group.model';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule, TextareaModule, CardModule, ButtonModule],
  templateUrl: './admin-student-group-form.component.html'
})
export class AdminStudentGroupFormComponent {
  private readonly groupService = inject(GroupService);
  private readonly router = inject(Router);

  model = signal<GroupCreateDTO>({ name: '', description: '' });
  saving = signal(false);
  error = signal<string | undefined>(undefined);

  // Getter für ngModel binding
  get currentModel() {
    return this.model();
  }

  save() {
    const currentModel = this.model();
    if (!currentModel.name || currentModel.name.length < 2) {
      this.error.set('Name zu kurz');
      return;
    }
    this.saving.set(true);
    this.groupService.createGroup(currentModel).subscribe({
      next: () => { void this.router.navigate(['/admin/groups']); },
      error: () => { this.error.set('Fehler beim Speichern'); this.saving.set(false); }
    });
  }

  cancel() { void this.router.navigate(['/admin/groups']); }
}
