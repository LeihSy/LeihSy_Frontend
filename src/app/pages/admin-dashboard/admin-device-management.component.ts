import { Component, OnInit, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs'; 

// Services
import { ItemService } from '../../services/item.service';
import { UserService } from '../../services/user.service'; 
import { MessageService } from 'primeng/api';

// Models
import { Item } from '../../models/item.model';
import { User } from '../../models/user.model'; 

// PrimeNG
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select'; 
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { TabsModule } from 'primeng/tabs';
import { AutoCompleteModule } from 'primeng/autocomplete'; 
import { ToastModule } from 'primeng/toast';

type RelatedItemType = 'required' | 'recommended';

@Component({
  selector: 'app-admin-device-management',
  standalone: true,
  imports: [
    CommonModule, FormsModule, InputTextModule, ButtonModule,
    SelectModule, DialogModule, TagModule, TabsModule, AutoCompleteModule, ToastModule
  ],
  templateUrl: './admin-device-management.component.html',
  providers: [MessageService]
})
export class AdminDeviceManagementComponent implements OnInit {

  private itemService = inject(ItemService);
  private userService = inject(UserService);
  private messageService = inject(MessageService);

  // Echte Daten
  devices = signal<Item[]>([]);
  filteredDevices = signal<Item[]>([]);
  
  // Verleiher-Suche
  suggestedLenders = signal<User[]>([]); // Ergebnisse der Suche
  selectedLenderUser = signal<User | null>(null); // Der aktuell im Dialog ausgewählte User

  // UI State
  searchQuery = signal('');
  lenderFilterQuery = signal('');
  isEditDialogOpen = signal(false);
  activeDialogTab = signal<'lender' | 'related'>('lender');
  selectedDevice = signal<Item | null>(null);

  // Zubehör State
  selectedRelatedItems = signal<{ deviceId: number; type: RelatedItemType }[]>([]);

  ngOnInit() {
    this.loadItems();
  }

  loadItems() {
    this.itemService.getAllItems().subscribe({
      next: (data) => {
        this.devices.set(data);
        this.applyFilters();
      },
      error: (err) => console.error(err)
    });
  }

  // --- FILTERN ---//
  applyFilters() {
    const searchQ = this.searchQuery().toLowerCase();       // Linkes Suchfeld
    const lenderQ = this.lenderFilterQuery().toLowerCase(); // Rechtes Suchfeld

    this.filteredDevices.set(
      this.devices().filter(d => {
        const matchesDevice = 
          (d.productName && d.productName.toLowerCase().includes(searchQ)) ||
          (d.invNumber && d.invNumber.toLowerCase().includes(searchQ));
      
        const matchesLender = 
            !lenderQ || 
            (d.lenderName && d.lenderName.toLowerCase().includes(lenderQ));
        return matchesDevice && matchesLender;
      })
    );
  }
  closeDialog() {
    this.isEditDialogOpen.set(false);
    this.selectedDevice.set(null);
    this.selectedLenderUser.set(null);
  }
  // --- DIALOG ÖFFNEN ---
  openEditDialog(device: Item) {
    this.selectedDevice.set(device);
    this.selectedRelatedItems.set([]); 
    this.selectedLenderUser.set(null); 
    this.isEditDialogOpen.set(true);
    if (device.lenderId) {

      this.selectedLenderUser.set(null); // Reset
      if(device.lenderId) {
         this.userService.getUserById(device.lenderId).subscribe(u => this.selectedLenderUser.set(u));
      }
    } else {
      this.selectedLenderUser.set(null);
    }

    this.isEditDialogOpen.set(true);
  }

  // --- VERLEIHER SUCHEN --
  searchLender(event: any) {
    const query = event.query;
    this.userService.searchUsers(query).subscribe(users => {
      this.suggestedLenders.set(users);
    });
  }

  // --- SPEICHERN---
  handleSaveAssignment() {
    const device = this.selectedDevice();
    const lender = this.selectedLenderUser(); // Der ausgewählte User

    if (!device) return;
    const itemUpdatePayload = {
      invNumber: device.invNumber,
      productId: device.productId,
      lenderId: lender ? lender.id : null, 
      owner: device.owner
    };

    const relatedPayload = this.selectedRelatedItems().map(ri => ({
      deviceId: ri.deviceId,
      type: ri.type
    }));

    const req1 = this.itemService.updateItem(device.id, itemUpdatePayload);
    const req2 = this.itemService.updateRelatedItems(device.id, relatedPayload);

    forkJoin([req1, req2]).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Erfolg', detail: 'Gerät & Verleiher gespeichert' });
        this.loadItems();
        this.isEditDialogOpen.set(false);
      },
      error: (err) => {
        console.error(err);
        this.messageService.add({ severity: 'error', summary: 'Fehler', detail: 'Speichern fehlgeschlagen' });
      }
    });
  }
}