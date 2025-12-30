import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputNumberModule } from 'primeng/inputnumber';
import { TooltipModule } from 'primeng/tooltip';

import { Item } from '../../../../models/item.model';
import { Product } from '../../../../models/product.model';
import { FormRowComponent } from '../../form-row/form-row.component';
import { FormInputFieldComponent } from '../../form-input-field/form-input-field.component';
import { RadioButtonGroupComponent, RadioOption } from '../../radio-button-group/radio-button-group.component';
import { ValidationMessageComponent } from '../../validation-message/validation-message.component';

@Component({
  selector: 'app-item-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    RadioButtonModule,
    InputNumberModule,
    TooltipModule,
    FormRowComponent,
    FormInputFieldComponent,
    RadioButtonGroupComponent,
    ValidationMessageComponent
  ],
  templateUrl: './item-form.component.html',
  styleUrls: ['./item-form.component.scss']
})
export class ItemFormComponent implements OnInit, OnChanges {
  @Input() item: Item | null = null;
  @Input() products: Product[] = [];
  @Input() selectedProduct: Product | null = null;
  @Input() mode: 'admin' | 'private' = 'admin';
  @Input() isEditMode = false;
  @Input() generatedInventoryNumbers: string[] = [];

  @Output() formSubmit = new EventEmitter<any>();

  // Radio button options
  availabilityOptions: RadioOption[] = [
    { label: 'Verfügbar', value: true, id: 'available-yes' },
    { label: 'Nicht verfügbar', value: false, id: 'available-no' }
  ];
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

  availabilityValue: boolean = true;

  constructor(private readonly fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();

    if (!this.isEditMode && this.selectedProduct) {
      this.itemForm.patchValue({ productId: this.selectedProduct.id });
    }

    this.updateRadioButtonValue();
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
    // In private mode owner and lender fields are not required/visible and inventory number prefix will be PRV
    this.itemForm = this.fb.group({
      invNumber: ['', Validators.required],
      ownerId: [null],
      ownerName: ['', this.mode === 'admin' ? Validators.required : []],
      lenderId: [null, this.mode === 'admin' ? Validators.required : []],
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
      available: this.item.isAvailable
    });

    this.updateRadioButtonValue();
  }

  submitForm(): void {
    if (!this.itemForm.valid) return;
    const value = { ...this.itemForm.value };
    if (this.mode === 'private') {
      // Ensure inventory number format PRV-...
      const inv = value.invNumber || Date.now().toString();
      value.invNumber = inv.toString().startsWith('PRV') ? inv : `PRV-${inv}`;
    }
    this.formSubmit.emit({ ...value, privateMode: this.mode === 'private' });
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

  onAvailableChange(value: boolean): void {
    this.availabilityValue = value;
    this.itemForm.patchValue({ available: value });
  }

  private updateRadioButtonValue(): void {
    const currentValue = this.itemForm.get('available')?.value;
    this.availabilityValue = currentValue ?? true;
  }
}

