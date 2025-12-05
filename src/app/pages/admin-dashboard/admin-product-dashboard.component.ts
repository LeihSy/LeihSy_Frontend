import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
// import { InputTextareaModule } from 'primeng/inputtextarea'; // TODO: Modul nicht verfügbar
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';

import { CommonModule } from '@angular/common';
import { ItemService } from '../../services/item.service';
import { Category } from '../../models/item.model';
// TODO: Category Feature - wird von anderer Person implementiert
// import { CategoryService } from '../../services/category.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    // InputTextareaModule, // TODO: Modul nicht verfügbar
    SelectModule,
    MultiSelectModule
  ],
  templateUrl: './admin-product-dashboard.component.html',
  styleUrls: ['./admin-product-dashboard.component.scss']
})
export class AdminProductDashboardComponent {

  itemForm!: FormGroup;

  // Mock-Kategorien bis Backend fertig ist
  categories: Category[] = [
    { id: 1, name: 'Kamera', description: 'Foto- und Videokameras' },
    { id: 2, name: 'Audio', description: 'Mikrofone und Audio-Equipment' },
    { id: 3, name: 'Licht', description: 'Beleuchtung und Lichttechnik' },
    { id: 4, name: 'Stativ', description: 'Kamera- und Lichtstative' },
    { id: 5, name: 'Objektiv', description: 'Wechselobjektive' },
    { id: 6, name: 'Zubehör', description: 'Diverses Zubehör' }
  ];

  constructor(
    private readonly fb: FormBuilder,
    private readonly itemService: ItemService
    // private readonly categoryService: CategoryService // TODO: Später aktivieren
  ) {
    this.itemForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      expiryDate: [0, Validators.required],
      price: [0, Validators.required],

      categoryId: [[], Validators.required], // Array für Mehrfachauswahl

      locationId: [null],
      locationRoomNr: [''],

      lenderId: [null],
      lenderName: [''],

      imageUrl: [''],
      accessories: ['[]'],

      availableItems: [0],
      totalItems: [0],

      createdAt: [''],
      updatedAt: ['']
    });
  }

  submitForm() {
    if (!this.itemForm.valid) return;

    const product = this.itemForm.value;

    this.itemService.createItem(product).subscribe({
      next: () => {
        alert('Produkt erfolgreich erstellt!');
        this.itemForm.reset();
      },
      error: (err) => {
        console.error(err);
        alert('Fehler bei der Erstellung!');
      }
    });
  }
}
        