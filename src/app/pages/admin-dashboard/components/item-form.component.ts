import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { InputNumberModule } from 'primeng/inputnumber';
import { TooltipModule } from 'primeng/tooltip';

import { Item } from '../../../models/item.model';
import { Product } from '../../../models/product.model';

@Component({
  selector: 'app-item-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    ToggleButtonModule,
    InputNumberModule,
    TooltipModule
  ],
  templateUrl: './item-form.component.html',
  styleUrls: ['./item-form.component.scss']
})
export class ItemFormComponent implements OnInit, OnChanges {
  @Input() item: Item | null = null;
  @Input() products: Product[] = [];
  @Input() selectedProduct: Product | null = null;
  @Input() isEditMode = false;
  @Input() generatedInventoryNumbers: string[] = [];

  @Output() formSubmit = new EventEmitter<any>();
  @Output() formCancel = new EventEmitter<void>();
  @Output() inventoryPrefixChange = new EventEmitter<string>();
  @Output() quantityChange = new EventEmitter<number>();
  @Output() ownerIdChange = new EventEmitter<number>();
  @Output() ownerNameChange = new EventEmitter<string>();
  @Output() lenderIdChange = new EventEmitter<number>();
  @Output() lenderNameChange = new EventEmitter<string>();

  itemForm!: FormGroup;
  ownerIdDisplayValue = signal<string>('');
  ownerNameDisplayValue = signal<string>('');
  isLoadingOwnerId = signal<boolean>(false);
  isLoadingOwnerName = signal<boolean>(false);
  ownerFound = signal<boolean>(false);
  lenderDisplayValue = signal<string>('');
  isLoadingLender = signal<boolean>(false);
  lenderFound = signal<boolean>(false);

  constructor(private readonly fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();

    if (!this.isEditMode && this.selectedProduct) {
      this.itemForm.patchValue({ productId: this.selectedProduct.id });
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['item'] && changes['item'].currentValue && this.itemForm) {
      this.loadItemData();
    }

    if (changes['selectedProduct'] && changes['selectedProduct'].currentValue && this.itemForm && !this.isEditMode) {
      this.itemForm.patchValue({ productId: this.selectedProduct!.id });
    }
  }

  private initForm(): void {
    this.itemForm = this.fb.group({
      invNumber: ['', Validators.required],
      ownerId: [null],
      ownerName: ['', Validators.required],
      lenderId: [null, Validators.required],
      lenderName: [''],
      productId: [null, Validators.required],
      available: [true],
      quantity: [1, [Validators.required, Validators.min(1), Validators.max(100)]]
    });
  }

  private loadItemData(): void {
    if (!this.item) return;

    this.itemForm.patchValue({
      invNumber: this.item.invNumber,
      ownerName: this.item.owner,
      lenderId: this.item.lenderId,
      productId: this.item.productId,
      available: this.item.available
    });
  }

  submitForm(): void {
    if (!this.itemForm.valid) return;
    this.formSubmit.emit(this.itemForm.value);
  }

  resetForm(): void {
    this.itemForm.reset({ available: true });
    this.formCancel.emit();
  }

  onInventoryPrefixChange(): void {
    const prefix = this.itemForm.get('invNumber')?.value || '';
    this.inventoryPrefixChange.emit(prefix);
  }

  onQuantityChange(): void {
    const quantity = this.itemForm.get('quantity')?.value || 1;
    this.quantityChange.emit(quantity);
  }

  onOwnerIdChange(): void {
    const ownerId = this.itemForm.get('ownerId')?.value;
    if (ownerId) {
      this.ownerIdChange.emit(ownerId);
    }
  }

  onOwnerNameChange(): void {
    const ownerName = this.itemForm.get('ownerName')?.value?.trim();
    if (ownerName) {
      this.ownerNameChange.emit(ownerName);
    }
  }

  onLenderIdChange(): void {
    const lenderId = this.itemForm.get('lenderId')?.value;
    if (lenderId) {
      this.lenderIdChange.emit(lenderId);
    }
  }

  onLenderNameChange(): void {
    const lenderName = this.itemForm.get('lenderName')?.value?.trim();
    if (lenderName) {
      this.lenderNameChange.emit(lenderName);
    }
  }

  // Public methods for parent to update display values
  setOwnerIdDisplayValue(value: string): void {
    this.ownerIdDisplayValue.set(value);
  }

  setOwnerNameDisplayValue(value: string): void {
    this.ownerNameDisplayValue.set(value);
  }

  setIsLoadingOwnerId(loading: boolean): void {
    this.isLoadingOwnerId.set(loading);
  }

  setIsLoadingOwnerName(loading: boolean): void {
    this.isLoadingOwnerName.set(loading);
  }

  setOwnerFound(found: boolean): void {
    this.ownerFound.set(found);
  }

  setLenderDisplayValue(value: string): void {
    this.lenderDisplayValue.set(value);
  }

  setIsLoadingLender(loading: boolean): void {
    this.isLoadingLender.set(loading);
  }

  setLenderFound(found: boolean): void {
    this.lenderFound.set(found);
  }

  patchOwnerName(name: string): void {
    this.itemForm.patchValue({ ownerName: name }, { emitEvent: false });
  }

  patchOwnerId(id: number): void {
    this.itemForm.patchValue({ ownerId: id }, { emitEvent: false });
  }

  patchLenderName(name: string): void {
    this.itemForm.patchValue({ lenderName: name }, { emitEvent: false });
  }

  patchLenderId(id: number): void {
    this.itemForm.patchValue({ lenderId: id }, { emitEvent: false });
  }
}

