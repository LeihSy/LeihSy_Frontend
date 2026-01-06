import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { QRCodeComponent } from 'angularx-qrcode';
import { BackButtonComponent } from '../../../components/buttons/back-button/back-button.component';
import { FilledButtonComponent } from '../../../components/buttons/filled-button/filled-button.component';
import { TableComponent, ColumnDef } from '../../../components/table/table.component';
import { InfoCardGridComponent } from '../../../components/admin/info-card-grid/info-card-grid.component';
import { QrScannerComponent } from '../../../components/qr-scanner/qr-scanner.component';
import { GroupService } from '../../../services/group.service';
import { AuthService } from '../../../services/auth.service';
import { StudentGroupDTO } from '../../../models/group.model';

@Component({
  selector: 'app-user-group-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    DialogModule,
    QRCodeComponent,
    BackButtonComponent,
    FilledButtonComponent,
    TableComponent,
    InfoCardGridComponent,
    QrScannerComponent,
    ToastModule,
    ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './user-group-detail.component.html',
  styleUrls: ['./user-group-detail.component.scss']
})
export class UserGroupDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly groupService = inject(GroupService);
  private readonly authService = inject(AuthService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  group = signal<StudentGroupDTO | undefined>(undefined);
  loading = signal(false);
  error = signal<string | undefined>(undefined);
  groupId: number | null = null;

  members = signal<{ userId: number; userName: string; owner?: string }[]>([]);

  showQrCodeDialog = signal(false);
  qrCodeValue = signal<string>('');

  scannerVisible = signal(false);

  memberColumns: ColumnDef[] = [
    { field: 'userId', header: 'User ID', type: 'number' },
    { field: 'userName', header: 'Name' },
    { field: 'owner', header: 'Eigentümer', type: 'badge' }
  ];

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : Number.NaN;

    if (Number.isNaN(id)) {
      this.error.set('Ungültige Gruppen-ID');
      this.messageService.add({
        severity: 'error',
        summary: 'Fehler',
        detail: 'Ungültige Gruppen-ID'
      });
    } else {
      this.groupId = id;
      this.loadGroup(id);
    }
  }

  loadGroup(id: number) {
    this.loading.set(true);
    this.groupService.getGroupById(id).subscribe({
      next: (group) => {
        this.group.set(group);

        this.members.set(group.members?.map(m => ({
          userId: m.userId,
          userName: m.userName,
          owner: m.owner ? 'Ja' : ''
        })) || []);

        this.loading.set(false);
      },
      error: (err) => {
        console.error('Fehler beim Laden:', err);
        this.error.set('Fehler beim Laden der Gruppe');
        this.messageService.add({
          severity: 'error',
          summary: 'Fehler',
          detail: 'Gruppe konnte nicht geladen werden'
        });
        this.loading.set(false);
      }
    });
  }

  canModify(): boolean {
    const currentGroup = this.group();
    if (!currentGroup) return false;

    const currentUserId = this.authService.getUserId();
    const isAdmin = this.authService.getRoles().includes('admin');
    return currentGroup.createdById === currentUserId || isAdmin;
  }

  showQrCode() {
    const currentGroup = this.group();
    if (!currentGroup) return;

    const joinUrl = `${window.location.origin}/user-dashboard/groups/${currentGroup.id}/join`;
    this.qrCodeValue.set(joinUrl);
    this.showQrCodeDialog.set(true);
  }

  closeQrCodeDialog() {
    this.showQrCodeDialog.set(false);
  }

  openScanner() {
    this.scannerVisible.set(true);
  }

  onScanned(value: string) {
    console.log('QR-Code gescannt:', value);

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

        // Wenn es die aktuelle Gruppe ist, neu laden
        if (this.groupId === scannedGroupId) {
          this.loadGroup(scannedGroupId);
        } else {
          // Zur gescannten Gruppe navigieren
          this.router.navigate(['/user-dashboard/groups', scannedGroupId]);
        }
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

  onRemoveMember(member: any) {
    const currentGroup = this.group();
    if (!currentGroup) return;

    if (!this.canModify()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Keine Berechtigung',
        detail: 'Nur der Gruppenbesitzer kann Mitglieder entfernen'
      });
      return;
    }

    this.confirmationService.confirm({
      message: `Möchten Sie ${member.userName} aus der Gruppe entfernen?`,
      header: 'Mitglied entfernen',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Entfernen',
      rejectLabel: 'Abbrechen',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary',
      accept: () => {
        this.groupService.removeMember(currentGroup.id, member.userId).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Erfolg',
              detail: 'Mitglied wurde entfernt'
            });
            this.loadGroup(currentGroup.id);
          },
          error: (err) => {
            console.error('Fehler beim Entfernen:', err);
            this.messageService.add({
              severity: 'error',
              summary: 'Fehler',
              detail: 'Mitglied konnte nicht entfernt werden'
            });
          }
        });
      }
    });
  }

  edit() {
    if (this.groupId && this.canModify()) {
      this.router.navigate(['/user-dashboard/groups', this.groupId, 'edit']);
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'Keine Berechtigung',
        detail: 'Nur der Gruppenbesitzer kann die Gruppe bearbeiten'
      });
    }
  }

  delete() {
    const currentGroup = this.group();
    if (!currentGroup) return;

    if (!this.canModify()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Keine Berechtigung',
        detail: 'Nur der Gruppenbesitzer kann die Gruppe löschen'
      });
      return;
    }

    this.confirmationService.confirm({
      message: `Möchten Sie die Gruppe "${currentGroup.name}" wirklich löschen?`,
      header: 'Gruppe löschen',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Löschen',
      rejectLabel: 'Abbrechen',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary',
      accept: () => {
        this.groupService.deleteGroup(currentGroup.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Erfolg',
              detail: 'Gruppe wurde gelöscht'
            });
            this.router.navigate(['/user-dashboard/groups']);
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

  goBack() {
    this.router.navigate(['/user-dashboard/groups']);
  }
}

