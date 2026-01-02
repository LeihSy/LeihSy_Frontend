import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableComponent, ColumnDef } from '../../components/table/table.component';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { Group } from '../../models/group.model';
import { PageHeaderComponent } from '../../components/page-header/page-header.component';

@Component({
  selector: 'app-user-groups',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, TableComponent, PageHeaderComponent],
  templateUrl: './user-groups.component.html',
  styleUrls: ['./user-groups.component.scss']
})
export class UserGroupsComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  groups = signal<Group[]>([]);
  loading = signal(false);
  error = signal<string | undefined>(undefined);

  columns: ColumnDef[] = [
    { field: 'name', header: 'Gruppenname', sortable: true },
    { field: 'description', header: 'Beschreibung' },
    { field: 'memberCount', header: 'Mitglieder', type: 'number' },
    { field: 'createdAt', header: 'Erstellt am', type: 'datetime' }
  ];

  ngOnInit() {
    this.loadGroups();
  }

  loadGroups() {
    this.loading.set(true);
    this.error.set(undefined);

    // Hole aktuelle User ID
    const userId = this.authService.getUserId();

    if (userId) {
      this.userService.getUserGroups(userId).subscribe({
        next: (data) => {
          this.groups.set(data);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Fehler beim Laden der Gruppen:', err);
          this.error.set('Fehler beim Laden der Gruppen');
          this.loading.set(false);
        }
      });
    } else {
      this.error.set('Benutzer-ID nicht gefunden');
      this.loading.set(false);
    }
  }

  onRowSelect(group: Group) {
    // Navigation zur Gruppendetailseite
    void this.router.navigate(['/user-dashboard/groups', group.id]);
  }

  goBack() {
    void this.router.navigate(['/user-dashboard']);
  }
}

