import { Injectable, inject, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { ConfirmationService, MessageService } from 'primeng/api';

import { Location } from '../../../../models/location.model';
import { LocationService } from '../../../../services/location.service';

@Injectable({ providedIn: 'root' })
export class AdminLocationsService {
  private locationService = inject(LocationService);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);

  // Signals for state
  locations = signal<Location[]>([]);
  isLoading = signal(false);

  // Load all locations and update signal
  loadLocations(): void {
    this.isLoading.set(true);
    this.locationService.getAllLocations().pipe(
      tap((locs) => this.locations.set(locs)),
      catchError((err) => {
        console.error('Fehler beim Laden der Locations:', err);
        this.messageService.add({ severity: 'error', summary: 'Fehler', detail: 'Fehler beim Laden der Standorte.' });
        // keep empty list on error
        this.locations.set([]);
        return of([] as Location[]);
      })
    ).subscribe({
      next: () => this.isLoading.set(false),
      error: () => this.isLoading.set(false)
    });
  }

  // Create a location and append to signal
  create(location: Partial<Location>): Observable<Location> {
    return this.locationService.createLocation(location as Location).pipe(
      tap((loc) => {
        this.locations.set([...this.locations(), loc]);
        this.messageService.add({ severity: 'success', summary: 'Erstellt', detail: 'Standort wurde erstellt.' });
      }),
      catchError((err) => {
        console.error('Fehler beim Erstellen der Location:', err);
        this.messageService.add({ severity: 'error', summary: 'Fehler', detail: 'Standort konnte nicht erstellt werden.' });
        throw err;
      })
    );
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
  deleteLocation(locationId: number): Observable<void> {
    return this.locationService.deleteLocation(locationId).pipe(
      tap(() => {
        this.locations.set(this.locations().filter(l => l.id !== locationId));
        this.messageService.add({ severity: 'success', summary: 'Gelöscht', detail: 'Standort wurde gelöscht.' });
      }),
      catchError((err) => {
        console.error('Fehler beim Löschen der Location:', err);
        this.messageService.add({ severity: 'error', summary: 'Fehler', detail: 'Standort konnte nicht gelöscht werden.' });
        throw err;
      })
    );
  }
}
