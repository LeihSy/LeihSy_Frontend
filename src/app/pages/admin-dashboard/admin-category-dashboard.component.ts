import { Component, OnInit } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryService } from '../../services/category.service';
import { Category } from '../../models/category.model';

// PrimeNG Modules
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-admin-category-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgClass,
    ButtonModule,
    DialogModule,
    InputTextModule,
    TagModule,
    ToastModule
  ],
  templateUrl: './admin-category-dashboard.component.html',
  providers: [MessageService]
})
export class AdminCategoryDashboardComponent implements OnInit {

  // Suchfeld
  searchQuery = '';

  // Dialog-States
  isAddDialogOpen = false;
  isEditDialogOpen = false;
  isDeleteDialogOpen = false;

  // Ausgewählte Kategorie
  selectedCategory: Category | null = null;

  // Formularfelder
  newCategoryName = '';
  newCategoryIcon = '📦';

  // Daten aus dem Backend
  categories: Category[] = [];

  // Icon-Auswahl
  commonIconOptions: string[] = ['📦', '📸', '🎧', '💻', '🎮', '🚁', '🔌'];

  constructor(
    private messageService: MessageService,
    private categoryService: CategoryService 
  ) {}

  // Beim Start Daten laden
  ngOnInit() {
    this.loadCategories();
  }

  // Lade alle Kategorien vom Backend
  loadCategories() {
    this.categoryService.getAllCategories().subscribe({
      next: (data) => {
        this.categories = data;
      },
      error: (err) => {
        console.error('Fehler beim Laden der Kategorien', err);
        this.messageService.add({ severity: 'error', summary: 'Fehler', detail: 'Kategorien konnten nicht geladen werden.' });
      }
    });
  }

  // Gefilterte Kategorien für die Anzeige
  get filteredCategories(): Category[] {
    const query = this.searchQuery.toLowerCase().trim();
    if (!query) return this.categories;
    return this.categories.filter(cat =>
      cat.name.toLowerCase().includes(query)
    );
  }

  // --- Dialog-Öffner ---

  openAddDialog() {
    this.newCategoryName = '';
    this.newCategoryIcon = '📦';
    this.selectedCategory = null;
    this.isAddDialogOpen = true;
  }

  openEditDialog(category: Category) {
    this.selectedCategory = category;
    this.newCategoryName = category.name;
    // Fix für TS2322: Fallback, falls icon undefined ist
    this.newCategoryIcon = category.icon || '📦';
    this.isEditDialogOpen = true;
  }

  openDeleteDialog(category: Category) {
    this.selectedCategory = category;
    this.isDeleteDialogOpen = true;
  }

  // --- Aktionen (CRUD) ---

  // 1. Erstellen (POST)
  handleAddCategory() {
    if (!this.newCategoryName.trim()) {
      this.messageService.add({ severity: 'error', summary: 'Fehler', detail: 'Bitte geben Sie einen Namen ein' });
      return;
    }

    // Fix für TS2322: Keine ID manuell setzen! Das macht das Backend.
    const newCategoryPayload: any = {
      name: this.newCategoryName.trim(),
      icon: this.newCategoryIcon || '📦'
    };

    this.categoryService.createCategory(newCategoryPayload).subscribe({
      next: (createdCategory) => {
        // Liste aktualisieren
        this.categories = [...this.categories, createdCategory];

        this.isAddDialogOpen = false;
        this.newCategoryName = '';
        this.newCategoryIcon = '📦';

        this.messageService.add({ severity: 'success', summary: 'Erfolg', detail: 'Kategorie erstellt' });
      },
      error: (err) => {
        console.error(err);
        this.messageService.add({ severity: 'error', summary: 'Fehler', detail: 'Erstellen fehlgeschlagen' });
      }
    });
  }

  // 2. Bearbeiten (PUT)
  handleEditCategory() {
    if (!this.selectedCategory || !this.newCategoryName.trim()) return;

    this.categoryService.updateCategory(this.selectedCategory.id, {
      name: this.newCategoryName.trim(),
      icon: this.newCategoryIcon || '📦'
    }).subscribe({
      next: (updatedCategory) => {
        // Fix für TS2367: IDs sind jetzt beide 'number', kein toString() nötig
        this.categories = this.categories.map(c => 
          c.id === updatedCategory.id ? updatedCategory : c
        );
        
        this.isEditDialogOpen = false;
        this.selectedCategory = null;
        this.messageService.add({ severity: 'success', summary: 'Erfolg', detail: 'Kategorie aktualisiert' });
      },
      error: (err) => {
        console.error(err);
        this.messageService.add({ severity: 'error', summary: 'Fehler', detail: 'Update fehlgeschlagen' });
      }
    });
  }

  // 3. Löschen (DELETE)
  handleDeleteCategory() {
    // Fix für TS2532: Erst prüfen, ob selectedCategory existiert
    if (!this.selectedCategory) return;

    // Optionaler Check: Falls dein Category-Model deviceCount hat
    if (this.selectedCategory.deviceCount && this.selectedCategory.deviceCount > 0) {
      this.messageService.add({ severity: 'error', summary: 'Fehler', detail: 'Kategorie ist nicht leer.' });
      return;
    }

    const idToDelete = this.selectedCategory.id;

    this.categoryService.deleteCategory(idToDelete).subscribe({
      next: () => {
        // Aus lokaler Liste entfernen
        this.categories = this.categories.filter(cat => cat.id !== idToDelete);
        
        this.isDeleteDialogOpen = false;
        this.selectedCategory = null;
        this.messageService.add({ severity: 'success', summary: 'Gelöscht', detail: 'Kategorie entfernt' });
      },
      error: (err) => {
        console.error(err);
        const msg = err.error?.error || 'Löschen fehlgeschlagen';
        this.messageService.add({ severity: 'error', summary: 'Fehler', detail: msg });
      }
    });
  }

  isDeleteDisabled(): boolean {
    // Fix für TS2532: Sicherer Zugriff auf deviceCount
    return !this.selectedCategory || (this.selectedCategory.deviceCount || 0) > 0;
  }
}