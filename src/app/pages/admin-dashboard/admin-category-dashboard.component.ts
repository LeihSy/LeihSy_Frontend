import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

interface Category {
  id: string;
  name: string;
  icon: string;
  deviceCount: number;
}

@Component({
  selector: 'app-admin-category-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    DialogModule,
    TagModule,
    ToastModule,
  ],
  providers: [MessageService],
  templateUrl: './admin-category-dashboard.component.html',
  styleUrls: ['./admin-category-dashboard.component.scss'],
})
export class AdminCategoryDashboardComponent {
  // --- State -------------------------------------------------------------
  searchQuery = '';

  isAddDialogOpen = false;
  isEditDialogOpen = false;
  isDeleteDialogOpen = false;

  selectedCategory: Category | null = null;
  newCategoryName = '';
  newCategoryIcon = '📦';

  categories: Category[] = [
    { id: '1', name: 'VR-Geräte', icon: '🥽', deviceCount: 12 },
    { id: '2', name: 'Kameras', icon: '📷', deviceCount: 24 },
    { id: '3', name: 'Laptops', icon: '💻', deviceCount: 35 },
    { id: '4', name: 'Tablets', icon: '📱', deviceCount: 18 },
    { id: '5', name: 'Audio-Equipment', icon: '🎙️', deviceCount: 15 },
    { id: '6', name: 'Licht-Equipment', icon: '💡', deviceCount: 20 },
    { id: '7', name: 'Kamera-Zubehör', icon: '🎥', deviceCount: 42 },
    { id: '8', name: 'Drohnen', icon: '🚁', deviceCount: 8 },
  ];

  commonIconOptions: string[] = [
    '📦', '🥽', '📷', '💻', '📱',
    '🎙️', '💡', '🎥', '🚁', '🎧',
    '⌨️', '🖱️', '🖨️', '📡', '🔌',
  ];

  constructor(private messageService: MessageService) {}

  // --- Derived data ------------------------------------------------------
  get filteredCategories(): Category[] {
    const query = this.searchQuery.trim().toLowerCase();
    if (!query) return this.categories;

    return this.categories.filter((category) =>
      category.name.toLowerCase().includes(query)
    );
  }

  // --- Dialog Helpers ----------------------------------------------------
  openAddDialog() {
    this.newCategoryName = '';
    this.newCategoryIcon = '📦';
    this.isAddDialogOpen = true;
  }

  openEditDialog(category: Category) {
    this.selectedCategory = { ...category };
    this.newCategoryName = category.name;
    this.newCategoryIcon = category.icon;
    this.isEditDialogOpen = true;
  }

  openDeleteDialog(category: Category) {
    this.selectedCategory = { ...category };
    this.isDeleteDialogOpen = true;
  }

  // --- Actions -----------------------------------------------------------
  handleAddCategory() {
    if (!this.newCategoryName.trim()) {
      this.messageService.add({
        severity: 'error',
        summary: 'Fehler',
        detail: 'Bitte geben Sie einen Kategorienamen ein',
      });
      return;
    }

    const newCategory: Category = {
      id: Date.now().toString(),
      name: this.newCategoryName.trim(),
      icon: this.newCategoryIcon || '📦',
      deviceCount: 0,
    };

    this.categories = [...this.categories, newCategory];

    this.isAddDialogOpen = false;
    this.newCategoryName = '';
    this.newCategoryIcon = '📦';

    this.messageService.add({
      severity: 'success',
      summary: 'Erfolg',
      detail: 'Kategorie wurde erfolgreich hinzugefügt',
    });
  }

  handleEditCategory() {
    if (!this.selectedCategory || !this.newCategoryName.trim()) {
      this.messageService.add({
        severity: 'error',
        summary: 'Fehler',
        detail: 'Bitte geben Sie einen Kategorienamen ein',
      });
      return;
    }

    this.categories = this.categories.map((cat) =>
      cat.id === this.selectedCategory!.id
        ? {
            ...cat,
            name: this.newCategoryName.trim(),
            icon: this.newCategoryIcon || '📦',
          }
        : cat
    );

    this.isEditDialogOpen = false;
    this.selectedCategory = null;
    this.newCategoryName = '';
    this.newCategoryIcon = '📦';

    this.messageService.add({
      severity: 'success',
      summary: 'Erfolg',
      detail: 'Kategorie wurde erfolgreich aktualisiert',
    });
  }

  handleDeleteCategory() {
    if (!this.selectedCategory) return;

    if (this.selectedCategory.deviceCount > 0) {
      this.messageService.add({
        severity: 'error',
        summary: 'Löschen nicht möglich',
        detail: `Kategorie kann nicht gelöscht werden. Sie enthält noch ${this.selectedCategory.deviceCount} Geräte.`,
      });
      return;
    }

    this.categories = this.categories.filter(
      (cat) => cat.id !== this.selectedCategory!.id
    );

    this.isDeleteDialogOpen = false;
    this.selectedCategory = null;

    this.messageService.add({
      severity: 'success',
      summary: 'Erfolg',
      detail: 'Kategorie wurde erfolgreich gelöscht',
    });
  }

  // --- UI helpers --------------------------------------------------------
  isDeleteDisabled(): boolean {
    return !this.selectedCategory || this.selectedCategory.deviceCount !== 0;
  }
}
