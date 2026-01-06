import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';

import { GroupService } from '../../../../services/group.service';
import { Group } from '../../../../models/group.model';
import { GroupInfoItem } from '../../../../components/user/group-info-card/group-info-card.component';
import { StatItem } from '../../../../components/user/group-stats-card/group-stats-card.component';
import { ColumnDef } from '../../../../components/table/table.component';

@Injectable()
export class UserGroupDetailService {
  private readonly groupService = inject(GroupService);
  private readonly router = inject(Router);

  group = signal<Group | undefined>(undefined);
  loading = signal(false);
  error = signal<string | undefined>(undefined);
  members = signal<{ userId: number; userName: string; owner?: boolean; ownerDisplay?: string }[]>([]);

  memberColumns: ColumnDef[] = [
    { field: 'userId', header: 'ID' },
    { field: 'userName', header: 'Name', sortable: true },
    { field: 'ownerDisplay', header: 'Gruppeneigentümer', type: 'badge' }
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

  loadGroup(id: number): void {
    this.loading.set(true);
    this.error.set(undefined);

    this.groupService.getGroupById(id).subscribe({
      next: (group) => {
        this.group.set(group);
        this.members.set(group.members?.map(m => ({
          userId: m.userId,
          userName: m.userName,
          userEmail: m.userEmail,
          owner: m.owner,
          ownerDisplay: m.owner === true ? 'Ja' : ''
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

  goBack(): void {
    void this.router.navigate(['/user-dashboard/groups']);
  }
}

