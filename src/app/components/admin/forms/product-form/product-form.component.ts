import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { CardModule } from 'primeng/card';
import { FilledButtonComponent } from '../../../buttons/filled-button/filled-button.component';
import { SecondaryButtonComponent } from '../../../buttons/secondary-button/secondary-button.component';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TabsModule } from 'primeng/tabs';
import { InputNumberModule } from 'primeng/inputnumber';

import { Product } from '../../../../models/product.model';
import { Category } from '../../../../models/category.model';
import { Location } from '../../../../models/location.model';
import { FormRowComponent } from '../../form-row/form-row.component';
import { FormInputFieldComponent } from '../../form-input-field/form-input-field.component';
import { ValidationMessageComponent } from '../../validation-message/validation-message.component';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    FilledButtonComponent,
    SecondaryButtonComponent,
    ButtonModule,
    InputTextModule,
    SelectModule,
    TabsModule,
    InputNumberModule,
    FormRowComponent,
    FormInputFieldComponent,
    ValidationMessageComponent
  ],
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss']
})
export class ProductFormComponent implements OnInit, OnChanges {
  @Input() product: Product | null = null;
  @Input() mode: 'admin' | 'private' = 'admin';
  @Input() categories: Category[] = [];
  @Input() locations: Location[] = [];
  @Input() isEditMode = false;

  @Output() formSubmit = new EventEmitter<{ formValue: any, imageFile: File | null }>();
  @Output() formCancel = new EventEmitter<void>();
  @Output() locationRoomNrChange = new EventEmitter<string>();

  itemForm!: FormGroup;
  selectedFile = signal<File | null>(null);
  imagePreview = signal<string | null>(null);
  locationDisplayValue = signal<string>('');
  isLoadingLocation = signal<boolean>(false);
  locationExists = signal<boolean>(false);

  constructor(private readonly fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['product'] && changes['product'].currentValue && this.itemForm) {
      this.loadProductData();
    }
  }

  private initForm(): void {
    // In 'private' mode we don't require a location selection because Location will be set to 'privat'
    this.itemForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      expiryDate: [0, [Validators.required, Validators.min(1)]],
      price: [0, [Validators.required, Validators.min(0)]],
      imageUrl: [''],
      accessories: [''],
      categoryId: [null, Validators.required],
      locationId: [null, this.mode === 'admin' ? Validators.required : []],
      locationRoomNr: ['', this.mode === 'admin' ? Validators.required : []]
    });
  }

  private loadProductData(): void {
    if (!this.product) return;

    this.itemForm.patchValue({
      name: this.product.name,
      description: this.product.description,
      expiryDate: this.product.expiryDate,
      price: this.product.price,
      imageUrl: this.product.imageUrl,
      accessories: this.product.accessories,
      categoryId: this.product.categoryId,
      locationId: this.product.locationId,
      locationRoomNr: this.product.location?.roomNr || ''
    });

    // Setze locationDisplayValue wenn Location vorhanden ist
    if (this.product.location?.roomNr) {
      this.locationDisplayValue.set(`Location gefunden: ID ${this.product.locationId}`);
      this.locationExists.set(true);
    }

    if (this.product.imageUrl) {
      this.imagePreview.set('http://localhost:8080' + this.product.imageUrl);
    }
  }

  submitForm(): void {
    if (!this.itemForm.valid) return;

    // Wenn private mode, geben wir ein Flag weiter, damit die Elternkomponente weiß, dass
    // kein POST erfolgen soll und stattdessen ein JSON erzeugt werden kann.
    this.formSubmit.emit({
      formValue: this.itemForm.value,
      imageFile: this.selectedFile(),
      privateMode: this.mode === 'private'
    } as any);
  }

  resetForm(): void {
    this.itemForm.reset();
    this.selectedFile.set(null);
    this.imagePreview.set(null);
    this.formCancel.emit();
  }

  onLocationRoomNrChange(): void {
    const roomNr = this.itemForm.get('locationRoomNr')?.value;
    this.locationRoomNrChange.emit(roomNr);
  }

  setLocationDisplayValue(value: string): void {
    this.locationDisplayValue.set(value);
  }

  setLocationExists(exists: boolean): void {
    this.locationExists.set(exists);
  }

  setIsLoadingLocation(loading: boolean): void {
    this.isLoadingLocation.set(loading);
  }

  setLocationId(id: number | null): void {
    this.itemForm.patchValue({ locationId: id }, { emitEvent: false });
  }

  patchLocationId(id: number | null): void {
    this.itemForm.patchValue({ locationId: id }, { emitEvent: false });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.selectedFile.set(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview.set(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(): void {
    this.selectedFile.set(null);
    this.imagePreview.set(null);
    this.itemForm.patchValue({ imageUrl: null });
  }

  onLocationSelect(event: any): void {
    const selectedId = event?.value ?? null;
    if (selectedId) {
      const selected = this.locations.find(l => l.id === selectedId);
      if (selected) {
        this.locationDisplayValue.set(`${selected.roomNr}`);
        this.locationExists.set(true);
        this.setLocationId(selected.id);
      } else {
        this.locationDisplayValue.set('');
        this.locationExists.set(false);
        this.setLocationId(null);
      }
    } else {
      this.locationDisplayValue.set('');
      this.locationExists.set(false);
      this.setLocationId(null);
    }
  }
}
