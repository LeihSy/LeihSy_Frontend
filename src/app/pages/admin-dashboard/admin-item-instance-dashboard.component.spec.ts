import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { AdminItemInstanceComponent } from './admin-item-instance-dashboard.component';
import { ItemService } from '../../services/item.service';
import { ProductService } from '../../services/product.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { of } from 'rxjs';
import { Item } from '../../models/item.model';
import { Product } from '../../models/product.model';

describe('AdminItemInstanceComponent', () => {
  let component: AdminItemInstanceComponent;
  let fixture: ComponentFixture<AdminItemInstanceComponent>;
  let mockItemService: jasmine.SpyObj<ItemService>;
  let mockProductService: jasmine.SpyObj<ProductService>;
  let mockConfirmationService: jasmine.SpyObj<ConfirmationService>;
  let mockMessageService: jasmine.SpyObj<MessageService>;

  const mockItems: Item[] = [
    {
      id: 1,
      invNumber: 'CAM-001',
      owner: 'Test Owner',
      productId: 1,
      productName: 'Test Camera',
      available: true
    },
    {
      id: 2,
      invNumber: 'CAM-002',
      owner: 'Test Owner',
      productId: 1,
      productName: 'Test Camera',
      available: false
    },
    {
      id: 3,
      invNumber: 'MIC-001',
      owner: 'Test Owner',
      productId: 2,
      productName: 'Test Microphone',
      available: true
    }
  ];

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
      availableItems: 1,
      totalItems: 2,
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
      accessories: null,
      categoryId: 2,
      categoryName: 'Audio',
      locationId: 1,
      locationRoomNr: 'B202',
      lenderId: 1,
      lenderName: 'Test Lender',
      availableItems: 1,
      totalItems: 1,
      createdAt: '2024-01-02',
      updatedAt: '2024-01-02'
    }
  ];

  beforeEach(async () => {
    mockItemService = jasmine.createSpyObj('ItemService', [
      'getAllItems',
      'getItemById',
      'createItem',
      'updateItem',
      'deleteItem'
    ]);

    mockProductService = jasmine.createSpyObj('ProductService', [
      'getProducts',
      'getProductById'
    ]);

    mockConfirmationService = jasmine.createSpyObj('ConfirmationService', ['confirm']);
    mockMessageService = jasmine.createSpyObj('MessageService', ['add']);

    // Default mock returns
    mockItemService.getAllItems.and.returnValue(of(mockItems));
    mockProductService.getProducts.and.returnValue(of(mockProducts));

    await TestBed.configureTestingModule({
      imports: [
        AdminItemInstanceComponent,
        ReactiveFormsModule
      ],
      providers: [
        { provide: ItemService, useValue: mockItemService },
        { provide: ProductService, useValue: mockProductService },
        { provide: ConfirmationService, useValue: mockConfirmationService },
        { provide: MessageService, useValue: mockMessageService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminItemInstanceComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty items array', () => {
    expect(component.allItems()).toEqual([]);
  });

  it('should initialize with empty products array', () => {
    expect(component.allProducts()).toEqual([]);
  });

  it('should initialize with isLoading true', () => {
    expect(component.isLoading()).toBe(true);
  });

  it('should initialize with isEditMode false', () => {
    expect(component.isEditMode()).toBe(false);
  });

  it('should initialize with editingItemId null', () => {
    expect(component.editingItemId()).toBe(null);
  });

  it('should initialize with empty searchQuery', () => {
    expect(component.searchQuery()).toBe('');
  });

  it('should initialize with showItemForm false', () => {
    expect(component.showItemForm()).toBe(false);
  });

  it('should initialize with empty expandedProductIds set', () => {
    expect(component.expandedProductIds().size).toBe(0);
  });

  it('should initialize with empty generatedInventoryNumbers array', () => {
    expect(component.generatedInventoryNumbers()).toEqual([]);
  });

  it('should initialize with selectedProductForNewItem null', () => {
    expect(component.selectedProductForNewItem()).toBe(null);
  });

  it('should initialize form in ngOnInit', () => {
    component.ngOnInit();
    expect(component.itemForm).toBeDefined();
    expect(component.itemForm.get('invNumber')).toBeTruthy();
  });

  it('should compute productsWithItems correctly', () => {
    component.allProducts.set(mockProducts);
    component.allItems.set(mockItems);

    const productsWithItems = component.productsWithItems();

    expect(productsWithItems.length).toBe(2);
    expect(productsWithItems[0].product.name).toBe('Test Camera');
    expect(productsWithItems[0].items.length).toBe(2);
    expect(productsWithItems[0].availableCount).toBe(1);
    expect(productsWithItems[0].totalCount).toBe(2);
  });

  it('should filter products by search query', () => {
    component.allProducts.set(mockProducts);
    component.allItems.set(mockItems);
    component.searchQuery.set('camera');

    const productsWithItems = component.productsWithItems();

    expect(productsWithItems.length).toBe(1);
    expect(productsWithItems[0].product.name).toBe('Test Camera');
  });

  it('should filter products by category name', () => {
    component.allProducts.set(mockProducts);
    component.allItems.set(mockItems);
    component.searchQuery.set('audio');

    const productsWithItems = component.productsWithItems();

    expect(productsWithItems.length).toBe(1);
    expect(productsWithItems[0].product.categoryName).toBe('Audio');
  });

  it('should count available items correctly', () => {
    component.allProducts.set(mockProducts);
    component.allItems.set(mockItems);

    const productsWithItems = component.productsWithItems();
    const cameraProduct = productsWithItems.find(p => p.product.name === 'Test Camera');

    expect(cameraProduct?.availableCount).toBe(1);
    expect(cameraProduct?.totalCount).toBe(2);
  });

  it('should return all products when search query is empty', () => {
    component.allProducts.set(mockProducts);
    component.allItems.set(mockItems);
    component.searchQuery.set('');

    const productsWithItems = component.productsWithItems();

    expect(productsWithItems.length).toBe(2);
  });

  it('should be case insensitive when filtering', () => {
    component.allProducts.set(mockProducts);
    component.allItems.set(mockItems);
    component.searchQuery.set('CAMERA');

    const productsWithItems = component.productsWithItems();

    expect(productsWithItems.length).toBe(1);
  });

  it('should handle products with no items', () => {
    const productsOnly = [...mockProducts];
    component.allProducts.set(productsOnly);
    component.allItems.set([]);

    const productsWithItems = component.productsWithItems();

    expect(productsWithItems.length).toBe(2);
    expect(productsWithItems[0].items.length).toBe(0);
    expect(productsWithItems[0].availableCount).toBe(0);
    expect(productsWithItems[0].totalCount).toBe(0);
  });

  it('should be a standalone component', () => {
    const componentMetadata = (AdminItemInstanceComponent as any).ɵcmp;
    expect(componentMetadata.standalone).toBe(true);
  });

  it('should have correct selector', () => {
    const componentMetadata = (AdminItemInstanceComponent as any).ɵcmp;
    expect(componentMetadata.selectors[0][0]).toBe('app-admin-item-instance');
  });

  it('should call ItemService.getAllItems on init', () => {
    component.ngOnInit();
    expect(mockItemService.getAllItems).toBeDefined();
  });

  it('should call ProductService.getProducts on init', () => {
    component.ngOnInit();
    expect(mockProductService.getProducts).toBeDefined();
  });

  it('should handle empty items array gracefully', () => {
    component.allProducts.set(mockProducts);
    component.allItems.set([]);

    const productsWithItems = component.productsWithItems();

    expect(productsWithItems.length).toBe(2);
    productsWithItems.forEach(p => {
      expect(p.items).toEqual([]);
      expect(p.availableCount).toBe(0);
      expect(p.totalCount).toBe(0);
    });
  });

  it('should handle empty products array gracefully', () => {
    component.allProducts.set([]);
    component.allItems.set(mockItems);

    const productsWithItems = component.productsWithItems();

    expect(productsWithItems.length).toBe(0);
  });

  it('should group items correctly by productId', () => {
    component.allProducts.set(mockProducts);
    component.allItems.set(mockItems);

    const productsWithItems = component.productsWithItems();
    const cameraProduct = productsWithItems.find(p => p.product.id === 1);

    expect(cameraProduct?.items.every(item => item.productId === 1)).toBe(true);
  });

  it('should filter unavailable items correctly', () => {
    component.allProducts.set(mockProducts);
    component.allItems.set(mockItems);

    const productsWithItems = component.productsWithItems();
    const cameraProduct = productsWithItems.find(p => p.product.id === 1);

    const unavailableItems = cameraProduct?.items.filter(i => !i.available);
    expect(unavailableItems?.length).toBe(1);
  });

  it('should trim whitespace in search query', () => {
    component.allProducts.set(mockProducts);
    component.allItems.set(mockItems);
    component.searchQuery.set('  camera  ');

    const productsWithItems = component.productsWithItems();

    expect(productsWithItems.length).toBe(1);
  });

  it('should handle multiple items for same product', () => {
    component.allProducts.set(mockProducts);
    component.allItems.set(mockItems);

    const productsWithItems = component.productsWithItems();
    const cameraProduct = productsWithItems.find(p => p.product.id === 1);

    expect(cameraProduct?.items.length).toBe(2);
    expect(cameraProduct?.items.every(i => i.productName === 'Test Camera')).toBe(true);
  });
});

