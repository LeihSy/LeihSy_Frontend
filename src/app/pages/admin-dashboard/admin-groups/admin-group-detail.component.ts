import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { GroupService } from '../../../services/group.service';
import { Group } from '../../../models/group.model';
import { TableComponent, ColumnDef } from '../../../components/table/table.component';
import { BackButtonComponent } from '../../../components/back-button/back-button.component';
import { UserService } from '../../../services/user.service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, CardModule, ButtonModule, DialogModule, InputTextModule, TableComponent, BackButtonComponent, ToastModule, ConfirmDialogModule],
  templateUrl: './admin-group-detail.component.html',
  styleUrls: ['./admin-group-detail.component.scss'],
  providers: [MessageService, ConfirmationService]
})
export class AdminGroupDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly groupService = inject(GroupService);
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  private readonly confirmation = inject(ConfirmationService);

  group?: Group;
  loading = false;
  error?: string;

  members: { userId: number; userName: string; owner?: boolean }[] = [];

  memberColumns: ColumnDef[] = [
    { field: 'userId', header: 'User ID', type: 'number' },
    { field: 'userName', header: 'Name' },
    { field: 'owner', header: 'Owner', type: 'badge' }
  ];

  // dialog state for adding a member
  addMemberDialog = false;
  newMemberId: number | null = null;
  adding = false;
  addError?: string;

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
    this.loading = true;
    this.groupService.getGroupById(id).subscribe({
      next: (g) => {
        this.group = g;
        this.members = g.members?.map(m => ({ userId: m.userId, userName: m.userName, owner: m.owner })) || [];
      },
      error: (e) => { console.error(e); this.error = 'Fehler beim Laden der Gruppe'; },
      complete: () => { this.loading = false; }
    });
  }

  openAddMember() {
    this.addError = undefined;
    this.newMemberId = null;
    this.addMemberDialog = true;
  }

  onAddMember() {
    if (!this.group) return;
    if (!this.newMemberId || Number.isNaN(Number(this.newMemberId))) {
      this.addError = 'Bitte eine gültige User ID eingeben.';
      return;
    }

    this.adding = true;
    // first verify user exists
    this.userService.getUserById(Number(this.newMemberId)).subscribe({
      next: (_) => {
        // add
        this.groupService.addMember(this.group!.id, Number(this.newMemberId)).subscribe({
          next: () => {
            this.adding = false;
            this.addMemberDialog = false;
            this.load(this.group!.id);
            this.messageService.add({ severity: 'success', summary: 'Erfolg', detail: 'Mitglied hinzugefügt' });
          },
          error: (e) => {
            console.error(e);
            this.addError = 'Fehler beim Hinzufügen des Mitglieds';
            this.adding = false;
            this.messageService.add({ severity: 'error', summary: 'Fehler', detail: 'Mitglied konnte nicht hinzugefügt werden' });
          }
        });
      },
      error: (_) => {
        this.adding = false;
        this.addError = 'User-ID nicht gefunden';
        this.messageService.add({ severity: 'warn', summary: 'Nicht gefunden', detail: 'User-ID existiert nicht' });
      }
    });
  }

  delete() {
    if (!this.group) return;
    this.confirmation.confirm({
      message: `Gruppe "${this.group.name}" wirklich löschen?`,
      accept: () => {
        this.groupService.deleteGroup(this.group!.id).subscribe({
          next: () => { void this.router.navigate(['/admin/groups']); this.messageService.add({ severity: 'success', summary: 'Gelöscht', detail: 'Gruppe gelöscht' }); },
          error: (e) => { console.error(e); this.messageService.add({ severity: 'error', summary: 'Fehler', detail: 'Konnte Gruppe nicht löschen' }); }
        });
      }
    });
  }

  onRemoveMember(row: any) {
    if (!this.group) return;
    const userId = Number(row.userId);
    this.confirmation.confirm({
      message: `Mitglied "${row.userName}" aus Gruppe "${this.group.name}" entfernen?`,
      accept: () => {
        this.groupService.removeMember(this.group!.id, userId).subscribe({
          next: () => {
            // refresh members
            this.load(this.group!.id);
            this.messageService.add({ severity: 'success', summary: 'Entfernt', detail: 'Mitglied entfernt' });
          },
          error: (_) => { console.error('removeMember error'); this.messageService.add({ severity: 'error', summary: 'Fehler', detail: 'Mitglied konnte nicht entfernt werden' }); }
        });
      }
    });
  }

  goBack() { void this.router.navigate(['/admin/groups']); }
  edit() { if (this.group) void this.router.navigate(['/admin/groups', this.group.id, 'edit']); }
}
