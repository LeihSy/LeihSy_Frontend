import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { GroupService } from '../../../services/group.service';
import { AuthService } from '../../../services/auth.service';
import { GroupCreateDTO } from '../../../models/group.model';
import { GroupFormCardComponent } from '../../../components/admin/group-form-card/group-form-card.component';

@Component({
  standalone: true,
  imports: [CommonModule, GroupFormCardComponent, ToastModule],
  providers: [MessageService],
  templateUrl: './user-group-form.component.html'
})
export class UserGroupFormComponent implements OnInit {
  private readonly groupService = inject(GroupService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);

  model = signal<GroupCreateDTO & { ownerId?: number }>({ name: '', description: '', ownerId: 0 });
  saving = signal(false);
  error = signal<string | undefined>(undefined);

  ngOnInit(): void {
    const currentUserId = this.authService.getUserId();
    if (currentUserId) {
      this.model.update(m => ({ ...m, ownerId: currentUserId }));
    }
  }

  get currentModel() {
    return this.model();
  }

  save() {
    const currentModel = this.model();
    if (!currentModel.name || currentModel.name.length < 2) {
      this.error.set('Name zu kurz');
      this.messageService.add({
        severity: 'warn',
        summary: 'Validierung',
        detail: 'Der Gruppenname muss mindestens 2 Zeichen lang sein'
      });
      return;
    }

    this.saving.set(true);
    this.groupService.createGroup(currentModel).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Erfolg',
          detail: 'Gruppe wurde erstellt'
        });
        void this.router.navigate(['/user-dashboard/groups']);
      },
      error: (err) => {
        console.error('Fehler beim Speichern:', err);
        this.error.set('Fehler beim Speichern');
        this.messageService.add({
          severity: 'error',
          summary: 'Fehler',
          detail: 'Gruppe konnte nicht erstellt werden'
        });
        this.saving.set(false);
      }
    });
  }

  cancel() {
    void this.router.navigate(['/user-dashboard/groups']);
  }
}

