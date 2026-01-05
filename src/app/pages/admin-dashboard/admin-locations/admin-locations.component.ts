import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableComponent, ColumnDef } from '../../../components/table/table.component';
import { AdminLocationsService } from './admin-locations.service';
import { Location, LocationCreateDTO } from '../../../models/location.model';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-locations',
  standalone: true,
  imports: [CommonModule, TableComponent, FormsModule, ButtonModule, InputTextModule, ConfirmDialogModule, ToastModule],
  templateUrl: './admin-locations.component.html',
  styleUrls: [],
  providers: [ConfirmationService, MessageService, AdminLocationsService]
})
export class AdminLocationsComponent implements OnInit {
  columns: ColumnDef[] = [];
  newLocation: LocationCreateDTO = { roomNr: '' };

  // expose service signals via getters to avoid using pageService before it's initialized
  get locations() { return this.pageService.locations; }
  get isLoading() { return this.pageService.isLoading; }

  private router = inject(Router);

  constructor(private readonly pageService: AdminLocationsService) {}

  ngOnInit(): void {
    this.columns = [
      { field: 'id', header: 'ID', width: '80px', type: 'number' },
      { field: 'roomNr', header: 'Raumnummer' },
      { field: 'createdAt', header: 'Erstellt', type: 'datetime' },
      { field: 'updatedAt', header: 'Aktualisiert', type: 'datetime' }
    ];

    this.pageService.loadLocations();
  }

  create(): void {
    if (!this.newLocation.roomNr) return;
    this.pageService.create(this.newLocation as Partial<Location>).subscribe({
      next: () => {
        this.newLocation = { roomNr: '' };
      },
      error: (err) => console.error('Fehler beim Erstellen', err)
    });
  }

  onRemove(row: Location): void {
    this.pageService.confirmDeleteLocation(row, () => {
      this.pageService.deleteLocation(row.id).subscribe({
        next: () => {
          // nothing else needed, service signal already updated
        },
        error: (err) => console.error('Fehler beim Löschen', err)
      });
    });
  }

  onRowSelect(row: Location): void {
    this.router.navigate(['/admin', 'locations', row.id]);
  }
}
