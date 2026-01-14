import { Component, OnInit } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryService } from '../../services/category.service';
import { Category } from '../../models/category.model';
import { LocationDTO } from '../../models/location.model'; //

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

  searchQuery = '';
  isAddDialogOpen = false;
  isEditDialogOpen = false;
  isDeleteDialogOpen = false;

  selectedCategory: Category | null = null;
  newCategoryName = '';
  newCategoryIcon = '📦';
  categories: Category[] = [];

  
  categoryLocations: string[] = []; 

  commonIconOptions: string[] = ['📦', '📸', '🎧', '💻', '🎮', '🚁', '🔌'];

  constructor(
    private messageService: MessageService,
    private categoryService: CategoryService 
  ) {}
  ngOnInit() {
    this.loadCategories();
  }
  loadCategories() {
    this.categoryService.getAllCategories().subscribe({
      next: (data) => {
        this.categories = data;
      },
      error: (err: any) => { 
        console.error('Fehler beim Laden der Kategorien', err);
        this.messageService.add({ severity: 'error', summary: 'Fehler', detail: 'Kategorien konnten nicht geladen werden.' });
      }
    });
  }

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
    this.newCategoryIcon = category.icon || '📦';
    this.isEditDialogOpen = true;
  }

  openDeleteDialog(category: Category) {
    this.selectedCategory = category;
    this.isDeleteDialogOpen = true;
  }

  // --- Aktionen (CRUD) ---

  handleAddCategory() {
    if (!this.newCategoryName.trim()) {
      this.messageService.add({ severity: 'error', summary: 'Fehler', detail: 'Bitte geben Sie einen Namen ein' });
      return;
    }

    const newCategoryPayload: any = {
      name: this.newCategoryName.trim(),
      icon: this.newCategoryIcon || '📦'
    };

    this.categoryService.createCategory(newCategoryPayload).subscribe({
      next: (createdCategory) => {
        this.categories = [...this.categories, createdCategory];
        this.isAddDialogOpen = false;
        this.messageService.add({ severity: 'success', summary: 'Erfolg', detail: 'Kategorie erstellt' });
      },
      error: (err: any) => {
        console.error(err);
        this.messageService.add({ severity: 'error', summary: 'Fehler', detail: 'Erstellen fehlgeschlagen' });
      }
    });
  }

  handleEditCategory() {
    if (!this.selectedCategory || !this.newCategoryName.trim()) return;

    this.categoryService.updateCategory(this.selectedCategory.id, {
      name: this.newCategoryName.trim(),
      icon: this.newCategoryIcon || '📦'
    }).subscribe({
      next: (updatedCategory) => {
        this.categories = this.categories.map(c => 
          c.id === updatedCategory.id ? updatedCategory : c
        );
        this.isEditDialogOpen = false;
        this.messageService.add({ severity: 'success', summary: 'Erfolg', detail: 'Kategorie aktualisiert' });
      },
      error: (err: any) => {
        console.error(err);
        this.messageService.add({ severity: 'error', summary: 'Fehler', detail: 'Update fehlgeschlagen' });
      }
    });
  }

  handleDeleteCategory() {
    if (!this.selectedCategory) return;

    const idToDelete = this.selectedCategory.id;

    this.categoryService.deleteCategory(idToDelete).subscribe({
      next: () => {
        this.categories = this.categories.filter(cat => cat.id !== idToDelete);
        this.isDeleteDialogOpen = false;
        this.messageService.add({ severity: 'success', summary: 'Gelöscht', detail: 'Kategorie entfernt' });
      },
      error: (err: any) => {
        console.error(err);
        this.messageService.add({ severity: 'error', summary: 'Fehler', detail: 'Löschen fehlgeschlagen' });
      }
    });
  }

  isDeleteDisabled(): boolean {
    return !this.selectedCategory || (this.selectedCategory.deviceCount || 0) > 0;
  }

}