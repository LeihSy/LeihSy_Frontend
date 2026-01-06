import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilledButtonComponent } from '../../../components/buttons/filled-button/filled-button.component';
import { PageHeaderComponent } from '../../../components/page-header/page-header.component';
import { TableComponent } from '../../../components/table/table.component';
import { Group } from '../../../models/group.model';
import { AdminStudentGroupsPageService } from './page-services/admin-student-groups-page.service';

@Component({
  selector: 'app-admin-student-groups',
  standalone: true,
  imports: [CommonModule, FilledButtonComponent, PageHeaderComponent, TableComponent],
  templateUrl: './admin-student-groups.component.html',
  styleUrls: ['./admin-student-groups.component.scss'],
  providers: [AdminStudentGroupsPageService]
})
export class AdminStudentGroupsComponent implements OnInit {
  private readonly pageService = inject(AdminStudentGroupsPageService);

  // Expose service properties via getters
  get groups() { return this.pageService.groups; }
  get loading() { return this.pageService.loading; }
  get columns() { return this.pageService.columns; }

  ngOnInit(): void {
    this.pageService.loadGroups();
  }

  loadGroups(): void {
    this.pageService.loadGroups();
  }

  goToNew(): void {
    this.pageService.navigateToNew();
  }

  onEdit(row: Group): void {
    this.pageService.navigateToEdit(row);
  }

  onRemove(row: Group): void {
    this.pageService.deleteGroup(row, () => this.loadGroups());
  }

  onRowSelect(row: Group): void {
    this.pageService.navigateToDetail(row);
  }
}
