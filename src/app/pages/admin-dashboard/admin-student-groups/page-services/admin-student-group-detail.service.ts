import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { debounceTime, Subject } from 'rxjs';
import { GroupService } from '../../../../services/group.service';
import { UserService } from '../../../../services/user.service';
import { Group } from '../../../../models/group.model';
import { InfoFieldItem } from '../../../../components/admin/info-field/info-field.component';
import { UserPreview } from '../../../../components/admin/add-member-dialog/add-member-dialog.component';
import { MessageService, ConfirmationService } from 'primeng/api';

@Injectable()
export class AdminStudentGroupDetailService {
  private readonly groupService = inject(GroupService);
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  private readonly confirmation = inject(ConfirmationService);

  group = signal<Group | undefined>(undefined);
  loading = signal(false);
  error = signal<string | undefined>(undefined);
  members = signal<{ userId: number; userName: string; owner?: boolean }[]>([]);

  // Dialog state for adding a member
  addMemberDialog = signal(false);
  newMemberId = signal<number | null>(null);
  adding = signal(false);
  addError = signal<string | undefined>(undefined);

  // Benutzer-Vorschau
  userPreview = signal<UserPreview | null>(null);
  loadingPreview = signal(false);
  userIdChange$ = new Subject<number>();

  // Computed signal für Gruppeninformationen
  groupInfoItems = computed<InfoFieldItem[]>(() => {
    const currentGroup = this.group();
    if (!currentGroup) return [];

    const items: InfoFieldItem[] = [
      { label: 'Gruppen-ID', value: currentGroup.id },
      { label: 'Anzahl Mitglieder', value: this.members().length }
    ];

    if (currentGroup.budget !== undefined && currentGroup.budget !== null) {
      items.push({
        label: 'Budget',
        value: currentGroup.budget,
        type: 'currency',
        className: 'text-green-600'
      });
    }

    items.push({
      label: 'Beschreibung',
      value: currentGroup.description || 'Keine Beschreibung vorhanden',
      fullWidth: true
    });

    if (currentGroup.createdAt) {
      items.push({ label: 'Erstellt am', value: currentGroup.createdAt, type: 'date' });
    }

    if (currentGroup.updatedAt) {
      items.push({ label: 'Zuletzt aktualisiert', value: currentGroup.updatedAt, type: 'date' });
    }

    return items;
  });

  constructor() {
    // Setup debounced user preview
    this.userIdChange$.pipe(
      debounceTime(500)
    ).subscribe(userId => {
      this.loadUserPreview(userId);
    });
  }

  loadUserPreview(userId: number): void {
    if (!userId || userId < 0) {
      this.userPreview.set(null);
      return;
    }

    this.loadingPreview.set(true);
    this.addError.set(undefined);

    this.userService.getUserById(userId).subscribe({
      next: (user) => {
        this.userPreview.set({
          name: user.name || 'Unbekannt',
          email: user.uniqueId || 'Keine ID'
        });
        this.loadingPreview.set(false);
      },
      error: (_) => {
        this.userPreview.set(null);
        this.loadingPreview.set(false);
        this.addError.set('User-ID nicht gefunden');
      }
    });
  }

  load(id: number): void {
    this.loading.set(true);
    this.groupService.getGroupById(id).subscribe({
      next: (g) => {
        this.group.set(g);
        this.members.set(g.members?.map(m => ({ userId: m.userId, userName: m.userName, owner: m.owner })) || []);
      },
      error: (e) => {
        console.error(e);
        this.error.set('Fehler beim Laden der Gruppe');
      },
      complete: () => {
        this.loading.set(false);
      }
    });
  }

  openAddMember(): void {
    this.addError.set(undefined);
    this.newMemberId.set(null);
    this.userPreview.set(null);
    this.addMemberDialog.set(true);
  }

  addMember(): void {
    const currentGroup = this.group();
    if (!currentGroup) return;
    const memberId = this.newMemberId();

    if (!memberId || Number.isNaN(Number(memberId)) || memberId < 0) {
      this.addError.set('Bitte eine gültige User ID (>= 0) eingeben.');
      return;
    }

    if (!this.userPreview()) {
      this.addError.set('Benutzer nicht gefunden. Bitte gültige User-ID eingeben.');
      return;
    }

    this.adding.set(true);
    this.groupService.addMember(currentGroup.id, Number(memberId)).subscribe({
      next: () => {
        this.adding.set(false);
        this.addMemberDialog.set(false);
        this.load(currentGroup.id);
        this.messageService.add({ severity: 'success', summary: 'Erfolg', detail: 'Mitglied hinzugefügt' });
      },
      error: (e) => {
        console.error(e);
        this.addError.set('Fehler beim Hinzufügen des Mitglieds');
        this.adding.set(false);
        this.messageService.add({ severity: 'error', summary: 'Fehler', detail: 'Mitglied konnte nicht hinzugefügt werden' });
      }
    });
  }

  delete(): void {
    const currentGroup = this.group();
    if (!currentGroup) return;
    this.confirmation.confirm({
      message: `Gruppe "${currentGroup.name}" wirklich löschen?`,
      accept: () => {
        this.groupService.deleteGroup(currentGroup.id).subscribe({
          next: () => {
            void this.router.navigate(['/admin/groups']);
            this.messageService.add({ severity: 'success', summary: 'Gelöscht', detail: 'Gruppe gelöscht' });
          },
          error: (e) => {
            console.error(e);
            this.messageService.add({ severity: 'error', summary: 'Fehler', detail: 'Konnte Gruppe nicht löschen' });
          }
        });
      }
    });
  }

  removeMember(row: any): void {
    const currentGroup = this.group();
    if (!currentGroup) return;
    const userId = Number(row.userId);
    this.confirmation.confirm({
      message: `Mitglied "${row.userName}" aus Gruppe "${currentGroup.name}" entfernen?`,
      accept: () => {
        this.groupService.removeMember(currentGroup.id, userId).subscribe({
          next: () => {
            this.load(currentGroup.id);
            this.messageService.add({ severity: 'success', summary: 'Entfernt', detail: 'Mitglied entfernt' });
          },
          error: (_) => {
            console.error('removeMember error');
            this.messageService.add({ severity: 'error', summary: 'Fehler', detail: 'Mitglied konnte nicht entfernt werden' });
          }
        });
      }
    });
  }

  goBack(): void {
    void this.router.navigate(['/admin/groups']);
  }

  edit(): void {
    const currentGroup = this.group();
    if (currentGroup) void this.router.navigate(['/admin/groups', currentGroup.id, 'edit']);
  }

  triggerUserPreview(userId: number): void {
    if (userId && userId >= 0) {
      this.userIdChange$.next(userId);
    } else {
      this.userPreview.set(null);
    }
  }
}

