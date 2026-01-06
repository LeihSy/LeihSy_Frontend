import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { GroupService } from '../../../services/group.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-user-group-join',
  standalone: true,
  imports: [CommonModule, ToastModule],
  providers: [MessageService],
  template: `
    <div class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <i class="pi pi-spin pi-spinner text-6xl text-blue-600 mb-4"></i>
        <h2 class="text-2xl font-semibold mb-2">Trete Gruppe bei...</h2>
        <p class="text-gray-600">Bitte warten</p>
      </div>
    </div>
    <p-toast position="bottom-right"></p-toast>
  `
})
export class UserGroupJoinComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly groupService = inject(GroupService);
  private readonly authService = inject(AuthService);
  private readonly messageService = inject(MessageService);

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const groupId = idParam ? Number(idParam) : null;

    if (!groupId) {
      this.messageService.add({
        severity: 'error',
        summary: 'Fehler',
        detail: 'Ungültige Gruppen-ID'
      });
      this.router.navigate(['/user-dashboard/groups']);
      return;
    }

    this.joinGroup(groupId);
  }

  joinGroup(groupId: number): void {
    const currentUserId = this.authService.getUserId();

    if (!currentUserId) {
      this.messageService.add({
        severity: 'error',
        summary: 'Fehler',
        detail: 'Benutzer nicht eingeloggt'
      });
      this.router.navigate(['/login']);
      return;
    }

    this.groupService.addMember(groupId, currentUserId).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Erfolg',
          detail: 'Sie sind der Gruppe erfolgreich beigetreten'
        });
        this.router.navigate(['/user-dashboard/groups', groupId]);
      },
      error: (err) => {
        console.error('Fehler beim Beitreten:', err);
        const errorMessage = err.error?.message || 'Konnte der Gruppe nicht beitreten';

        this.messageService.add({
          severity: 'error',
          summary: 'Fehler',
          detail: errorMessage
        });

        this.router.navigate(['/user-dashboard/groups', groupId]);
      }
    });
  }
}

