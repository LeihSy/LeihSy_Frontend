import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { AdminProductDashboardComponent } from './admin-product-dashboard.component';
import { ItemService } from '../../services/item.service';
import { ProductService } from '../../services/product.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { of } from 'rxjs';
import { Product } from '../../models/product.model';

describe('AdminProductDashboardComponent', () => {
  let component: AdminProductDashboardComponent;
  let fixture: ComponentFixture<AdminProductDashboardComponent>;
  let mockItemService: jasmine.SpyObj<ItemService>;
  let mockProductService: jasmine.SpyObj<ProductService>;
  let mockConfirmationService: jasmine.SpyObj<ConfirmationService>;
  let mockMessageService: jasmine.SpyObj<MessageService>;

  const mockProducts: Product[] = [
    {
      id: 1,
      name: 'Test Camera',
      description: 'A test camera',
      expiryDate: 30,
      price: 100,
      imageUrl: 'test.jpg',
      accessories: null,
      categoryId: 1,
      categoryName: 'Kamera',
      locationId: 1,
      locationRoomNr: 'A101',
      lenderId: 1,
      lenderName: 'Test Lender',
      availableItems: 5,
      totalItems: 10,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: 2,
      name: 'Test Microphone',
      description: 'A test microphone',
      expiryDate: 14,
      price: 50,
      imageUrl: null,
      accessories: '["Cable", "Stand"]',
      categoryId: 2,
      categoryName: 'Audio',
      locationId: 1,
      locationRoomNr: 'B202',
      lenderId: 1,
      lenderName: 'Test Lender',
      availableItems: 3,
      totalItems: 5,
      createdAt: '2024-01-02',
      updatedAt: '2024-01-02'
    }
  ];

  beforeEach(async () => {
    mockItemService = jasmine.createSpyObj('ItemService', [
      'getAllItems',
      'createItem',
      'updateItem',
      'deleteItem'
    ]);

    mockProductService = jasmine.createSpyObj('ProductService', [
      'getProducts',
      'getProductById',
      'createProduct',
      'updateProduct',
      'deleteProduct'
    ]);

    mockConfirmationService = jasmine.createSpyObj('ConfirmationService', ['confirm']);
    mockMessageService = jasmine.createSpyObj('MessageService', ['add']);

    mockProductService.getProducts.and.returnValue(of([]));
    mockItemService.getAllItems.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [
        AdminProductDashboardComponent,
        ReactiveFormsModule
      ],
      providers: [
        { provide: ItemService, useValue: mockItemService },
        { provide: ProductService, useValue: mockProductService },
        { provide: ConfirmationService, useValue: mockConfirmationService },
        { provide: MessageService, useValue: mockMessageService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminProductDashboardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty products array', () => {
    expect(component.allProducts()).toEqual([]);
  });

  it('should initialize form with correct validators', () => {
    expect(component.itemForm).toBeDefined();
    expect(component.itemForm.get('name')).toBeTruthy();
    expect(component.itemForm.get('categoryId')).toBeTruthy();
    expect(component.itemForm.get('locationId')).toBeTruthy();
  });

  it('should have categories array with 6 items', () => {
    expect(component.categories.length).toBe(6);
    expect(component.categories[0].name).toBe('Kamera');
    expect(component.categories[5].name).toBe('Zubehör');
  });

  it('should filter products based on search query', () => {
    component.allProducts.set(mockProducts);
    component.searchQuery.set('camera');

    const filtered = component.filteredProducts();
    expect(filtered.length).toBe(1);
    expect(filtered[0].name).toBe('Test Camera');
  });

  it('should filter products by category name', () => {
    component.allProducts.set(mockProducts);
    component.searchQuery.set('audio');

    const filtered = component.filteredProducts();
    expect(filtered.length).toBe(1);
    expect(filtered[0].categoryName).toBe('Audio');
  });

  it('should return all products when search query is empty', () => {
    component.allProducts.set(mockProducts);
    component.searchQuery.set('');

    const filtered = component.filteredProducts();
    expect(filtered.length).toBe(2);
  });

  it('should filter products by description', () => {
    component.allProducts.set(mockProducts);
    component.searchQuery.set('microphone');

    const filtered = component.filteredProducts();
    expect(filtered.length).toBe(1);
    expect(filtered[0].description).toContain('microphone');
  });

  it('should be case insensitive when filtering', () => {
    component.allProducts.set(mockProducts);
    component.searchQuery.set('CAMERA');

    const filtered = component.filteredProducts();
    expect(filtered.length).toBe(1);
  });

  it('should initialize with isLoading false', () => {
    expect(component.isLoading()).toBe(false);
  });

  it('should initialize with isEditMode false', () => {
    expect(component.isEditMode()).toBe(false);
  });

  it('should initialize with editingProductId null', () => {
    expect(component.editingProductId()).toBe(null);
  });

  it('should initialize with empty searchQuery', () => {
    expect(component.searchQuery()).toBe('');
  });

  it('should initialize with selectedFile null', () => {
    expect(component.selectedFile()).toBe(null);
  });

  it('should initialize with imagePreview null', () => {
    expect(component.imagePreview()).toBe(null);
  });

  it('should be a standalone component', () => {
    const componentMetadata = (AdminProductDashboardComponent as any).ɵcmp;
    expect(componentMetadata.standalone).toBe(true);
  });

  it('should have correct selector', () => {
    const componentMetadata = (AdminProductDashboardComponent as any).ɵcmp;
    expect(componentMetadata.selectors[0][0]).toBe('app-admin-dashboard');
  });

  it('should require name field in form', () => {
    const nameControl = component.itemForm.get('name');
    expect(nameControl?.hasError('required')).toBe(true);

    nameControl?.setValue('Test Product');
    expect(nameControl?.hasError('required')).toBe(false);
  });

  it('should require categoryId field in form', () => {
    const categoryControl = component.itemForm.get('categoryId');
    expect(categoryControl?.hasError('required')).toBe(true);

    categoryControl?.setValue(1);
    expect(categoryControl?.hasError('required')).toBe(false);
  });

  it('should require price to be non-negative', () => {
    const priceControl = component.itemForm.get('price');
    priceControl?.setValue(-10);
    expect(priceControl?.hasError('min')).toBe(true);

    priceControl?.setValue(0);
    expect(priceControl?.hasError('min')).toBe(false);

    priceControl?.setValue(100);
    expect(priceControl?.hasError('min')).toBe(false);
  });

  it('should require expiryDate to be at least 1', () => {
    const expiryControl = component.itemForm.get('expiryDate');
    expiryControl?.setValue(0);
    expect(expiryControl?.hasError('min')).toBe(true);

    expiryControl?.setValue(1);
    expect(expiryControl?.hasError('min')).toBe(false);
  });

  it('should trim whitespace in search query', () => {
    component.allProducts.set(mockProducts);
    component.searchQuery.set('  camera  ');

    const filtered = component.filteredProducts();
    expect(filtered.length).toBe(1);
  });

  it('should handle empty product array gracefully', () => {
    component.allProducts.set([]);
    component.searchQuery.set('test');

    const filtered = component.filteredProducts();
    expect(filtered.length).toBe(0);
  });
});

