import { Component, inject } from '@angular/core';
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
  templateUrl: './admin-group-form.component.html'
})
export class AdminGroupFormComponent {
  private readonly groupService = inject(GroupService);
  private readonly router = inject(Router);

  model: GroupCreateDTO = { name: '', description: '' };
  saving = false;
  error?: string;

  save() {
    if (!this.model.name || this.model.name.length < 2) {
      this.error = 'Name zu kurz';
      return;
    }
    this.saving = true;
    this.groupService.createGroup(this.model).subscribe({
      next: () => { void this.router.navigate(['/admin/groups']); },
      error: () => { this.error = 'Fehler beim Speichern'; this.saving = false; }
    });
  }

  cancel() { this.router.navigate(['/admin/groups']); }
}
