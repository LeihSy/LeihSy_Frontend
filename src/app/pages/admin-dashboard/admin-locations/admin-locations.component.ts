import {Component, inject, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableComponent, ColumnDef } from '../../../components/table/table.component';
import { AdminLocationsPageService } from './page-services/admin-locations-page.service';
import { Location, LocationCreateDTO } from '../../../models/location.model';
import { FormsModule } from '@angular/forms';
import { FilledButtonComponent } from '../../../components/buttons/filled-button/filled-button.component';
import { PageHeaderComponent } from '../../../components/page-header/page-header.component';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';

@Component({
  selector: 'app-admin-locations',
  standalone: true,
  imports: [CommonModule, TableComponent, FormsModule, FilledButtonComponent, PageHeaderComponent, InputTextModule, ConfirmDialogModule, ToastModule],
  templateUrl: './admin-locations.component.html',
  styleUrls: [],
  providers: [ConfirmationService, MessageService, AdminLocationsPageService]
})
export class AdminLocationsComponent implements OnInit {
  public readonly pageService = inject(AdminLocationsPageService);

  // Expose page-page-page-page-services signals and properties via getters
  get locations() { return this.pageService.locations; }
  get isLoading() { return this.pageService.isLoading; }
  get newLocation() { return this.pageService.newLocation; }
  get columns() { return this.pageService.columns; }

  ngOnInit(): void {
    this.pageService.loadLocations();
  }

  create(): void {
    this.pageService.createLocation();
  }

  onRemove(row: Location): void {
    this.pageService.confirmDeleteLocation(row, () => {
      this.pageService.deleteLocation(row.id);
    });
  }

  onRowSelect(row: Location): void {
    this.pageService.navigateToDetails(row);
  }
}
