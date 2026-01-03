import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TableComponent, ColumnDef } from '../../../components/table/table.component';
import { BackButtonComponent } from '../../../components/buttons/back-button/back-button.component';
import { GroupInfoCardComponent, GroupInfoItem } from '../../../components/user/group-info-card/group-info-card.component';
import { GroupStatsCardComponent, StatItem } from '../../../components/user/group-stats-card/group-stats-card.component';
import { GroupMembersCardComponent } from '../../../components/user/group-members-card/group-members-card.component';
import { GroupService } from '../../../services/group.service';
import { Group } from '../../../models/group.model';

@Component({
  selector: 'app-user-group-detail',
  standalone: true,
  imports: [
    CommonModule,
    BackButtonComponent,
    GroupInfoCardComponent,
    GroupStatsCardComponent,
    GroupMembersCardComponent
  ],
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

  // Computed signals für Card-Daten
  groupInfoItems = computed<GroupInfoItem[]>(() => {
    const currentGroup = this.group();
    if (!currentGroup) return [];

    const items: GroupInfoItem[] = [
      { label: 'Gruppen-ID', value: currentGroup.id },
      { label: 'Beschreibung', value: currentGroup.description || 'Keine Beschreibung vorhanden' }
    ];

    if (currentGroup.createdAt) {
      items.push({ label: 'Erstellt am', value: new Date(currentGroup.createdAt).toLocaleString('de-DE') });
    }

    if (currentGroup.createdByName) {
      items.push({ label: 'Erstellt von', value: currentGroup.createdByName });
    }

    return items;
  });

  groupStats = computed<StatItem[]>(() => {
    const currentGroup = this.group();
    if (!currentGroup) return [];

    const stats: StatItem[] = [
      { icon: 'pi-users', label: 'Mitglieder', value: this.members().length, colorClass: 'bg-blue' }
    ];

    if (currentGroup.activeBookingsCount !== undefined) {
      stats.push({
        icon: 'pi-calendar',
        label: 'Aktive Buchungen',
        value: currentGroup.activeBookingsCount,
        colorClass: 'bg-green'
      });
    }

    if (currentGroup.budget !== undefined) {
      stats.push({
        icon: 'pi-wallet',
        label: 'Budget',
        value: new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(currentGroup.budget),
        colorClass: 'bg-purple'
      });
    }

    return stats;
  });

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

