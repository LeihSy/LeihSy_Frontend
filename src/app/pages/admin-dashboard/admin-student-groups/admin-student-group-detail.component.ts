import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { GroupService } from '../../../services/group.service';
import { Group } from '../../../models/group.model';
import { TableComponent, ColumnDef } from '../../../components/table/table.component';
import { BackButtonComponent } from '../../../components/back-button/back-button.component';
import { UserService } from '../../../services/user.service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { debounceTime, Subject } from 'rxjs';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, CardModule, ButtonModule, DialogModule, InputTextModule, InputNumberModule, TableComponent, BackButtonComponent, ToastModule, ConfirmDialogModule],
  templateUrl: './admin-student-group-detail.component.html',
  styleUrls: ['./admin-student-group-detail.component.scss'],
  providers: [MessageService, ConfirmationService]
})
export class AdminStudentGroupDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly groupService = inject(GroupService);
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  private readonly confirmation = inject(ConfirmationService);

  group = signal<Group | undefined>(undefined);
  loading = signal(false);
  error = signal<string | undefined>(undefined);

  members = signal<{ userId: number; userName: string; owner?: boolean }[]>([]);

  memberColumns: ColumnDef[] = [
    { field: 'userId', header: 'User ID', type: 'number' },
    { field: 'userName', header: 'Name' },
    { field: 'owner', header: 'Owner', type: 'badge' }
  ];

  // dialog state for adding a member
  addMemberDialog = signal(false);
  newMemberId = signal<number | null>(null);
  adding = signal(false);
  addError = signal<string | undefined>(undefined);

  // Benutzer-Vorschau
  userPreview = signal<{ name: string; email: string } | null>(null);
  loadingPreview = signal(false);
  private userIdChange$ = new Subject<number>();

  // Getter für ngModel binding
  get currentNewMemberId() {
    return this.newMemberId();
  }

  set currentNewMemberId(value: number | null) {
    this.newMemberId.set(value);
    // Trigger Vorschau-Laden
    if (value && value >= 0) {
      this.userIdChange$.next(value);
    } else {
      this.userPreview.set(null);
    }
  }

  get dialogVisible() {
    return this.addMemberDialog();
  }

  set dialogVisible(value: boolean) {
    this.addMemberDialog.set(value);
  }

  constructor() {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : Number.NaN;
    if (Number.isNaN(id)) {
      this.error.set('Ungültige Gruppen-ID');
    } else {
      this.load(id);
    }

    // Setup debounced user preview
    this.userIdChange$.pipe(
      debounceTime(500)
    ).subscribe(userId => {
      this.loadUserPreview(userId);
    });
  }

  loadUserPreview(userId: number) {
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

  load(id: number) {
    this.loading.set(true);
    this.groupService.getGroupById(id).subscribe({
      next: (g) => {
        this.group.set(g);
        this.members.set(g.members?.map(m => ({ userId: m.userId, userName: m.userName, owner: m.owner })) || []);
      },
      error: (e) => { console.error(e); this.error.set('Fehler beim Laden der Gruppe'); },
      complete: () => { this.loading.set(false); }
    });
  }

  openAddMember() {
    this.addError.set(undefined);
    this.newMemberId.set(null);
    this.userPreview.set(null);
    this.addMemberDialog.set(true);
  }

  onAddMember() {
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

  delete() {
    const currentGroup = this.group();
    if (!currentGroup) return;
    this.confirmation.confirm({
      message: `Gruppe "${currentGroup.name}" wirklich löschen?`,
      accept: () => {
        this.groupService.deleteGroup(currentGroup.id).subscribe({
          next: () => { void this.router.navigate(['/admin/groups']); this.messageService.add({ severity: 'success', summary: 'Gelöscht', detail: 'Gruppe gelöscht' }); },
          error: (e) => { console.error(e); this.messageService.add({ severity: 'error', summary: 'Fehler', detail: 'Konnte Gruppe nicht löschen' }); }
        });
      }
    });
  }

  onRemoveMember(row: any) {
    const currentGroup = this.group();
    if (!currentGroup) return;
    const userId = Number(row.userId);
    this.confirmation.confirm({
      message: `Mitglied "${row.userName}" aus Gruppe "${currentGroup.name}" entfernen?`,
      accept: () => {
        this.groupService.removeMember(currentGroup.id, userId).subscribe({
          next: () => {
            // refresh members
            this.load(currentGroup.id);
            this.messageService.add({ severity: 'success', summary: 'Entfernt', detail: 'Mitglied entfernt' });
          },
          error: (_) => { console.error('removeMember error'); this.messageService.add({ severity: 'error', summary: 'Fehler', detail: 'Mitglied konnte nicht entfernt werden' }); }
        });
      }
    });
  }

  goBack() { void this.router.navigate(['/admin/groups']); }
  edit() {
    const currentGroup = this.group();
    if (currentGroup) void this.router.navigate(['/admin/groups', currentGroup.id, 'edit']);
  }
}
