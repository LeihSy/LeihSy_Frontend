import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { GroupService } from '../../../../services/group.service';
import { Group } from '../../../../models/group.model';
import { ColumnDef } from '../../../../components/table/table.component';

@Injectable()
export class AdminStudentGroupsPageService {
  private readonly groupService = inject(GroupService);
  private readonly router = inject(Router);

  // State
  groups = signal<Group[]>([]);
  loading = signal(false);

  // Table Configuration
  readonly columns: ColumnDef[] = [
    { field: 'name', header: 'Name', sortable: true },
    { field: 'description', header: 'Beschreibung' },
    { field: 'memberCount', header: 'Mitglieder', type: 'number' },
    { field: 'createdAt', header: 'Erstellt', type: 'datetime' }
  ];

  // Load Groups
  loadGroups(): void {
    this.loading.set(true);
    this.groupService.getGroups().subscribe({
      next: (data) => {
        this.groups.set(data);
      },
      error: (err) => {
        console.error('Fehler beim Laden der Gruppen:', err);
        this.loading.set(false);
      },
      complete: () => {
        this.loading.set(false);
      }
    });
  }

  // Delete Group
  deleteGroup(group: Group, onSuccess: () => void): void {
    if (!confirm(`Gruppe "${group.name}" wirklich löschen?`)) {
      return;
    }

    this.groupService.deleteGroup(group.id).subscribe({
      next: () => {
        onSuccess();
      },
      error: (e) => {
        console.error('Fehler beim Löschen:', e);
        alert('Fehler beim Löschen');
      }
    });
  }

  // Navigation
  navigateToNew(): void {
    void this.router.navigate(['/admin/groups/new']);
  }

  navigateToEdit(group: Group): void {
    void this.router.navigate(['/admin/groups', group.id, 'edit']);
  }

  navigateToDetail(group: Group): void {
    void this.router.navigate(['/admin/groups', group.id]);
  }
}

