import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { GroupService } from '../../../services/group.service';
import { AuthService } from '../../../services/auth.service';
import { StudentGroupDTO, UpdateStudentGroupDTO } from '../../../models/group.model';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { GroupFormCardComponent } from '../../../components/admin/group-form-card/group-form-card.component';

@Component({
  standalone: true,
  imports: [CommonModule, ToastModule, GroupFormCardComponent],
  templateUrl: './user-group-edit.component.html',
  providers: [MessageService]
})
export class UserGroupEditComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly groupService = inject(GroupService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);

  model = signal<StudentGroupDTO | undefined>(undefined);
  saving = signal(false);
  error = signal<string | undefined>(undefined);
  groupId: number | null = null;

  get currentModel() {
    return this.model() || { name: '', description: '', budget: 0 };
  }

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : Number.NaN;
    if (Number.isNaN(id)) {
      this.error.set('Ungültige Gruppen-ID');
      this.messageService.add({
        severity: 'error',
        summary: 'Fehler',
        detail: 'Ungültige Gruppen-ID'
      });
    } else {
      this.groupId = id;
      this.load(id);
    }
  }

  load(id: number) {
    this.groupService.getGroupById(id).subscribe({
      next: (g) => {
        // Prüfe ob User Owner ist oder Admin
        const currentUserId = this.authService.getUserId();
        const isAdmin = this.authService.getRoles().includes('admin');

        if (g.createdById !== currentUserId && !isAdmin) {
          this.error.set('Keine Berechtigung');
          this.messageService.add({
            severity: 'error',
            summary: 'Keine Berechtigung',
            detail: 'Nur der Gruppenbesitzer kann die Gruppe bearbeiten'
          });
          this.router.navigate(['/user-dashboard/groups']);
          return;
        }

        this.model.set(g);
      },
      error: (e) => {
        console.error(e);
        this.error.set('Fehler beim Laden');
        this.messageService.add({
          severity: 'error',
          summary: 'Fehler',
          detail: 'Gruppe konnte nicht geladen werden'
        });
      }
    });
  }

  save() {
    const currentModel = this.model();
    if (!currentModel) return;

    const payload: UpdateStudentGroupDTO = {
      name: currentModel.name,
      description: currentModel.description,
      budget: currentModel.budget
    };

    this.saving.set(true);
    this.groupService.updateGroup(currentModel.id, payload).subscribe({
      next: () => {
        this.saving.set(false);
        this.messageService.add({
          severity: 'success',
          summary: 'Gespeichert',
          detail: 'Gruppe wurde aktualisiert'
        });
        this.router.navigate(['/user-dashboard/groups', currentModel.id]);
      },
      error: (e) => {
        console.error(e);
        this.error.set('Fehler beim Speichern');
        this.saving.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Fehler',
          detail: 'Gruppe konnte nicht gespeichert werden'
        });
      }
    });
  }

  cancel() {
    if (this.groupId) {
      this.router.navigate(['/user-dashboard/groups', this.groupId]);
    } else {
      this.router.navigate(['/user-dashboard/groups']);
    }
  }
}

