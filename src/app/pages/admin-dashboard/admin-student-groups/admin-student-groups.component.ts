import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FilledButtonComponent } from '../../../components/buttons/filled-button/filled-button.component';
import { TableComponent, ColumnDef } from '../../../components/table/table.component';
import { GroupService } from '../../../services/group.service';
import { Group } from '../../../models/group.model';

@Component({
  selector: 'app-admin-student-groups',
  standalone: true,
  imports: [CommonModule, FilledButtonComponent, TableComponent],
  templateUrl: './admin-student-groups.component.html',
  styleUrls: ['./admin-student-groups.component.scss']
})
export class AdminStudentGroupsComponent implements OnInit {
  private readonly groupService = inject(GroupService);
  private readonly router = inject(Router);

  groups = signal<Group[]>([]);
  loading = signal(false);

  columns: ColumnDef[] = [
    { field: 'name', header: 'Name', sortable: true },
    { field: 'description', header: 'Beschreibung' },
    { field: 'memberCount', header: 'Mitglieder', type: 'number' },
    { field: 'createdAt', header: 'Erstellt', type: 'datetime' }
  ];

  ngOnInit() {
    this.loadGroups();
  }

  loadGroups() {
    this.loading.set(true);
    this.groupService.getGroups().subscribe({
      next: (data) => this.groups.set(data),
      complete: () => this.loading.set(false)
    });
  }

  goToNew() {
    void this.router.navigate(['/admin/groups/new']);
  }

  onEdit(row: Group) {
    // implement edit behavior - navigate to edit page if exists
    void this.router.navigate(['/admin/groups', row.id, 'edit']);
  }

  onRemove(row: Group) {
    if (!confirm(`Gruppe "${row.name}" wirklich löschen?`)) return;
    this.groupService.deleteGroup(row.id).subscribe({
      next: () => this.loadGroups(),
      error: (e) => { console.error(e); alert('Fehler beim Löschen'); }
    });
  }

  onRowSelect(row: Group) {
    // navigate to detail page (not implemented) or show details
    void this.router.navigate(['/admin/groups', row.id]);
  }
}
