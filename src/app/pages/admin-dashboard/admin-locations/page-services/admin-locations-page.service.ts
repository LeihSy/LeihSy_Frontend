import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { ConfirmationService, MessageService } from 'primeng/api';

import { Location, LocationCreateDTO } from '../../../../models/location.model';
import { LocationService } from '../../../../services/location.service';
import { ColumnDef } from '../../../../components/table/table.component';

@Injectable()
export class AdminLocationsPageService {
  private locationService = inject(LocationService);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  private router = inject(Router);

  // Signals for state
  locations = signal<Location[]>([]);
  isLoading = signal(false);
  newLocation = signal<LocationCreateDTO>({ roomNr: '' });

  // Table columns configuration
  readonly columns: ColumnDef[] = [
    { field: 'id', header: 'ID', width: '80px', type: 'number' },
    { field: 'roomNr', header: 'Raumnummer' },
    { field: 'createdAt', header: 'Erstellt', type: 'datetime' },
    { field: 'updatedAt', header: 'Aktualisiert', type: 'datetime' }
  ];

  // Load all locations and update signal
  loadLocations(): void {
    this.isLoading.set(true);
    this.locationService.getAllLocations().subscribe({
      next: (locs) => {
        this.locations.set(locs);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Fehler beim Laden der Locations:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Fehler',
          detail: 'Fehler beim Laden der Standorte.'
        });
        this.locations.set([]);
        this.isLoading.set(false);
      }
    });
  }

  // Create a location and append to signal
  createLocation(): void {
    const location = this.newLocation();
    if (!location.roomNr) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warnung',
        detail: 'Bitte geben Sie eine Raumnummer ein.'
      });
      return;
    }

    this.locationService.createLocation(location as Location).subscribe({
      next: (loc) => {
        this.locations.set([...this.locations(), loc]);
        this.newLocation.set({ roomNr: '' });
        this.messageService.add({
          severity: 'success',
          summary: 'Erstellt',
          detail: 'Standort wurde erfolgreich erstellt.'
        });
      },
      error: (err) => {
        console.error('Fehler beim Erstellen der Location:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Fehler',
          detail: 'Standort konnte nicht erstellt werden.'
        });
      }
    });
  }

  // Confirmation dialog helper
  confirmDeleteLocation(location: Location, onConfirm: () => void): void {
    this.confirmationService.confirm({
      message: `Möchten Sie den Standort "${location.roomNr}" (ID: ${location.id}) wirklich löschen?`,
      header: 'Löschen bestätigen',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Ja, löschen',
      rejectLabel: 'Abbrechen',
      accept: onConfirm
    });
  }

  // Delete location and update signal
  deleteLocation(locationId: number): void {
    this.locationService.deleteLocation(locationId).subscribe({
      next: () => {
        this.locations.set(this.locations().filter(l => l.id !== locationId));
        this.messageService.add({
          severity: 'success',
          summary: 'Gelöscht',
          detail: 'Standort wurde erfolgreich gelöscht.'
        });
      },
      error: (err) => {
        console.error('Fehler beim Löschen der Location:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Fehler',
          detail: 'Standort konnte nicht gelöscht werden.'
        });
      }
    });
  }

  // Navigate to location details
  navigateToDetails(location: Location): void {
    this.router.navigate(['/admin', 'locations', location.id]);
  }

  // Update new location room number
  updateNewLocationRoomNr(roomNr: string): void {
    this.newLocation.set({ roomNr });
  }
}

