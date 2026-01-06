import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TableComponent, ColumnDef } from '../../../components/table/table.component';
import { FilledButtonComponent } from '../../../components/buttons/filled-button/filled-button.component';
import { PageHeaderComponent } from '../../../components/page-header/page-header.component';
import { QrScannerComponent } from '../../../components/qr-scanner/qr-scanner.component';
import { GroupService } from '../../../services/group.service';
import { UserService } from '../../../services/user.service';
import { AuthService } from '../../../services/auth.service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { Group } from '../../../models/group.model';

@Component({
  selector: 'app-user-groups',
  standalone: true,
  imports: [
    CommonModule,
    PageHeaderComponent,
    TableComponent,
    FilledButtonComponent,
    QrScannerComponent,
    ToastModule,
    ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './user-groups.component.html',
  styleUrls: ['./user-groups.component.scss']
})
export class UserGroupsComponent implements OnInit {
  private readonly groupService = inject(GroupService);
  private readonly userService = inject(UserService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  groups = signal<Group[]>([]);
  loading = signal(false);
  error = signal<string | undefined>(undefined);
  scannerVisible = signal(false);

  columns = signal<ColumnDef[]>([
    { field: 'name', header: 'Gruppenname', sortable: true },
    { field: 'description', header: 'Beschreibung' },
    { field: 'memberCount', header: 'Mitglieder', type: 'number', sortable: true },
    { field: 'createdAt', header: 'Erstellt am', type: 'datetime', sortable: true }
  ]);

  ngOnInit() {
    this.loadGroups();
  }

  loadGroups() {
    this.loading.set(true);
    this.error.set(undefined);

    const userId = this.authService.getUserId();

    if (userId) {
      this.userService.getUserGroups(userId).subscribe({
        next: (data) => {
          const groupsWithCount = data.map(group => ({
            ...group,
            memberCount: group.members?.length || 0
          }));
          this.groups.set(groupsWithCount);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Fehler beim Laden der Gruppen:', err);
          this.error.set('Fehler beim Laden der Gruppen');
          this.messageService.add({
            severity: 'error',
            summary: 'Fehler',
            detail: 'Gruppen konnten nicht geladen werden'
          });
          this.loading.set(false);
        }
      });
    } else {
      this.error.set('Benutzer-ID nicht gefunden');
      this.loading.set(false);
    }
  }

  goToNew(): void {
    this.router.navigate(['/user-dashboard/groups/new']);
  }

  onEdit(group: any): void {
    const currentUserId = this.authService.getUserId();
    const isAdmin = this.authService.getRoles().includes('admin');

    if (group.createdById === currentUserId || isAdmin) {
      this.router.navigate(['/user-dashboard/groups', group.id, 'edit']);
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'Keine Berechtigung',
        detail: 'Nur der Gruppenbesitzer kann die Gruppe bearbeiten'
      });
    }
  }

  onRemove(group: any): void {
    const currentUserId = this.authService.getUserId();
    const isAdmin = this.authService.getRoles().includes('admin');

    if (group.createdById !== currentUserId && !isAdmin) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Keine Berechtigung',
        detail: 'Nur der Gruppenbesitzer kann die Gruppe löschen'
      });
      return;
    }

    this.confirmationService.confirm({
      message: `Möchten Sie die Gruppe "${group.name}" wirklich löschen?`,
      header: 'Gruppe löschen',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Löschen',
      rejectLabel: 'Abbrechen',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary',
      accept: () => {
        this.groupService.deleteGroup(group.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Erfolg',
              detail: 'Gruppe wurde gelöscht'
            });
            this.loadGroups();
          },
          error: (err) => {
            console.error('Fehler beim Löschen:', err);
            this.messageService.add({
              severity: 'error',
              summary: 'Fehler',
              detail: 'Gruppe konnte nicht gelöscht werden'
            });
          }
        });
      }
    });
  }

  onRowSelect(group: Group) {
    this.router.navigate(['/user-dashboard/groups', group.id]);
  }

  // Scanner öffnen um Gruppe beizutreten
  openScanner() {
    this.scannerVisible.set(true);
  }

  onScanned(value: string) {
    console.log('QR-Code gescannt:', value);

    // Extrahiere Group-ID aus gescanntem URL
    const match = value.match(/\/groups\/(\d+)\/join$/);
    if (match && match[1]) {
      const scannedGroupId = Number(match[1]);
      this.joinGroupByQr(scannedGroupId);
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Ungültiger QR-Code',
        detail: 'Dieser QR-Code gehört nicht zu einer Gruppe'
      });
    }
    this.scannerVisible.set(false);
  }

  joinGroupByQr(scannedGroupId: number) {
    const currentUserId = this.authService.getUserId();
    if (!currentUserId) {
      this.messageService.add({
        severity: 'error',
        summary: 'Fehler',
        detail: 'Benutzer nicht eingeloggt'
      });
      return;
    }

    this.groupService.addMember(scannedGroupId, currentUserId).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Erfolg',
          detail: 'Sie sind der Gruppe beigetreten'
        });

        // Liste neu laden und zur Gruppe navigieren
        this.loadGroups();
        this.router.navigate(['/user-dashboard/groups', scannedGroupId]);
      },
      error: (err) => {
        console.error('Fehler beim Beitreten:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Fehler',
          detail: err.error?.message || 'Konnte der Gruppe nicht beitreten'
        });
      }
    });
  }

  canModifyGroup(group: any): boolean {
    const currentUserId = this.authService.getUserId();
    const isAdmin = this.authService.getRoles().includes('admin');
    return group.createdById === currentUserId || isAdmin;
  }

  goBack() {
    this.router.navigate(['/user-dashboard']);
  }
}

