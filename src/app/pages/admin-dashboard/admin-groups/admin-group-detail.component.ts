import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { GroupService } from '../../../services/group.service';
import { Group } from '../../../models/group.model';
import { BookingService } from '../../../services/booking.service';
import { Booking } from '../../../models/booking.model';
import { TableComponent, ColumnDef } from '../../../components/table/table.component';

@Component({
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, TableComponent],
  templateUrl: './admin-group-detail.component.html',
  styleUrls: ['./admin-group-detail.component.scss']
})
export class AdminGroupDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly groupService = inject(GroupService);
  private readonly bookingService = inject(BookingService);
  private readonly router = inject(Router);

  group?: Group;
  loading = false;
  error?: string;

  members: { userId: number; userName: string; userEmail?: string; owner?: boolean }[] = [];

  bookings: Booking[] = [];
  bookingsLoading = false;

  bookingColumns: ColumnDef[] = [
    { field: 'id', header: 'ID' },
    { field: 'userName', header: 'Student' },
    { field: 'productName', header: 'Produkt' },
    { field: 'itemInvNumber', header: 'Inventar-Nr.' },
    { field: 'status', header: 'Status', type: 'status' },
    { field: 'startDate', header: 'Start', type: 'date' },
    { field: 'endDate', header: 'Ende', type: 'date' }
  ];

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
        this.members = g.members?.map(m => ({ userId: m.userId, userName: m.userName, userEmail: m.userEmail, owner: m.owner })) || [];
        this.loadBookingsForGroup();
      },
      error: (e) => { console.error(e); this.error = 'Fehler beim Laden der Gruppe'; },
      complete: () => { this.loading = false; }
    });
  }

  private loadBookingsForGroup() {
    if (!this.group) return;
    const memberIds = new Set(this.members.map(m => m.userId));
    this.bookingsLoading = true;
    this.bookingService.getBookings().subscribe({
      next: (all) => {
        this.bookings = all.filter(b => memberIds.has(b.userId));
      },
      error: (e) => { console.error(e); },
      complete: () => { this.bookingsLoading = false; }
    });
  }

  goBack() { this.router.navigate(['/admin/groups']); }
  edit() { if (this.group) this.router.navigate(['/admin/groups', this.group.id, 'edit']); }

  delete() {
    if (!this.group) return;
    if (!confirm(`Gruppe "${this.group.name}" wirklich löschen?`)) return;
    this.groupService.deleteGroup(this.group.id).subscribe({
      next: () => this.router.navigate(['/admin/groups']),
      error: (e) => { console.error(e); alert('Fehler beim Löschen'); }
    });
  }
}
