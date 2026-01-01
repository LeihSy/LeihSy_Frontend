import { Component, inject, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { GroupService } from '../../../services/group.service';
import { StudentGroupDTO, UpdateStudentGroupDTO } from '../../../models/group.model';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule, TextareaModule, ButtonModule, CardModule, ToastModule],
  templateUrl: './admin-student-group-edit.component.html',
  styleUrls: ['./admin-student-group-edit.component.scss'],
  providers: [MessageService]
})
export class AdminStudentGroupEditComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly groupService = inject(GroupService);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);

  model = signal<StudentGroupDTO | undefined>(undefined);
  saving = signal(false);
  error = signal<string | undefined>(undefined);

  // Getter für ngModel binding
  get currentModel() {
    return this.model();
  }

  constructor() {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : Number.NaN;
    if (Number.isNaN(id)) {
      this.error.set('Ungültige Gruppen-ID');
    } else {
      this.load(id);
    }
  }

  load(id: number) {
    this.groupService.getGroupById(id).subscribe({
      next: (g) => { this.model.set(g); },
      error: (e) => { console.error(e); this.error.set('Fehler beim Laden'); }
    });
  }

  save() {
    const currentModel = this.model();
    if (!currentModel) return;
    const payload: UpdateStudentGroupDTO = { name: currentModel.name, description: currentModel.description };
    this.saving.set(true);
    this.groupService.updateGroup(currentModel.id, payload).subscribe({
      next: () => {
        this.saving.set(false);
        void this.router.navigate(['/admin/groups', currentModel.id]);
        this.messageService.add({ severity: 'success', summary: 'Gespeichert', detail: 'Gruppe aktualisiert' });
      },
      error: (e) => {
        console.error(e);
        this.error.set('Fehler beim Speichern');
        this.saving.set(false);
        this.messageService.add({ severity: 'error', summary: 'Fehler', detail: 'Konnte Gruppe nicht speichern' });
      }
    });
  }

  cancel() { void this.router.navigate(['/admin/groups']); }
}
