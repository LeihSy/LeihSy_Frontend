import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TabsModule } from 'primeng/tabs';
import { InputNumberModule } from 'primeng/inputnumber';

import { Product } from '../../models/product.model';
import { Category } from '../../models/category.model';
import { Location } from '../../models/location.model';
import { FormRowComponent } from './form-row/form-row.component';
import { FormInputFieldComponent } from './form-input-field/form-input-field.component';
import { ValidationMessageComponent } from './validation-message/validation-message.component';

type RelatedItemType = 'required' | 'recommended';

interface RelatedItem {
  productId: number;
  type: RelatedItemType;
}
@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
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
  @Input() categories: Category[] = [];
  @Input() locations: Location[] = [];
  @Input() isEditMode = false;
  @Input() products: Product[] = [];  //Zusatzgegenstände
  @Output() formSubmit = new EventEmitter<{ formValue: any, imageFile: File | null }>();
  @Output() formCancel = new EventEmitter<void>();
  @Output() locationRoomNrChange = new EventEmitter<string>();

  itemForm!: FormGroup;
  selectedFile = signal<File | null>(null);
  imagePreview = signal<string | null>(null);
  locationDisplayValue = signal<string>('');
  isLoadingLocation = signal<boolean>(false);
  locationExists = signal<boolean>(false);
  selectedRelatedItems = signal<RelatedItem[]>([]);
  relatedItemsSearch = signal('');

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
    this.itemForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      expiryDate: [0, [Validators.required, Validators.min(1)]],
      price: [0, [Validators.required, Validators.min(0)]],
      imageUrl: [''],
      accessories: [''],
      categoryId: [null, Validators.required],
      locationId: [null, Validators.required],
      locationRoomNr: ['', Validators.required]
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
    //Zusatzgegenstände aus Produkt laden (falls vorhanden)
    const related = (this.product as any)?.relatedItems as RelatedItem[] | undefined;
    this.selectedRelatedItems.set(Array.isArray(related) ? [...related] : []);
    this.relatedItemsSearch.set('');
  
  }

  submitForm(): void {
    if (!this.itemForm.valid) return;

    this.formSubmit.emit({
      formValue: this.itemForm.value,
      relatedItems: this.selectedRelatedItems()
    },
      imageFile: this.selectedFile(),
    });
  }

  resetForm(): void {
    this.itemForm.reset();
    this.selectedFile.set(null);
    this.imagePreview.set(null);
    this.selectedRelatedItems.set([]);
    this.relatedItemsSearch.set('');
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

  setLocationId(id: number): void {
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

availableRelatedProducts(): Product[] {
  const q = this.relatedItemsSearch().toLowerCase().trim();
  const currentId: number | null = (this.product as any)?.id ?? null;

  return (this.products ?? []).filter((p: any) => {
    if (!p) return false;
    if (currentId != null && p.id === currentId) return false;

    if (!q) return true;

    const name = String(p.name ?? '').toLowerCase();
    const idStr = String(p.id ?? '');
    return name.includes(q) || idStr.includes(q);
  });
}
getRelatedItemStatus(productId: number): RelatedItemType | null {
  const item = this.selectedRelatedItems().find(x => x.productId === productId);
  return item ? item.type : null;
}
toggleRelatedItem(productId: number, type: RelatedItemType): void {
  const items = this.selectedRelatedItems();
  const existing = items.find(x => x.productId === productId);

  if (existing) {
    if (existing.type === type) {
      // gleicher Typ -> entfernen
      this.selectedRelatedItems.set(items.filter(x => x.productId !== productId));
    } else {
      // Typ wechseln
      this.selectedRelatedItems.set(
        items.map(x => (x.productId === productId ? { ...x, type } : x))
      );
    }
    return;
  }
   // neu hinzufügen
   this.selectedRelatedItems.set([...items, { productId, type }]);
  }
  removeRelatedItem(productId: number): void {
    this.selectedRelatedItems.set(
      this.selectedRelatedItems().filter(x => x.productId !== productId)
    );
  }
  relatedTypeLabel(type: RelatedItemType): string {
    return type === 'required' ? 'Erforderlich' : 'Empfohlen';
  }

  findProductById(id: number): Product | undefined {
    return (this.products ?? []).find((p: any) => p?.id === id);
  }

  categoryNameById(categoryId: number): string {
    const c = (this.categories ?? []).find(x => x.id === categoryId);
    return c?.name ?? `#${categoryId}`;
  }
}