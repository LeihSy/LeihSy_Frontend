import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TableComponent, ColumnDef } from '../../../components/table/table.component';
import { BackButtonComponent } from '../../../components/buttons/back-button/back-button.component';
import { FilledButtonComponent } from '../../../components/buttons/filled-button/filled-button.component';
import { InfoCardGridComponent } from '../../../components/admin/info-card-grid/info-card-grid.component';
import { AddMemberDialogComponent } from '../../../components/admin/add-member-dialog/add-member-dialog.component';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { CardModule } from 'primeng/card';
import { AdminStudentGroupDetailService } from './page-services/admin-student-group-detail.service';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    TableComponent,
    BackButtonComponent,
    FilledButtonComponent,
    InfoCardGridComponent,
    AddMemberDialogComponent,
    ToastModule,
    ConfirmDialogModule
  ],
  templateUrl: './admin-student-group-detail.component.html',
  styleUrls: ['./admin-student-group-detail.component.scss'],
  providers: [MessageService, ConfirmationService, AdminStudentGroupDetailService]
})
export class AdminStudentGroupDetailComponent {
  private readonly route = inject(ActivatedRoute);
  readonly pageService = inject(AdminStudentGroupDetailService);

  memberColumns: ColumnDef[] = [
    { field: 'userId', header: 'User ID', type: 'number' },
    { field: 'userName', header: 'Name' },
    { field: 'owner', header: 'Eigentümer', type: 'badge' }
  ];

  // Getter für ngModel binding
  get currentNewMemberId() {
    return this.pageService.newMemberId();
  }

  set currentNewMemberId(value: number | null) {
    this.pageService.newMemberId.set(value);
    this.pageService.triggerUserPreview(value || 0);
  }

  get dialogVisible() {
    return this.pageService.addMemberDialog();
  }

  set dialogVisible(value: boolean) {
    this.pageService.addMemberDialog.set(value);
  }

  constructor() {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : Number.NaN;
    if (Number.isNaN(id)) {
      this.pageService.error.set('Ungültige Gruppen-ID');
    } else {
      this.pageService.load(id);
    }
  }

  onAddMember() {
    this.pageService.addMember();
  }

  delete() {
    this.pageService.delete();
  }

  onRemoveMember(row: any) {
    this.pageService.removeMember(row);
  }

  goBack() {
    this.pageService.goBack();
  }

  edit() {
    this.pageService.edit();
  }

  openAddMember() {
    this.pageService.openAddMember();
  }
}
