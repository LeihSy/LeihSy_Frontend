import { Component } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG UI-Module
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

// Datenmodell: Kategorie
interface Category {
  id: string;          // eindeutige ID
  name: string;        // Anzeigename
  icon: string;        // Emoji/Icon
  deviceCount: number; // Anzahl Geräte
}

@Component({
  selector: 'app-admin-category-dashboard',
  standalone: true, // Standalone-Komponente
  imports: [
    CommonModule,    // *ngIf, *ngFor
    FormsModule,     // [(ngModel)]
    NgClass,         // [ngClass]
    ButtonModule,    // pButton
    DialogModule,    // p-dialog
    InputTextModule, // pInputText
    TagModule,       // p-tag
    ToastModule      // p-toast
  ],
  templateUrl: './admin-category-dashboard.component.html',
  styleUrls: ['./admin-category-dashboard.component.scss'],
  providers: [MessageService] // Toast-Service lokal
})
export class AdminCategoryDashboardComponent {

  // --- UI-Zustand ----------------------------------------

  searchQuery = ''; // Suchtext

  isAddDialogOpen = false;    // Dialog: Hinzufügen
  isEditDialogOpen = false;   // Dialog: Bearbeiten
  isDeleteDialogOpen = false; // Dialog: Löschen

  selectedCategory: Category | null = null; // aktuell ausgewählt

  // --- Formular-Zustand ----------------------------------

  newCategoryName = '';   // Formular: Name
  newCategoryIcon = '📦'; // Formular: Icon-Standard

  // --- Daten ---------------------------------------------

  categories: Category[] = [ // Mock-Daten
    { id: '1', name: 'VR-Geräte',       icon: '🥽', deviceCount: 12 },
    { id: '2', name: 'Kameras',         icon: '📷', deviceCount: 24 },
    { id: '3', name: 'Laptops',         icon: '💻', deviceCount: 35 },
    { id: '4', name: 'Tablets',         icon: '📱', deviceCount: 18 },
    { id: '5', name: 'Audio-Equipment', icon: '🎙️', deviceCount: 15 },
    { id: '6', name: 'Licht-Equipment', icon: '💡', deviceCount: 20 },
    { id: '7', name: 'Kamera-Zubehör',  icon: '🎥', deviceCount: 42 },
    { id: '8', name: 'Drohnen',         icon: '🚁', deviceCount: 8 },
  ];

  commonIconOptions: string[] = [ // Icon-Auswahl
    '📦', '🥽', '📷', '💻', '📱', '🎙️', '💡', '🎥', '🚁',
    '🎧', '⌨️', '🖱️', '🖨️', '📡', '🔌'
  ];

  constructor(private messageService: MessageService) {} // Toast

  // --- Abgeleitete Daten ---------------------------------

  get filteredCategories(): Category[] { // Rückgabe: gefilterte Liste
    const query = this.searchQuery.toLowerCase().trim(); // normalisieren
    if (!query) return this.categories; // kein Filter
    return this.categories.filter(cat =>    
      cat.name.toLowerCase().includes(query) // Name enthält Suchtext
    );
  }

  // Diaglog fürs Anlegen öffnen

  openAddDialog() {
    this.newCategoryName = '';    // Formular zurücksetzen
    this.newCategoryIcon = '📦';  // Icon zurücksetzen
    this.selectedCategory = null; // Auswahl löschen
    this.isAddDialogOpen = true;  // Dialog öffnen
  }
  //Diaglog fürs Bearbeiten öffnen
  openEditDialog(category: Category) {
    this.selectedCategory = category;     // Auswahl setzen
    this.newCategoryName = category.name; // Formular füllen
    this.newCategoryIcon = category.icon; // Formular füllen
    this.isEditDialogOpen = true;         // Dialog öffnen
  }
  // Dialog fürs Löschen öffnen
  openDeleteDialog(category: Category) {
    this.selectedCategory = category; // Auswahl setzen
    this.isDeleteDialogOpen = true;  // Dialog öffnen
  }

  // --- Aktionen ------------------------------------------

  handleAddCategory() {
    if (!this.newCategoryName.trim()) { // Entfernt Leerzeichen und prüft
      this.messageService.add({
        severity: 'error',
        summary: 'Fehler',
        detail: 'Bitte geben Sie einen Kategorienamen ein'
      });
      return; // abbrechen, damit keine Leere Kategorie erstellt wird
    }

    const newCategory: Category = { // neues Objekt bauen
      id: Date.now().toString(),          // ID
      name: this.newCategoryName.trim(),  // bereinigen
      icon: this.newCategoryIcon || '📦', 
      deviceCount: 0                      // Start: 0
    };

    this.categories = [...this.categories, newCategory]; // Referenzen ändern sich/ neues Array

    this.isAddDialogOpen = false; // Dialog schließen
    this.newCategoryName = '';    // Reset
    this.newCategoryIcon = '📦';  // Reset

    this.messageService.add({ // Toast: Erfolg
      severity: 'success',
      summary: 'Erfolg',
      detail: 'Kategorie wurde erfolgreich hinzugefügt'
    });
  }

  handleEditCategory() {
    if (!this.selectedCategory || !this.newCategoryName.trim()) { // Auswahl + Name (verhindert leere Namen)
      this.messageService.add({
        severity: 'error',
        summary: 'Fehler',
        detail: 'Bitte geben Sie einen Kategorienamen ein'
      });
      return; // abbrechen
    }

    this.categories = this.categories.map(cat => // neue Liste mit geänderten Daten
      cat.id === this.selectedCategory!.id      //id vergleichen
        ? {
            ...cat, // Rest behalten
            name: this.newCategoryName.trim(),    //überschreiben
            icon: this.newCategoryIcon || '📦'
          }
        : cat // sonst unverändert
    );

    this.isEditDialogOpen = false; // Dialog schließen
    this.selectedCategory = null;  // Auswahl löschen
    this.newCategoryName = '';     // Reset
    this.newCategoryIcon = '📦';   // Reset

    this.messageService.add({ // Toast: Erfolg
      severity: 'success',
      summary: 'Erfolg',
      detail: 'Kategorie wurde erfolgreich aktualisiert'
    });
  }

  handleDeleteCategory() {
    if (!this.selectedCategory) return; 

    if (this.selectedCategory.deviceCount > 0) { //nur leere Kategorien löschen
      this.messageService.add({
        severity: 'error',
        summary: 'Löschen nicht möglich',
        detail: `Kategorie kann nicht gelöscht werden, sie enthält noch ${this.selectedCategory.deviceCount} Geräte.`
      });
      return; // abbrechen
    }

    this.categories = this.categories.filter( // ID nachschauen und entfernen
      cat => cat.id !== this.selectedCategory!.id
    );

    this.isDeleteDialogOpen = false; // Dialog schließen
    this.selectedCategory = null;    // Auswahl löschen

    this.messageService.add({ // Meldung: Erfolg
      severity: 'success',
      summary: 'Erfolg',
      detail: 'Kategorie wurde erfolgreich gelöscht'
    });
  }

  isDeleteDisabled(): boolean {
    return !this.selectedCategory || this.selectedCategory.deviceCount !== 0; // Button sperren, wenn ===0 ist es klickbar
  }
}
