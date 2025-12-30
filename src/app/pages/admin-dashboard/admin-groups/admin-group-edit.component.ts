import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { GroupService } from '../../../services/group.service';
import { StudentGroupDTO, UpdateStudentGroupDTO } from '../../../models/group.model';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule, TextareaModule, ButtonModule, CardModule],
  templateUrl: './admin-group-edit.component.html',
  styleUrls: ['./admin-group-edit.component.scss']
})
export class AdminGroupEditComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly groupService = inject(GroupService);
  private readonly router = inject(Router);

  model?: StudentGroupDTO;
  saving = false;
  error?: string;

  constructor() {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : Number.NaN;
    if (Number.isNaN(id)) {
      this.error = 'Ungültige Gruppen-ID';
    } else {
      this.load(id);
    }
  }

  load(id: number) {
    this.groupService.getGroupById(id).subscribe({
      next: (g) => { this.model = g; },
      error: (e) => { console.error(e); this.error = 'Fehler beim Laden'; }
    });
  }

  save() {
    if (!this.model) return;
    const payload: UpdateStudentGroupDTO = { name: this.model.name, description: this.model.description };
    this.saving = true;
    this.groupService.updateGroup(this.model.id, payload).subscribe({
      next: () => { this.router.navigate(['/admin/groups', this.model!.id]); },
      error: (e) => { console.error(e); this.error = 'Fehler beim Speichern'; this.saving = false; }
    });
  }

  cancel() { this.router.navigate(['/admin/groups']); }
}
