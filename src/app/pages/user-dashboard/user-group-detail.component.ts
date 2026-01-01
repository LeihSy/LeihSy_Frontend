import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableComponent, ColumnDef } from '../../components/table/table.component';
import { BackButtonComponent } from '../../components/back-button/back-button.component';
import { GroupService } from '../../services/group.service';
import { Group } from '../../models/group.model';

@Component({
  selector: 'app-user-group-detail',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, TableComponent, BackButtonComponent],
  templateUrl: './user-group-detail.component.html',
  styleUrls: ['./user-group-detail.component.scss']
})
export class UserGroupDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly groupService = inject(GroupService);
  private readonly router = inject(Router);

  group = signal<Group | undefined>(undefined);
  loading = signal(false);
  error = signal<string | undefined>(undefined);

  members = signal<{ userId: number; userName: string; userEmail: string; owner?: boolean }[]>([]);

  memberColumns: ColumnDef[] = [
    { field: 'userName', header: 'Name', sortable: true },
    { field: 'userEmail', header: 'E-Mail' },
    { field: 'owner', header: 'Owner', type: 'badge' }
  ];

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : Number.NaN;

    if (Number.isNaN(id)) {
      this.error.set('Ungültige Gruppen-ID');
    } else {
      this.loadGroup(id);
    }
  }

  loadGroup(id: number) {
    this.loading.set(true);
    this.error.set(undefined);

    this.groupService.getGroupById(id).subscribe({
      next: (group) => {
        this.group.set(group);
        this.members.set(group.members?.map(m => ({
          userId: m.userId,
          userName: m.userName,
          userEmail: m.userEmail,
          owner: m.owner
        })) || []);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Fehler beim Laden der Gruppe:', err);
        this.error.set('Fehler beim Laden der Gruppendetails');
        this.loading.set(false);
      }
    });
  }

  goBack() {
    void this.router.navigate(['/user-dashboard/groups']);
  }
}

