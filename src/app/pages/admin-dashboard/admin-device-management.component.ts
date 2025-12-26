import { Component, OnInit, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { DeviceService } from '../../services/device.service';
import { Device } from '../../interfaces/device.model';
import { DeviceIconPipe } from '../../pipes/device-icon.pipe';

// PrimeNG
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { TabsModule } from 'primeng/tabs';


interface DeviceWithLender extends Device {
  assignedLender?: string;
  lenderLocation?: string;
}

@Component({
  selector: 'app-admin-device-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    ButtonModule,
    SelectModule,
    DialogModule,
    TagModule,
    TabsModule,
    DeviceIconPipe
  ],
  templateUrl: './admin-device-management.component.html',
})
export class AdminDeviceManagementComponent implements OnInit {
  private readonly deviceService = inject(DeviceService);

  // Rohdaten
  devices = signal<DeviceWithLender[]>([]);
  filteredDevices = signal<DeviceWithLender[]>([]);

  // Filter
  searchQuery = signal('');
  selectedCategory = signal('all');
  lenderFilterQuery = signal('');

  // UI-State Dialog
  isEditDialogOpen = signal(false);
  activeDialogTab = signal<'lender' | 'related'>('lender');

  selectedDevice = signal<DeviceWithLender | null>(null);
  assignedLender = signal('');
  lenderLocation = signal('');

  // Related items state


  // Kategorien (für Select)
  categoryOptions = signal<{ label: string; value: string }[]>([
    { label: 'Alle Kategorien', value: 'all' }
  ]);

  // Beispiel-Verleiher wie in React
  private readonly exampleLenders = [
    'Dr. Maria Schmidt',
    'Prof. Thomas Müller',
    'Sarah Weber',
    'Michael Klein',
    'Lisa Hoffmann',
    'Dr. Frank Bauer'
  ];

  // Eindeutige Verleiher für Vorschläge
  uniqueLenders = computed(() => {
    const names = this.devices()
      .map(d => d.assignedLender)
      .filter((n): n is string => !!n);
    return Array.from(new Set(names));
  });

  // Gefilterte Geräte-Anzahl
  resultCount = computed(() => this.filteredDevices().length);

  // Devices für Zusatzgegenstände (exclude current device, mit Suche)
//

  ngOnInit(): void {
    this.loadDevices();
  }

  private loadDevices(): void {
    const baseDevices = this.deviceService.getDevices();

    const devicesWithLender: DeviceWithLender[] = baseDevices.map((device, index) => {
      const primaryCampus = device.campusAvailability.find(ca => ca.total > 0);
      return {
        ...device,
        assignedLender: this.exampleLenders[index % this.exampleLenders.length],
        lenderLocation: primaryCampus
          ? `${primaryCampus.campus}, ${primaryCampus.location}`
          : '',
        relatedItems: []
      };
    });

    this.devices.set(devicesWithLender);
    this.filteredDevices.set(devicesWithLender);

    const categoriesSet = new Set<string>();
    devicesWithLender.forEach(d => categoriesSet.add(d.category));

    const categoryOptions = [
      { label: 'Alle Kategorien', value: 'all' },
      ...Array.from(categoriesSet).map(cat => ({ label: cat, value: cat }))
    ];
    this.categoryOptions.set(categoryOptions);
  }

  applyFilters(): void {
    const query = this.searchQuery().toLowerCase().trim();
    const category = this.selectedCategory();
    const lenderQuery = this.lenderFilterQuery().toLowerCase().trim();

    let result = this.devices();

    if (query) {
      result = result.filter(device =>
        device.name.toLowerCase().includes(query) ||
        device.inventoryNumber.toLowerCase().includes(query)
      );
    }

    if (category && category !== 'all') {
      result = result.filter(device => device.category === category);
    }

    if (lenderQuery) {
      result = result.filter(device =>
        device.assignedLender &&
        device.assignedLender.toLowerCase().includes(lenderQuery)
      );
    }

    this.filteredDevices.set(result);
  }

  openEditDialog(device: DeviceWithLender): void {
    this.selectedDevice.set(device);
    this.assignedLender.set(device.assignedLender || '');
    this.lenderLocation.set(device.lenderLocation || '');

    this.selectedRelatedItems.set(device.relatedItems ? [...device.relatedItems] : []);
    this.relatedItemsSearch.set('');
    this.activeDialogTab.set('lender');

    this.isEditDialogOpen.set(true);
  }

  closeDialog(): void {
    this.isEditDialogOpen.set(false);
    this.selectedDevice.set(null);
    this.activeDialogTab.set('lender');
    this.assignedLender.set('');
    this.lenderLocation.set('');
    this.selectedRelatedItems.set([]);
    this.relatedItemsSearch.set('');
  }

  // ✅ Wichtig: PrimeNG valueChange ist nicht sauber typisiert -> validieren wir hier
  setActiveDialogTab(value: unknown): void {
    if (value === 'lender' || value === 'related') {
      this.activeDialogTab.set(value);
      return;
    }
    this.activeDialogTab.set('lender');
  }

  // ---------- Related Items Logic ----------
  getRelatedItemStatus(deviceId: string): RelatedItemType | null {
    const item = this.selectedRelatedItems().find(x => x.deviceId === deviceId);
    return item ? item.type : null;
  }

  toggleRelatedItem(deviceId: string, type: RelatedItemType): void {
    const items = this.selectedRelatedItems();
    const existing = items.find(x => x.deviceId === deviceId);

    if (existing) {
      if (existing.type === type) {
        this.selectedRelatedItems.set(items.filter(x => x.deviceId !== deviceId));
      } else {
        this.selectedRelatedItems.set(
          items.map(x => (x.deviceId === deviceId ? { ...x, type } : x))
        );
      }
      return;
    }

    this.selectedRelatedItems.set([...items, { deviceId, type }]);
  }

  removeRelatedItem(deviceId: string): void {
    this.selectedRelatedItems.set(
      this.selectedRelatedItems().filter(x => x.deviceId !== deviceId)
    );
  }

  relatedTypeLabel(type: RelatedItemType): string {
    return type === 'required' ? 'Erforderlich' : 'Empfohlen';
  }

  findDeviceById(id: string): DeviceWithLender | undefined {
    return this.devices().find(d => d.id === id);
  }

  // ---------- Save ----------
  handleSaveAssignment(): void {
    const device = this.selectedDevice();
    if (!device) return;

    const lender = this.assignedLender().trim();
    const location = this.lenderLocation().trim();

    if (!lender) {
      alert('Bitte geben Sie den Namen des Verleihers ein.');
      return;
    }

    if (!location) {
      alert('Bitte geben Sie einen Standort an.');
      return;
    }

    device.assignedLender = lender;
    device.lenderLocation = location;
    device.relatedItems = [...this.selectedRelatedItems()];

    this.devices.set([...this.devices()]);
    this.applyFilters();

    alert('Änderungen wurden erfolgreich gespeichert.');
    this.closeDialog();
  }
}
