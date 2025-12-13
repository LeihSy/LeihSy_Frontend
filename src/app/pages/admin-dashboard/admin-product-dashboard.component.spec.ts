import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { AdminProductDashboardComponent } from './admin-product-dashboard.component';
import { ItemService } from '../../services/item.service';
import { ProductService } from '../../services/product.service';
import { CategoryService } from '../../services/category.service';
import { LocationService } from '../../services/location.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { of } from 'rxjs';
import { Product } from '../../models/product.model';
import { Category } from '../../models/category.model';
import { Location } from '../../models/location.model';

describe('AdminProductDashboardComponent', () => {
  let component: AdminProductDashboardComponent;
  let fixture: ComponentFixture<AdminProductDashboardComponent>;
  let mockItemService: jasmine.SpyObj<ItemService>;
  let mockProductService: jasmine.SpyObj<ProductService>;
  let mockCategoryService: jasmine.SpyObj<CategoryService>;
  let mockLocationService: jasmine.SpyObj<LocationService>;
  let mockConfirmationService: jasmine.SpyObj<ConfirmationService>;
  let mockMessageService: jasmine.SpyObj<MessageService>;

  const mockCategories: Category[] = [
    { id: 1, name: 'Kamera', deleted: false, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
    { id: 2, name: 'Audio', deleted: false, createdAt: '2024-01-01', updatedAt: '2024-01-01' }
  ];

  const mockLocations: Location[] = [
    { id: 1, roomNr: 'F01.204', deleted: false, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
    { id: 2, roomNr: 'F01.205', deleted: false, createdAt: '2024-01-01', updatedAt: '2024-01-01' }
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
      locationId: 1,
      availableItemCount: 5,
      totalItemCount: 10,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
      deleted: false
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
      locationId: 2,
      availableItemCount: 3,
      totalItemCount: 5,
      createdAt: '2024-01-02',
      updatedAt: '2024-01-02',
      deleted: false
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
      'getProductsWithCategories',
      'getProductById',
      'createProduct',
      'updateProduct',
      'deleteProduct'
    ]);

    mockCategoryService = jasmine.createSpyObj('CategoryService', [
      'getAllCategories',
      'getCategoryById'
    ]);

    mockLocationService = jasmine.createSpyObj('LocationService', [
      'getAllLocations',
      'getLocationById'
    ]);

    mockConfirmationService = jasmine.createSpyObj('ConfirmationService', ['confirm']);
    mockMessageService = jasmine.createSpyObj('MessageService', ['add']);

    mockProductService.getProductsWithCategories.and.returnValue(of(mockProducts));
    mockProductService.getProducts.and.returnValue(of(mockProducts));
    mockCategoryService.getAllCategories.and.returnValue(of(mockCategories));
    mockLocationService.getAllLocations.and.returnValue(of(mockLocations));
    mockItemService.getAllItems.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [
        AdminProductDashboardComponent,
        ReactiveFormsModule
      ],
      providers: [
        { provide: ItemService, useValue: mockItemService },
        { provide: ProductService, useValue: mockProductService },
        { provide: CategoryService, useValue: mockCategoryService },
        { provide: LocationService, useValue: mockLocationService },
        { provide: ConfirmationService, useValue: mockConfirmationService },
        { provide: MessageService, useValue: mockMessageService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminProductDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load products on init', () => {
    expect(mockProductService.getProductsWithCategories).toHaveBeenCalled();
    expect(component.allProducts()).toEqual(mockProducts);
  });


  it('should filter products based on search query', () => {
    component.allProducts.set(mockProducts);
    component.searchQuery.set('camera');

    const filtered = component.filteredProducts();
    expect(filtered.length).toBe(1);
    expect(filtered[0].name).toBe('Test Camera');
  });

  it('should filter products by category name', () => {
    const productsWithCategory = mockProducts.map(p => ({
      ...p,
      category: mockCategories.find(c => c.id === p.categoryId)
    }));
    component.allProducts.set(productsWithCategory as Product[]);
    component.searchQuery.set('audio');

    const filtered = component.filteredProducts();
    expect(filtered.length).toBe(1);
    expect(filtered[0].category?.name).toBe('Audio');
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

  it('should initialize with empty searchQuery', () => {
    expect(component.searchQuery()).toBe('');
  });


  it('should be a standalone component', () => {
    const componentMetadata = (AdminProductDashboardComponent as any).ɵcmp;
    expect(componentMetadata.standalone).toBe(true);
  });

  it('should have correct selector', () => {
    const componentMetadata = (AdminProductDashboardComponent as any).ɵcmp;
    expect(componentMetadata.selectors[0][0]).toBe('app-admin-dashboard');
  });

  it('should handle empty search query', () => {
    component.allProducts.set(mockProducts);
    component.searchQuery.set('');

    const filtered = component.filteredProducts();
    expect(filtered.length).toBe(2);
  });

  it('should handle no results search', () => {
    component.allProducts.set(mockProducts);
    component.searchQuery.set('nonexistent product');

    const filtered = component.filteredProducts();
    expect(filtered.length).toBe(0);
  });

  it('should search case-insensitively', () => {
    component.allProducts.set(mockProducts);
    component.searchQuery.set('CAMERA');

    const filtered = component.filteredProducts();
    expect(filtered.length).toBe(1);
  });

  it('should filter by description', () => {
    component.allProducts.set(mockProducts);
    component.searchQuery.set('microphone');

    const filtered = component.filteredProducts();
    expect(filtered.length).toBe(1);
    expect(filtered[0].description).toContain('microphone');
  });

  it('should have all required columns', () => {
    expect(component.columns.length).toBeGreaterThanOrEqual(5);
    expect(component.columns.some(c => c.field === 'name')).toBe(true);
    expect(component.columns.some(c => c.field === 'categoryName')).toBe(true);
    expect(component.columns.some(c => c.field === 'price')).toBe(true);
  });

  describe('Filter Branches - Coverage', () => {
    beforeEach(() => {
      component.allProducts.set(mockProducts);
    });

    it('should filter by name (first branch)', () => {
      component.searchQuery.set('Camera');
      const filtered = component.filteredProducts();
      expect(filtered.length).toBe(1);
      expect(filtered[0].name).toContain('Camera');
    });

    it('should filter by description (second branch)', () => {
      component.searchQuery.set('microphone');
      const filtered = component.filteredProducts();
      expect(filtered.length).toBe(1);
      expect(filtered[0].description).toContain('microphone');
    });

    it('should filter by category name (third branch)', () => {
      const productsWithCategory = mockProducts.map(p => ({
        ...p,
        category: mockCategories.find(c => c.id === p.categoryId)
      }));
      component.allProducts.set(productsWithCategory as any);
      component.searchQuery.set('Kamera');

      const filtered = component.filteredProducts();
      expect(filtered.some(p => p.category?.name.includes('Kamera'))).toBe(true);
    });

    it('should return all when query is empty (early return branch)', () => {
      component.searchQuery.set('');
      const filtered = component.filteredProducts();
      expect(filtered.length).toBe(2);
    });

    it('should return empty when no matches (all branches false)', () => {
      component.searchQuery.set('nonexistentproduct123');
      const filtered = component.filteredProducts();
      expect(filtered.length).toBe(0);
    });

    it('should handle products without category (category branch)', () => {
      const productsWithoutCategory = mockProducts.map(p => ({ ...p, category: undefined }));
      component.allProducts.set(productsWithoutCategory as any);
      component.searchQuery.set('test');

      const filtered = component.filteredProducts();
      expect(filtered).toBeDefined();
    });
  });
});

